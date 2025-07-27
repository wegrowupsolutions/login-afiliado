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
      
      const { data, error } = await supabase.storage
        .from('videos')
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
        .from('videos')
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

    if (uploadMethod === 'url' && !formData.file_url.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, preencha a URL do arquivo.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === 'youtube' && !formData.youtube_url.trim()) {
      toast({
        title: "URL do YouTube obrigatória",
        description: "Por favor, preencha a URL do YouTube.",
        variant: "destructive",
      });
      return;
    }

    if (uploadMethod === 'file' && !selectedFile) {
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
      if (uploadMethod === 'file' && selectedFile) {
        const uploadedUrl = await uploadFileToStorage(selectedFile);
        if (!uploadedUrl) {
          setIsLoading(false);
          return;
        }
        finalFileUrl = uploadedUrl;
      } else if (uploadMethod === 'youtube') {
        const videoId = getYouTubeVideoId(formData.youtube_url);
        if (!videoId) {
          toast({
            title: "URL inválida",
            description: "Por favor, insira uma URL válida do YouTube.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        finalFileUrl = `https://www.youtube.com/embed/${videoId}`;
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      } else {
        finalFileUrl = formData.file_url.trim();
        thumbnailUrl = formData.thumbnail_url.trim();
      }

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
            <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file_url">URL do Vídeo *</Label>
                  <Input
                    id="file_url"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                    placeholder="https://exemplo.com/video.mp4"
                    required={uploadMethod === 'url'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="URL da imagem de capa"
                  />
                </div>
              </TabsContent>

              <TabsContent value="youtube" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube_url">URL do YouTube *</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required={uploadMethod === 'youtube'}
                  />
                  <p className="text-sm text-gray-500">
                    Cole a URL do vídeo do YouTube aqui. A thumbnail será gerada automaticamente.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file_upload">Selecionar Arquivo *</Label>
                  <Input
                    id="file_upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    required={uploadMethod === 'file'}
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      Arquivo selecionado: {selectedFile.name}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {mediaType !== 'video' && (
            <div className="space-y-2">
              <Label htmlFor="file_url">URL do Arquivo *</Label>
              <Input
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                placeholder={`URL do ${getMediaTypeLabel().toLowerCase()}`}
                required
              />
            </div>
          )}

          {(mediaType === 'video' || mediaType === 'audio') && (
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (segundos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="Duração em segundos"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sem categoria">Sem categoria</SelectItem>
                <SelectItem value="Educacional">Educacional</SelectItem>
                <SelectItem value="Entretenimento">Entretenimento</SelectItem>
                <SelectItem value="Documentação">Documentação</SelectItem>
                <SelectItem value="Tutorial">Tutorial</SelectItem>
                <SelectItem value="Referência">Referência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={`Descrição do ${getMediaTypeLabel().toLowerCase()}`}
              rows={3}
            />
          </div>

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