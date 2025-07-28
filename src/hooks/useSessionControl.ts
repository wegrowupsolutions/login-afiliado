import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSessionControl = () => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Verificar sessões ativas a cada 30 segundos
    const checkActiveSessions = async () => {
      try {
        const { data: sessions } = await supabase
          .from('active_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        // Se há mais de uma sessão ativa, deslogar
        if (sessions && sessions.length > 1) {
          console.log('Múltiplas sessões detectadas, fazendo logout...');
          await signOut();
        }
      } catch (error) {
        console.error('Erro ao verificar sessões:', error);
      }
    };

    // Verificar imediatamente
    checkActiveSessions();

    // Configurar verificação periódica
    const interval = setInterval(checkActiveSessions, 30000);

    return () => clearInterval(interval);
  }, [user, signOut]);
};