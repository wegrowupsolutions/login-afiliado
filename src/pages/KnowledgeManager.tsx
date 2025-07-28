
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Bot, LogOut, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import SearchBar from '@/components/knowledge/SearchBar';
import DocumentGrid from '@/components/knowledge/DocumentGrid';
import AddDocumentDialog from '@/components/knowledge/AddDocumentDialog';
import AddMediaDialog from '@/components/knowledge/AddMediaDialog';
import AddImageDialog from '@/components/knowledge/AddImageDialog';
import { useDocuments } from '@/hooks/useDocuments';
import { useMediaFiles } from '@/hooks/useMediaFiles';
import { useImageFiles } from '@/hooks/useImageFiles';

const KnowledgeManager = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [isAddMediaOpen, setIsAddMediaOpen] = useState(false);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'video' | 'audio' | 'document'>('video');
  
  // Use the custom hook for document management
  const { 
    documents, 
    isLoading, 
    isRefreshing, 
    handleRefresh, 
    handleDeleteDocument,
    uploadFileToWebhook,
    clearAllDocuments
  } = useDocuments();

  // Use the custom hook for media files management  
  const { 
    mediaFiles,
    isLoading: mediaLoading,
    addMediaFile,
    handleDeleteMediaFile,
    clearAllMediaFiles
  } = useMediaFiles();

  // Use the custom hook for image files management
  const { 
    imageFiles,
    isLoading: imageLoading,
    uploadImageFile,
    handleDeleteImageFile,
    clearAllImageFiles
  } = useImageFiles();

  // Combine documents, media files and image files into a single array
  const allContent = React.useMemo(() => {
    const combinedContent = [
      ...documents,
      ...mediaFiles.map(media => ({
        id: media.id,
        name: media.title,
        type: media.file_type,
        size: media.file_size ? `${(media.file_size / 1024).toFixed(1)} KB` : 'Desconhecido',
        uploadedAt: new Date(media.created_at).toISOString().split('T')[0],
        category: media.category || 'Mídia',
        titulo: media.title,
        metadata: { url: media.file_url },
      })),
      ...imageFiles.map(image => ({
        id: image.id,
        name: image.title,
        type: 'image',
        size: image.file_size ? `${(image.file_size / 1024).toFixed(1)} KB` : 'Desconhecido',
        uploadedAt: new Date(image.created_at).toISOString().split('T')[0],
        category: image.category || 'Imagem',
        titulo: image.title,
        metadata: { url: image.file_url },
      }))
    ];
    return combinedContent;
  }, [documents, mediaFiles, imageFiles]);

  // Handle unified delete function
  const handleUnifiedDelete = async (id: string | number, title: string) => {
    // Check if it's a media file (from media_files table)
    const isMediaFile = mediaFiles.some(media => media.id === id);
    // Check if it's an image file (from image_files table)
    const isImageFile = imageFiles.some(image => image.id === id);
    
    if (isMediaFile) {
      await handleDeleteMediaFile(id as string);
    } else if (isImageFile) {
      await handleDeleteImageFile(id as string);
    } else {
      await handleDeleteDocument(id, title);
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Handle adding a new document
  const handleAddDocument = async (file: File, category: string) => {
    await uploadFileToWebhook(file, category);
  };

  // Handle adding new media
  const handleAddVideo = () => {
    setMediaType('video');
    setIsAddMediaOpen(true);
  };

  const handleAddImage = () => {
    setIsAddImageOpen(true);
  };

  const handleAddAudio = () => {
    setMediaType('audio');
    setIsAddMediaOpen(true);
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Afiliado IA</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              Bem-vindo, {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
            <Button variant="outline" onClick={signOut} className="border-white text-white bg-gray-950/50 hover:bg-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackToDashboard}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Gerenciador de Conhecimento
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          {/* Search and Action Buttons */}
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            onAddDocument={() => setIsAddDocumentOpen(true)}
            onAddVideo={handleAddVideo}
            onAddImage={handleAddImage}
            onAddAudio={handleAddAudio}
            onClearAll={clearAllDocuments}
            isRefreshing={isRefreshing}
          />

          {/* Document Grid */}
          <DocumentGrid 
            documents={allContent}
            searchQuery={searchQuery}
            onDeleteDocument={handleUnifiedDelete}
          />

          {/* Add Document Dialog */}
          <AddDocumentDialog 
            isOpen={isAddDocumentOpen}
            onOpenChange={setIsAddDocumentOpen}
            onAddDocument={handleAddDocument}
          />

          {/* Add Media Dialog */}
          <AddMediaDialog 
            open={isAddMediaOpen}
            onOpenChange={setIsAddMediaOpen}
            onAddMedia={addMediaFile}
            mediaType={mediaType}
          />

          {/* Add Image Dialog */}
          <AddImageDialog 
            open={isAddImageOpen}
            onOpenChange={setIsAddImageOpen}
            onAddImage={uploadImageFile}
          />
        </div>
      </main>
    </div>
  );
};

export default KnowledgeManager;
