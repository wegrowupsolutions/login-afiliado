import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserBucket } from '@/hooks/useUserBucket';

// Document type definition
export interface Document {
  id: string | number;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  category: string;
  titulo?: string | null;
  metadata?: Record<string, any> | null;
}

export const useDocuments = () => {
  const { toast } = useToast();
  const { uploadFileToUserBucket } = useUserBucket();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Safe way to extract values from metadata
  const getMetadataValue = (metadata: any, key: string, defaultValue: string): string => {
    if (typeof metadata === 'object' && metadata !== null && key in metadata) {
      return String(metadata[key]) || defaultValue;
    }
    return defaultValue;
  };

  // Fetch documents from Supabase
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Get current user first
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        toast({
          title: "Erro de autenticação",
          description: "Faça login para ver seus documentos.",
          variant: "destructive",
        });
        return;
      }

      // Select all relevant columns from the documents table with explicit user filter
      const { data, error } = await supabase
        .from('documents')
        .select('id, titulo, arquivo_url, tamanho_arquivo, tipo, created_at')
        .eq('user_id', user.id) // Explicit filter by user ID
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Erro ao carregar documentos",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match our Document interface
      const formattedDocs: Document[] = data.map((doc) => {
        return {
          id: doc.id as any, // Use the actual UUID as string
          name: doc.titulo,
          type: doc.tipo || 'documento',
          size: doc.tamanho_arquivo ? `${(doc.tamanho_arquivo / 1024).toFixed(1)} KB` : 'Desconhecido',
          category: 'Documento',
          uploadedAt: new Date(doc.created_at).toISOString().split('T')[0],
          titulo: doc.titulo,
          metadata: { url: doc.arquivo_url },
        };
      });

      setDocuments(formattedDocs);
    } catch (err) {
      console.error('Unexpected error fetching documents:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os documentos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter documents to keep only unique titulo entries
  const filterUniqueByTitle = (docs: Document[]): Document[] => {
    const uniqueTitles = new Set<string>();
    return docs.filter(doc => {
      const title = doc.titulo || doc.name;
      if (uniqueTitles.has(title)) {
        return false;
      }
      uniqueTitles.add(title);
      return true;
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDocuments();
    toast({
      title: "Atualizando documentos",
      description: "Os documentos estão sendo atualizados do banco de dados.",
    });
  };

  // Delete document - Updated to use Supabase
  const handleDeleteDocument = async (id: string | number, title: string) => {
    try {
      console.log('Excluindo documento:', title, 'ID:', id);
      
      // Delete from Supabase database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', String(id));

      if (deleteError) {
        throw new Error(`Erro ao excluir o documento: ${deleteError.message}`);
      }

      // Try to call webhook as well (optional)
      try {
        await fetch('https://webhook.n8nlabz.com.br/webhook/excluir-arquivo-rag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            titulo: title 
          }),
        });
        console.log('Webhook de exclusão chamado com sucesso');
      } catch (webhookError) {
        console.warn('Webhook de exclusão falhou, mas documento foi removido localmente:', webhookError);
      }

      // Remove from UI
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      toast({
        title: "Erro inesperado",
        description: err instanceof Error ? err.message : "Não foi possível excluir o documento.",
        variant: "destructive",
      });
    }
  };

  // New function to clear all documents
  const clearAllDocuments = async () => {
    try {
      console.log('Enviando solicitação para excluir toda a base de conhecimento');
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/excluir-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Erro ao limpar a base de conhecimento: ${response.statusText}`);
      }

      // Clear the documents array
      setDocuments([]);
      
      toast({
        title: "Base de conhecimento limpa",
        description: "Todos os documentos foram removidos com sucesso!",
        variant: "destructive",
      });
    } catch (err) {
      console.error('Unexpected error clearing knowledge base:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível limpar a base de conhecimento.",
        variant: "destructive",
      });
    }
  };

  // Upload file to Supabase Storage and save metadata
  const uploadFileToWebhook = async (file: File, category: string) => {
    try {
      console.log('Iniciando upload do arquivo:', file.name, 'categoria:', category);
      
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
      const publicUrl = await uploadFileToUserBucket(file, 'documents');
      if (!publicUrl) {
        throw new Error('Falha no upload para o bucket do usuário');
      }

      console.log('URL pública gerada:', publicUrl);

      // Save document metadata to database
      const insertData = {
        titulo: file.name,
        arquivo_url: publicUrl,
        tamanho_arquivo: file.size,
        tipo: file.type,
        user_id: user.id
      };

      console.log('Dados para inserir no banco:', insertData);

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert(insertData)
        .select()
        .single();

      if (docError) {
        console.error('Erro ao inserir no banco:', docError);
        throw new Error(`Erro ao salvar no banco: ${docError.message}`);
      }

      console.log('Documento salvo no banco com sucesso:', docData);
      
      // Try to send to webhook as well (optional)
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        
        await fetch('https://webhook.n8nlabz.com.br/webhook/envia_rag', {
          method: 'POST',
          body: formData,
        });
        console.log('Webhook também foi chamado com sucesso');
      } catch (webhookError) {
        console.warn('Webhook falhou, mas arquivo foi salvo localmente:', webhookError);
      }
      
      // Refresh the document list
      await fetchDocuments();
      
      toast({
        title: "Documento adicionado",
        description: `${file.name} foi adicionado com sucesso!`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar o arquivo:', error);
      
      toast({
        title: "Erro ao enviar documento",
        description: error instanceof Error ? error.message : "Não foi possível enviar o documento.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Load documents on hook initialization
  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    isLoading,
    isRefreshing,
    fetchDocuments,
    handleRefresh,
    handleDeleteDocument,
    uploadFileToWebhook,
    clearAllDocuments
  };
};
