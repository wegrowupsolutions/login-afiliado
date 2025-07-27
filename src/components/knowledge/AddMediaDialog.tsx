import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Youtube, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMedia: (mediaData: {
    title: string;
    description: string;
    file_url: string;
    file_type: 'video' | 'image' | 'audio' | 'document';
    category: string;
    thumbnail_url?: string;
    duration?: number;
  }) => Promise<boolean>;
  mediaType: 'video' | 'image' | 'audio' | 'document';
}

const AddMediaDialog: React.FC<AddMediaDialogProps> = ({
  open,
  onOpenChange,
  onAddMedia,
  mediaType
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'youtube' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    youtube_url: '',
    category: 'Sem categoria',
    thumbnail_url: '',
    duration: ''
  });

  // Handle file upload to Supabase Storage
  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para fazer upload.",
          variant: "destructive",
        });
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Choose the correct bucket based on media type
      let bucketName = 'videos'; // default
      if (mediaType === 'image') bucketName = 'images';
      else if (mediaType === 'audio') bucketName = 'audio';
      else if (mediaType === 'document') bucketName = 'documents';
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Erro no upload",
          description: error.message,
          variant: "destructive",
        });
        return null;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do arquivo.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Extract YouTube video ID and create embed URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, preencha o título.",
        variant: "destructive",
      });
      return;
    }

    // Always require file upload for all media types
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    let finalFileUrl = '';
    let thumbnailUrl = '';

    try {
      // Always use file upload for all media types
      const uploadedUrl = await uploadFileToStorage(selectedFile);
      if (!uploadedUrl) {
        setIsLoading(false);
        return;
      }
      finalFileUrl = uploadedUrl;

      const mediaData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        file_url: finalFileUrl,
        file_type: mediaType,
        category: formData.category,
        ...(thumbnailUrl && { thumbnail_url: thumbnailUrl }),
        ...(formData.duration && { duration: parseInt(formData.duration) })
      };

      const success = await onAddMedia(mediaData);
      
      if (success) {
        setFormData({
          title: '',
          description: '',
          file_url: '',
          youtube_url: '',
          category: 'Sem categoria',
          thumbnail_url: '',
          duration: ''
        });
        setSelectedFile(null);
        setUploadMethod('url');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title if empty
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const getMediaTypeLabel = () => {
    switch (mediaType) {
      case 'video': return 'Vídeo';
      case 'image': return 'Imagem';
      case 'audio': return 'Áudio';
      case 'document': return 'Documento';
      default: return 'Arquivo';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar {getMediaTypeLabel()}</DialogTitle>
          <DialogDescription>
            Adicione um novo {getMediaTypeLabel().toLowerCase()} à sua base de conhecimento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome do {getMediaTypeLabel()} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Nome do ${getMediaTypeLabel().toLowerCase()}`}
              required
            />
          </div>

          {mediaType === 'video' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Clique para selecionar ou arraste o arquivo aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">MP4, AVI, MOV, WMV</p>
                  <Input
                    id="file_upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file_upload')?.click()}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Arquivo selecionado: {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mediaType !== 'video' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Clique para selecionar ou arraste o arquivo aqui</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {mediaType === 'image' && 'JPG, PNG, GIF, WEBP'}
                    {mediaType === 'audio' && 'MP3, WAV, OGG, M4A'}
                    {mediaType === 'document' && 'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX'}
                  </p>
                  <Input
                    id="file_upload"
                    type="file"
                    accept={
                      mediaType === 'image' ? 'image/*' :
                      mediaType === 'audio' ? 'audio/*' :
                      mediaType === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx' :
                      '*/*'
                    }
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById('file_upload')?.click()}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      Arquivo selecionado: {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tamanho: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMediaDialog;