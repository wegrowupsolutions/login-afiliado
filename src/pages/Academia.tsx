import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, Star, ArrowLeft } from 'lucide-react';
import VideoDialog from '@/components/ui/video-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Academia = () => {
  const [selectedVideo, setSelectedVideo] = React.useState<{ id: number; title: string; url: string } | null>(null);
  const [isLoadingSupport, setIsLoadingSupport] = React.useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const videos = [
    {
      id: 1,
      title: "Introdução ao Afiliado IA",
      description: "Aprenda os conceitos básicos da plataforma",
      duration: "5:30",
      thumbnail: "/lovable-uploads/54648612-d1e4-480f-964e-a7e342fcbd46.png",
      category: "Básico",
      url: "https://youtu.be/9lU4n088ghU"
    },
    {
      id: 2,
      title: "Como Configurar seu WhatsApp",
      description: "Passo a passo para conectar o Evolution API",
      duration: "8:45",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Configuração",
      url: "https://youtu.be/9lU4n088ghU"
    },
    {
      id: 3,
      title: "Gerenciando Clientes",
      description: "Organize e gerencie sua base de clientes",
      duration: "6:20",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Gestão",
      url: "https://youtu.be/9lU4n088ghU"
    },
    {
      id: 4,
      title: "Análise de Métricas",
      description: "Entenda os relatórios e dashboards",
      duration: "7:15",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Análise",
      url: "https://youtu.be/9lU4n088ghU"
    },
    {
      id: 5,
      title: "Automações Avançadas",
      description: "Configurações avançadas de automação",
      duration: "12:30",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Avançado",
      url: "https://youtu.be/9lU4n088ghU"
    },
    {
      id: 6,
      title: "Integrações com APIs",
      description: "Como integrar com outras plataformas",
      duration: "9:40",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Integrações",
      url: "https://youtu.be/9lU4n088ghU"
    }
  ];

  const handleVideoClick = (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo({ id: video.id, title: video.title, url: video.url });
    }
  };

  const handleContactSupport = async () => {
    setIsLoadingSupport(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: 'Usuário da Academia',
          email: 'usuario@exemplo.com',
          message: 'Solicitação de suporte através da Academia Afiliado IA'
        }
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Sua solicitação foi enviada para nossa equipe de suporte.",
      });
    } catch (error) {
      console.error('Error sending support email:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSupport(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Play className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              Academia Afiliado IA
            </h1>
          </div>
          <p className="text-muted-foreground">
            Aprenda a usar a plataforma com nossos vídeos explicativos
          </p>
        </div>



        {/* Videos Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card 
              key={video.id} 
              className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="relative">
                <div className="aspect-video rounded-t-lg overflow-hidden">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/90 dark:bg-black/70 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-purple-600 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {video.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {video.duration}
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Play className="h-4 w-4 mr-1" />
                    Assistir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Precisa de ajuda?</h3>
                <p className="text-white/80">
                  Entre em contato com nossa equipe de suporte para tirar suas dúvidas
                </p>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={handleContactSupport}
                disabled={isLoadingSupport}
              >
                {isLoadingSupport ? "Enviando..." : "Falar com Suporte"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Video Dialog */}
        {selectedVideo && (
          <VideoDialog
            open={!!selectedVideo}
            onOpenChange={(open) => !open && setSelectedVideo(null)}
            videoUrl={selectedVideo.url}
            title={selectedVideo.title}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Academia;