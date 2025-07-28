import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserBucket } from '@/hooks/useUserBucket';

export interface AudioFile {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_size?: number;
  duration?: number;
  bitrate?: number;
  sample_rate?: number;
  channels?: number;
  thumbnail_url?: string;
  category: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useAudioFiles = () => {
  const { toast } = useToast();
  const { uploadFileToUserBucket } = useUserBucket();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch audio files from Supabase
  const fetchAudioFiles = async () => {
    try {
      setIsLoading(true);
      
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        toast({
          title: "Erro de autenticação",
          description: "Faça login para ver seus áudios.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('audio_files')
        .select('*')
        .eq('user_id', user.id) // Explicit filter by user ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching audio files:', error);
        toast({
          title: "Erro ao carregar áudios",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAudioFiles((data || []) as AudioFile[]);
    } catch (err) {
      console.error('Unexpected error fetching audio files:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os áudios.",
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
    fetchAudioFiles();
    toast({
      title: "Atualizando áudios",
      description: "Os áudios estão sendo atualizados do banco de dados.",
    });
  };

  // Upload audio file to Supabase Storage and save metadata
  const uploadAudioFile = async (file: File, category: string) => {
    try {
      console.log('Iniciando upload do áudio:', file.name, 'categoria:', category);
      
      // Get current user FIRST
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Erro ao obter usuário:', userError);
        throw new Error(`Erro de autenticação: ${userError.message}`);
      }
      
      if (!user) {
        console.error('Usuário não encontrado');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('Usuário autenticado:', user.id);
      
      // Upload to user's personal bucket
      const publicUrl = await uploadFileToUserBucket(file, 'audio');
      if (!publicUrl) {
        throw new Error('Falha no upload para o bucket do usuário');
      }

      console.log('URL pública gerada:', publicUrl);

      // Save audio metadata to database
      const insertData = {
        title: file.name,
        file_url: publicUrl,
        file_size: file.size,
        category: category,
        user_id: user.id
      };

      console.log('Dados para inserir no banco:', insertData);

      const { data: audioData, error: audioError } = await supabase
        .from('audio_files')
        .insert(insertData)
        .select()
        .single();

      if (audioError) {
        console.error('Erro ao inserir no banco:', audioError);
        throw new Error(`Erro ao salvar no banco: ${audioError.message}`);
      }

      console.log('Áudio salvo no banco com sucesso:', audioData);
      
      // Refresh the audio list
      await fetchAudioFiles();
      
      toast({
        title: "Áudio adicionado",
        description: `${file.name} foi adicionado com sucesso!`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar o áudio:', error);
      
      toast({
        title: "Erro ao enviar áudio",
        description: error instanceof Error ? error.message : "Não foi possível enviar o áudio.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Delete audio file
  const handleDeleteAudioFile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('audio_files')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting audio file:', error);
        toast({
          title: "Erro ao excluir áudio",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setAudioFiles(audioFiles.filter(file => file.id !== id));
      
      toast({
        title: "Áudio excluído",
        description: "O áudio foi removido com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error deleting audio file:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir o áudio.",
        variant: "destructive",
      });
    }
  };

  // Clear all audio files
  const clearAllAudioFiles = async () => {
    try {
      const { error } = await supabase
        .from('audio_files')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        throw new Error(`Erro ao limpar áudios: ${error.message}`);
      }

      setAudioFiles([]);
      
      toast({
        title: "Áudios limpos",
        description: "Todos os áudios foram removidos com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error clearing audio files:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível limpar os áudios.",
        variant: "destructive",
      });
    }
  };

  // Load audio files on hook initialization
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  return {
    audioFiles,
    isLoading,
    isRefreshing,
    fetchAudioFiles,
    handleRefresh,
    uploadAudioFile,
    handleDeleteAudioFile,
    clearAllAudioFiles
  };
};