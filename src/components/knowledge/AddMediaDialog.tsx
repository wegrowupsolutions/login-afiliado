import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    category: 'Sem categoria',
    thumbnail_url: '',
    duration: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.file_url.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a URL do arquivo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const mediaData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      file_url: formData.file_url.trim(),
      file_type: mediaType,
      category: formData.category,
      ...(formData.thumbnail_url && { thumbnail_url: formData.thumbnail_url.trim() }),
      ...(formData.duration && { duration: parseInt(formData.duration) })
    };

    const success = await onAddMedia(mediaData);
    
    if (success) {
      setFormData({
        title: '',
        description: '',
        file_url: '',
        category: 'Sem categoria',
        thumbnail_url: '',
        duration: ''
      });
      onOpenChange(false);
    }
    
    setIsLoading(false);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar {getMediaTypeLabel()}</DialogTitle>
          <DialogDescription>
            Adicione um novo {getMediaTypeLabel().toLowerCase()} à sua base de conhecimento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Nome do ${getMediaTypeLabel().toLowerCase()}`}
              required
            />
          </div>

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

          {mediaType === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="URL da imagem de capa"
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