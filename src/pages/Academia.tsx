import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users, Star } from 'lucide-react';

const Academia = () => {
  const videos = [
    {
      id: 1,
      title: "Introdução ao Afiliado IA",
      description: "Aprenda os conceitos básicos da plataforma",
      duration: "5:30",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Básico"
    },
    {
      id: 2,
      title: "Como Configurar seu WhatsApp",
      description: "Passo a passo para conectar o Evolution API",
      duration: "8:45",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Configuração"
    },
    {
      id: 3,
      title: "Gerenciando Clientes",
      description: "Organize e gerencie sua base de clientes",
      duration: "6:20",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Gestão"
    },
    {
      id: 4,
      title: "Análise de Métricas",
      description: "Entenda os relatórios e dashboards",
      duration: "7:15",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Análise"
    },
    {
      id: 5,
      title: "Automações Avançadas",
      description: "Configurações avançadas de automação",
      duration: "12:30",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Avançado"
    },
    {
      id: 6,
      title: "Integrações com APIs",
      description: "Como integrar com outras plataformas",
      duration: "9:40",
      thumbnail: "/lovable-uploads/68e40dc0-6a1c-433e-bc04-d6fffca06b44.png",
      category: "Integrações"
    }
  ];

  const categories = ["Todos", "Básico", "Configuração", "Gestão", "Análise", "Avançado", "Integrações"];
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");

  const filteredVideos = selectedCategory === "Todos" 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const handleVideoClick = (videoId: number) => {
    console.log(`Playing video ${videoId}`);
    // Aqui você pode implementar a lógica para reproduzir o vídeo
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Play className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            Academia Afiliado IA
          </h1>
          <p className="text-muted-foreground">
            Aprenda a usar a plataforma com nossos vídeos explicativos
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Play className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{videos.length}</p>
                  <p className="text-sm text-muted-foreground">Vídeos disponíveis</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">2h 30m</p>
                  <p className="text-sm text-muted-foreground">Duração total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">4.9</p>
                  <p className="text-sm text-muted-foreground">Avaliação média</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Videos Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card 
              key={video.id} 
              className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => handleVideoClick(video.id)}
            >
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/80 dark:bg-black/50 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-purple-600 ml-1" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  {video.category}
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
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-8 w-8" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Precisa de ajuda?</h3>
                <p className="text-purple-100">
                  Entre em contato com nossa equipe de suporte para tirar suas dúvidas
                </p>
              </div>
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                Falar com Suporte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Academia;