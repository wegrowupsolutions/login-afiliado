import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const AcademiaCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/academia');
  };

  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
      <CardHeader className="pb-2 bg-gradient-to-r from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Play className="h-6 w-6" />
          Academia
        </CardTitle>
        <CardDescription className="text-purple-100">
          Vídeos explicativos da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
            <Play className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Assista aos vídeos explicativos da plataforma
          </p>
          <Button 
            onClick={handleClick}
            className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-200"
          >
            Assistir vídeos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademiaCard;