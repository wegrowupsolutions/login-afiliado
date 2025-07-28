
import React from 'react';
import { FileText, Trash2, Volume2, Play, User } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Document } from '@/hooks/useDocuments';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string | number, title: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  // Function to get the appropriate icon based on file type
  const getFileIcon = () => {
    const type = document.type?.toLowerCase();
    
    if (type === 'audio' || document.category?.toLowerCase() === 'áudio') {
      return <Volume2 className="h-5 w-5 mr-2 text-green-500" />;
    }
    
    if (type === 'video' || type?.includes('video') || document.category?.toLowerCase() === 'mídia') {
      return <Play className="h-5 w-5 mr-2 text-blue-500" />;
    }
    
    if (type === 'image' || type?.includes('image') || document.category?.toLowerCase() === 'imagem') {
      return <User className="h-5 w-5 mr-2 text-purple-500" />;
    }
    
    // Default icon for documents
    return <FileText className="h-5 w-5 mr-2 text-amber-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {getFileIcon()}
          <span className="truncate">{document.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <div>Adicionado: {document.uploadedAt}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Documento</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. Tem certeza que deseja excluir o documento?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button 
                variant="destructive" 
                onClick={() => onDelete(document.id, document.titulo || document.name)}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
