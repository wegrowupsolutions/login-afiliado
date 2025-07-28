import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemConfiguration {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export const useSystemConfigurations = () => {
  const [configurations, setConfigurations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Fetch configurations
  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*');

      if (error) throw error;

      const configMap = data?.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, string>) || {};

      setConfigurations(configMap);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const adminEmails = ['viniciushtx@gmail.com', 'rfreitasdc@gmail.com', 'teste@gmail.com'];
        setIsAdmin(adminEmails.includes(user.email));
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  // Update configuration
  const updateConfiguration = async (key: string, value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          key,
          value,
          updated_by: user?.id
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      // Update local state
      setConfigurations(prev => ({ ...prev, [key]: value }));
      
      return true;
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast({
        title: "Erro ao salvar configuração",
        description: "Não foi possível salvar a configuração.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchConfigurations();
    checkAdminStatus();
  }, []);

  return {
    configurations,
    loading,
    isAdmin,
    updateConfiguration,
    refetch: fetchConfigurations
  };
};

// Função utilitária para buscar uma configuração específica
export const getSystemConfiguration = async (key: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', key)
      .single();

    if (error) throw error;
    return data?.value || null;
  } catch (error) {
    console.error(`Error fetching configuration ${key}:`, error);
    return null;
  }
};

// Função utilitária para buscar múltiplas configurações
export const getSystemConfigurations = async (keys: string[]): Promise<Record<string, string>> => {
  try {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('key, value')
      .in('key', keys);

    if (error) throw error;
    
    return data?.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>) || {};
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return {};
  }
};