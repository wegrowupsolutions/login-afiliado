
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, Bot, Plus, QrCode, Loader2, RefreshCw, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'waiting' | 'confirmed' | 'failed' | null>(null);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 5; // Aumentei para 5 tentativas
  
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);
  
  const checkConnectionStatus = async () => {
    try {
      console.log('🔍 Verificando status de conexão para:', instanceName);
      
      // Usar o endpoint correto baseado no webhook ID do n8n
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/a0284a1e-64e1-4691-be2e-6eed40cb57f0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim(),
          action: 'check_status'
        }),
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('📄 Raw response:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
          console.log('✅ Parsed response:', responseData);
        } catch (parseError) {
          console.error('❌ Erro ao parsear JSON:', parseError);
          toast({
            title: "Erro no formato da resposta",
            description: "Resposta do servidor inválida.",
            variant: "destructive"
          });
          return;
        }
        
        // Verificar diferentes formatos de resposta possíveis
        const status = responseData?.respond || responseData?.status || responseData?.data?.status;
        
        if (status === "positivo" || status === "connected" || status === "success") {
          console.log('✅ Conexão confirmada!');
          if (statusCheckIntervalRef.current !== null) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
          }
          setConfirmationStatus('confirmed');
          retryCountRef.current = 0;
          toast({
            title: "Conexão estabelecida!",
            description: "Seu WhatsApp foi conectado com sucesso.",
            variant: "default" 
          });
        } else if (status === "negativo" || status === "disconnected" || status === "failed") {
          retryCountRef.current += 1;
          console.log(`❌ Tentativa ${retryCountRef.current} de ${maxRetries} falhou`);
          
          if (retryCountRef.current >= maxRetries) {
            console.log('🔄 Máximo de tentativas atingido, atualizando QR code...');
            if (statusCheckIntervalRef.current !== null) {
              clearInterval(statusCheckIntervalRef.current);
              statusCheckIntervalRef.current = null;
            }
            
            // Em vez de marcar como failed, tentar atualizar o QR code automaticamente
            toast({
              title: "Atualizando QR Code",
              description: "Gerando novo QR code automaticamente...",
              variant: "default"
            });
            
            retryCountRef.current = 0;
            await updateQrCode();
          } else {
            toast({
              title: "Aguardando conexão",
              description: `Tentativa ${retryCountRef.current} de ${maxRetries}`,
              variant: "default"
            });
          }
        } else {
          console.log('❓ Status desconhecido:', status);
        }
      } else {
        console.error('❌ Erro HTTP:', response.status);
        const errorText = await response.text();
        console.error('❌ Erro details:', errorText);
      }
    } catch (error) {
      console.error('💥 Erro na verificação:', error);
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        setConfirmationStatus('failed');
        toast({
          title: "Erro na conexão",
          description: "Múltiplas falhas na verificação. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };
  
  const updateQrCode = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Atualizando QR code para:', instanceName);
      
      // Usar o webhook ID correto para atualizar QR code
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/atualizar-qr-code-afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });
      
      console.log('📡 QR update response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('📷 Blob recebido, tipo:', blob.type);
        
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        retryCountRef.current = 0;
        
        // Reiniciar verificação de status
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('🔄 Iniciando novo ciclo de verificação');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 8000); // Diminuí para 8 segundos
        
        toast({
          title: "QR Code atualizado",
          description: "Escaneie o novo QR code para conectar.",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Falha ao atualizar QR code:', errorText);
        throw new Error('Falha ao atualizar QR code');
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o QR code. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a instância.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
    
    try {
      console.log('🚀 Criando instância:', instanceName);
      
      // Usar o webhook ID correto para criar instância
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/instancia-evolution-afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });
      
      console.log('📡 Create response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('📷 QR Code blob recebido, tipo:', blob.type);
        
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        
        // Limpar intervalo anterior se existir
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('🔄 Iniciando verificação de status');
        // Aguardar 5 segundos antes de começar a verificar (dar tempo para instância inicializar)
        setTimeout(() => {
          statusCheckIntervalRef.current = window.setInterval(() => {
            checkConnectionStatus();
          }, 8000);
        }, 5000);
        
        toast({
          title: "Instância criada!",
          description: "Escaneie o QR code para conectar seu WhatsApp.",
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Falha ao criar instância:', errorText);
        throw new Error('Falha ao criar instância');
      }
    } catch (error) {
      console.error('💥 Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a instância. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
      setConfirmationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    resetQrCode();
    handleCreateInstance();
  };

  const resetQrCode = () => {
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
    if (statusCheckIntervalRef.current !== null) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Bot className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Afiliado IA</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Link className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Conectar Evolution
          </h2>
        </div>
        
        <div className="max-w-xl mx-auto">
          <Card className="dark:bg-gray-800 shadow-lg border-green-100 dark:border-green-900/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                {qrCodeData ? (
                  <QrCode className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                {qrCodeData ? "Conectar WhatsApp" : "Criar Nova Instância"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCodeData ? (
                <div className="space-y-6 text-center">
                  {confirmationStatus === 'waiting' ? (
                    <>
                      <div className="bg-white p-4 rounded-md inline-block mx-auto">
                        <img 
                          src={qrCodeData} 
                          alt="QR Code para conectar WhatsApp" 
                          className="mx-auto max-w-full h-auto"
                          style={{ maxHeight: '250px' }}
                        />
                      </div>
                      
                      <div className="space-y-2 text-center">
                        <h3 className="font-medium text-lg">Conecte seu WhatsApp</h3>
                        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left list-decimal pl-5">
                          <li>Abra o WhatsApp no seu celular</li>
                          <li>Toque em Menu ou Configurações e selecione Aparelhos conectados</li>
                          <li>Toque em Conectar um aparelho</li>
                          <li>Escaneie o código QR</li>
                        </ol>
                        
                        <div className="mt-4 flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>
                            Aguardando conexão
                            {retryCountRef.current > 0 ? ` (Tentativa ${retryCountRef.current}/${maxRetries})` : '...'}
                          </span>
                        </div>
                        
                        <Button 
                          onClick={updateQrCode}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          disabled={isLoading}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Atualizar QR Code
                        </Button>
                      </div>
                    </>
                  ) : confirmationStatus === 'confirmed' ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Conectado com Sucesso!</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Seu WhatsApp foi conectado à instância <span className="font-semibold">{instanceName}</span>.
                      </p>
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        variant="default"
                        className="mt-4"
                      >
                        Voltar ao Dashboard
                      </Button>
                    </div>
                  ) : confirmationStatus === 'failed' ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Falha na Conexão</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Não foi possível conectar o WhatsApp à instância <span className="font-semibold">{instanceName}</span>.
                      </p>
                      <Button 
                        onClick={handleTryAgain}
                        variant="default"
                        className="mt-4 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </span>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tentar Novamente
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                  
                  {confirmationStatus !== 'confirmed' && confirmationStatus !== 'failed' && (
                    <Button 
                      onClick={resetQrCode}
                      variant="outline"
                      className="mt-4"
                    >
                      Voltar
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="instance-name">Nome da Instância</Label>
                      <Input 
                        id="instance-name" 
                        placeholder="Ex: Atendimento Principal" 
                        className="dark:bg-gray-700"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isLoading) {
                            handleCreateInstance();
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleCreateInstance}
                      className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      disabled={isLoading || !instanceName.trim()}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </span>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Instância
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Evolution;
