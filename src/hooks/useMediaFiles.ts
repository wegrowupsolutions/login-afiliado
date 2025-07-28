import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface MediaFile {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: 'video' | 'image' | 'audio' | 'document';
  file_size?: number;
  duration?: number;
  thumbnail_url?: string;
  category: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useMediaFiles = () => {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch media files from Supabase
  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true);
      
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        toast({
          title: "Erro de autenticação",
          description: "Faça login para ver seus arquivos.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .eq('user_id', user.id) // Explicit filter by user ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media files:', error);
        toast({
          title: "Erro ao carregar arquivos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setMediaFiles((data || []) as MediaFile[]);
    } catch (err) {
      console.error('Unexpected error fetching media files:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os arquivos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMediaFiles();
    toast({
      title: "Atualizando arquivos",
      description: "Os arquivos estão sendo atualizados do banco de dados.",
    });
  };

  // Add new media file
  const addMediaFile = async (mediaFile: Omit<MediaFile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para adicionar arquivos.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('media_files')
        .insert([{
          ...mediaFile,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error adding media file:', error);
        toast({
          title: "Erro ao adicionar arquivo",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchMediaFiles();
      toast({
        title: "Arquivo adicionado",
        description: `${mediaFile.title} foi adicionado com sucesso!`,
      });
      
      return true;
    } catch (err) {
      console.error('Unexpected error adding media file:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível adicionar o arquivo.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete media file
  const handleDeleteMediaFile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting media file:', error);
        toast({
          title: "Erro ao excluir arquivo",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setMediaFiles(mediaFiles.filter(file => file.id !== id));
      
      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error deleting media file:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir o arquivo.",
        variant: "destructive",
      });
    }
  };

  // Clear all media files
  const clearAllMediaFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para limpar os arquivos.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing media files:', error);
        toast({
          title: "Erro ao limpar arquivos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setMediaFiles([]);
      
      toast({
        title: "Arquivos limpos",
        description: "Todos os arquivos foram removidos com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error clearing media files:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível limpar os arquivos.",
        variant: "destructive",
      });
    }
  };

  // Load media files on hook initialization
  useEffect(() => {
    fetchMediaFiles();
  }, []);

  return {
    mediaFiles,
    isLoading,
    isRefreshing,
    fetchMediaFiles,
    handleRefresh,
    addMediaFile,
    handleDeleteMediaFile,
    clearAllMediaFiles
  };
};