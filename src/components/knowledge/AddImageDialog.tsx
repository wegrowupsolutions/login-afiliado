import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddImage: (file: File, category: string) => Promise<boolean>;
}

const AddImageDialog: React.FC<AddImageDialogProps> = ({
  open,
  onOpenChange,
  onAddImage
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Imagem');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione uma imagem para upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await onAddImage(selectedFile, category);
      
      if (success) {
        setSelectedFile(null);
        setCategory('Imagem');
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Adicionar Imagem</DialogTitle>
          <DialogDescription>
            Adicione uma nova imagem à sua base de conhecimento.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Imagem">Imagem</SelectItem>
                <SelectItem value="Gráfico">Gráfico</SelectItem>
                <SelectItem value="Diagrama">Diagrama</SelectItem>
                <SelectItem value="Foto">Foto</SelectItem>
                <SelectItem value="Ilustração">Ilustração</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Clique para selecionar ou arraste a imagem aqui</p>
              <p className="text-sm text-muted-foreground mb-4">JPG, PNG, GIF, WEBP</p>
              <Input
                id="file_upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => document.getElementById('file_upload')?.click()}
              >
                Selecionar Imagem
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

export default AddImageDialog;