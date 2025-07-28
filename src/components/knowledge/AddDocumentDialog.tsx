
import React, { useState } from 'react';
import { FileUp, Upload, Loader2, FileText } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AddDocumentDialogProps {
  onAddDocument: (file: File, category: string) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDocumentDialog: React.FC<AddDocumentDialogProps> = ({ 
  onAddDocument, 
  isOpen, 
  onOpenChange 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCategory, setFileCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    if (selectedFile && fileCategory) {
      setIsUploading(true);
      try {
        await onAddDocument(selectedFile, fileCategory);
        setSelectedFile(null);
        setFileCategory('');
        onOpenChange(false);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Selecione um arquivo do seu computador para adicionar à base de conhecimento.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <FileUp className={`h-10 w-10 mb-2 ${
                isDragOver 
                  ? 'text-primary' 
                  : 'text-gray-400 dark:text-gray-500'
              }`} />
              <p className={`text-sm mb-1 ${
                isDragOver 
                  ? 'text-primary' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                Clique para selecionar ou arraste o arquivo aqui
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
              </p>
            </label>
          </div>
          
          {selectedFile && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Arquivo selecionado</AlertTitle>
              <AlertDescription>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </AlertDescription>
            </Alert>
          )}
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Categoria
            </label>
            <Input
              id="category"
              placeholder="ex: Procedimentos, Financeiro, Saúde..."
              value={fileCategory}
              onChange={(e) => setFileCategory(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !fileCategory || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Fazer Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDocumentDialog;
