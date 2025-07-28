import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserBucket = () => {
  const { toast } = useToast();
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);

  const getUserBucket = async (): Promise<string | null> => {
    try {
      setIsCreatingBucket(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erro ao obter usuário:', userError);
        toast({
          title: "Erro de autenticação",
          description: "Faça login novamente.",
          variant: "destructive",
        });
        return null;
      }

      // Call edge function to manage user bucket
      const { data, error } = await supabase.functions.invoke('manage-user-bucket');

      if (error) {
        console.error('Erro ao gerenciar bucket:', error);
        toast({
          title: "Erro ao criar/gerenciar bucket",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        console.error('Falha ao gerenciar bucket:', data.error);
        toast({
          title: "Erro ao gerenciar bucket",
          description: data.error,
          variant: "destructive",
        });
        return null;
      }

      console.log('Bucket do usuário:', data.bucketName);
      return data.bucketName;

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível gerenciar o bucket do usuário.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreatingBucket(false);
    }
  };

  const uploadFileToUserBucket = async (
    file: File, 
    fileType: 'documents' | 'images' | 'audio' | 'videos'
  ): Promise<string | null> => {
    try {
      // Get or create user bucket
      const userBucket = await getUserBucket();
      if (!userBucket) {
        return null;
      }

      // Get current user for folder structure
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      // Create file path with type organization
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${fileType}/${timestamp}_${file.name}`;

      console.log('Fazendo upload para bucket do usuário:', userBucket, fileName);

      // Upload to user's bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(userBucket)
        .upload(fileName, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no upload",
          description: uploadError.message,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(userBucket)
        .getPublicUrl(fileName);

      console.log('Upload concluído, URL:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Erro no upload para bucket do usuário:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    getUserBucket,
    uploadFileToUserBucket,
    isCreatingBucket
  };
};