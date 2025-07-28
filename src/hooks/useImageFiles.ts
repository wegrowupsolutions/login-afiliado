import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserBucket } from '@/hooks/useUserBucket';

export interface ImageFile {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_size?: number;
  width?: number;
  height?: number;
  thumbnail_url?: string;
  category: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useImageFiles = () => {
  const { toast } = useToast();
  const { uploadFileToUserBucket } = useUserBucket();
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch image files from Supabase
  const fetchImageFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('image_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching image files:', error);
        toast({
          title: "Erro ao carregar imagens",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setImageFiles((data || []) as ImageFile[]);
    } catch (err) {
      console.error('Unexpected error fetching image files:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar as imagens.",
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
    fetchImageFiles();
    toast({
      title: "Atualizando imagens",
      description: "As imagens estão sendo atualizadas do banco de dados.",
    });
  };

  // Upload image file to Supabase Storage and save metadata
  const uploadImageFile = async (file: File, category: string) => {
    try {
      console.log('Iniciando upload da imagem:', file.name, 'categoria:', category);
      
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
      const publicUrl = await uploadFileToUserBucket(file, 'images');
      if (!publicUrl) {
        throw new Error('Falha no upload para o bucket do usuário');
      }

      console.log('URL pública gerada:', publicUrl);

      // Save image metadata to database
      const insertData = {
        title: file.name,
        file_url: publicUrl,
        file_size: file.size,
        category: category,
        user_id: user.id
      };

      console.log('Dados para inserir no banco:', insertData);

      const { data: imageData, error: imageError } = await supabase
        .from('image_files')
        .insert(insertData)
        .select()
        .single();

      if (imageError) {
        console.error('Erro ao inserir no banco:', imageError);
        throw new Error(`Erro ao salvar no banco: ${imageError.message}`);
      }

      console.log('Imagem salva no banco com sucesso:', imageData);
      
      // Refresh the image list
      await fetchImageFiles();
      
      toast({
        title: "Imagem adicionada",
        description: `${file.name} foi adicionada com sucesso!`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar a imagem:', error);
      
      toast({
        title: "Erro ao enviar imagem",
        description: error instanceof Error ? error.message : "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Delete image file
  const handleDeleteImageFile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('image_files')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting image file:', error);
        toast({
          title: "Erro ao excluir imagem",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setImageFiles(imageFiles.filter(file => file.id !== id));
      
      toast({
        title: "Imagem excluída",
        description: "A imagem foi removida com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error deleting image file:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível excluir a imagem.",
        variant: "destructive",
      });
    }
  };

  // Clear all image files
  const clearAllImageFiles = async () => {
    try {
      const { error } = await supabase
        .from('image_files')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (error) {
        throw new Error(`Erro ao limpar imagens: ${error.message}`);
      }

      setImageFiles([]);
      
      toast({
        title: "Imagens limpas",
        description: "Todas as imagens foram removidas com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error clearing image files:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível limpar as imagens.",
        variant: "destructive",
      });
    }
  };

  // Load image files on hook initialization
  useEffect(() => {
    fetchImageFiles();
  }, []);

  return {
    imageFiles,
    isLoading,
    isRefreshing,
    fetchImageFiles,
    handleRefresh,
    uploadImageFile,
    handleDeleteImageFile,
    clearAllImageFiles
  };
};