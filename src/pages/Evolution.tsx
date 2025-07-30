
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, Bot, Plus, QrCode, Loader2, RefreshCw, Check, Smartphone, AlertCircle, Wifi, CheckCircle, XCircle } from 'lucide-react';
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
        
        <EvolutionConnection />
      </main>
    </div>
  );
};

// Componente EvolutionConnection
const EvolutionConnection = () => {
  const [step, setStep] = useState('idle'); // idle, creating, qr_code, connecting, connected, failed
  const [instanceName, setInstanceName] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [logs, setLogs] = useState([]);
  
  const pollingInterval = useRef(null);
  const maxAttempts = 30; // 30 tentativas = 1.5 minutos
  
  // Função para adicionar logs
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Função para criar instância
  const createInstance = async () => {
    if (!instanceName.trim()) {
      setError('Por favor, digite um nome para a instância');
      return;
    }

    setIsLoading(true);
    setStep('creating');
    setError('');
    addLog(`Criando instância: ${instanceName}`, 'info');

    try {
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/instancia-evolution-afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName.trim()
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setQrCodeImage(imageUrl);
        setStep('qr_code');
        addLog('Instância criada com sucesso! QR Code gerado.', 'success');
        startConnectionPolling();
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (err) {
      addLog(`Erro ao criar instância: ${err.message}`, 'error');
      setError('Falha ao criar instância. Tente novamente.');
      setStep('failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar conexão
  const checkConnection = async () => {
    try {
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/pop-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName
        })
      });

      const result = await response.json();
      
      if (result.respond === 'positivo') {
        addLog('✅ Conexão estabelecida com sucesso!', 'success');
        setStep('connected');
        stopPolling();
        return true;
      } else {
        addLog(`Tentativa ${connectionAttempts + 1}/${maxAttempts} - Aguardando conexão...`, 'info');
        return false;
      }
    } catch (err) {
      addLog(`Erro na verificação: ${err.message}`, 'error');
      return false;
    }
  };

  // Polling para verificar conexão
  const startConnectionPolling = () => {
    setStep('connecting');
    setConnectionAttempts(0);
    addLog('Iniciando verificação de conexão...', 'info');
    
    pollingInterval.current = setInterval(async () => {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        return; // Para o polling
      }
      
      setConnectionAttempts(prev => {
        const newCount = prev + 1;
        if (newCount >= maxAttempts) {
          addLog('❌ Timeout na conexão. Tente gerar um novo QR Code.', 'error');
          setStep('failed');
          setError('Tempo limite excedido. Gere um novo QR Code.');
          stopPolling();
        }
        return newCount;
      });
    }, 3000); // Verifica a cada 3 segundos
  };

  // Para o polling
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Função para resetar e tentar novamente
  const resetConnection = () => {
    stopPolling();
    setStep('idle');
    setQrCodeImage(null);
    setError('');
    setConnectionAttempts(0);
    setLogs([]);
    if (qrCodeImage) {
      URL.revokeObjectURL(qrCodeImage);
    }
  };

  // Função para atualizar QR Code
  const refreshQrCode = async () => {
    setIsLoading(true);
    addLog('Atualizando QR Code...', 'info');
    
    try {
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/atualizar-qr-code-afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName: instanceName
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        if (qrCodeImage) {
          URL.revokeObjectURL(qrCodeImage);
        }
        const imageUrl = URL.createObjectURL(blob);
        setQrCodeImage(imageUrl);
        addLog('QR Code atualizado com sucesso!', 'success');
        setStep('qr_code');
        setError('');
        setConnectionAttempts(0);
      } else {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
    } catch (err) {
      addLog(`Erro ao atualizar QR Code: ${err.message}`, 'error');
      setError('Falha ao atualizar QR Code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopPolling();
      if (qrCodeImage) {
        URL.revokeObjectURL(qrCodeImage);
      }
    };
  }, [qrCodeImage]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card text-card-foreground rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Smartphone className="text-green-500" size={32} />
          <h1 className="text-2xl font-bold">Conectar Evolution API</h1>
        </div>
        <p className="text-muted-foreground">Configure sua instância do WhatsApp</p>
      </div>

      {/* Input da Instância */}
      {step === 'idle' && (
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">
              Nome da Instância
            </Label>
            <Input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="Ex: minha-empresa-bot"
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/15 border border-destructive/30 rounded-lg text-destructive">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          
          <Button
            onClick={createInstance}
            disabled={isLoading || !instanceName.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Criando Instância...
              </>
            ) : (
              <>
                <Wifi className="mr-2" size={20} />
                Criar Instância
              </>
            )}
          </Button>
        </div>
      )}

      {/* QR Code */}
      {step === 'qr_code' && (
        <div className="text-center space-y-4">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Escaneie o QR Code</h3>
            {qrCodeImage && (
              <img 
                src={qrCodeImage} 
                alt="QR Code" 
                className="mx-auto max-w-xs border-2 border-border rounded-lg"
              />
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Abra o WhatsApp → Menu → Dispositivos conectados → Conectar dispositivo
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={refreshQrCode}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2" size={16} />
              Atualizar QR Code
            </Button>
            <Button
              onClick={resetConnection}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Conectando */}
      {step === 'connecting' && (
        <div className="text-center space-y-4">
          <div className="bg-muted/50 p-6 rounded-lg">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
            <h3 className="text-lg font-semibold mb-2">Conectando...</h3>
            <p className="text-muted-foreground mb-4">
              Aguardando conexão com o WhatsApp
            </p>
            <div className="bg-background p-2 rounded border text-sm">
              Tentativa: {connectionAttempts}/{maxAttempts}
            </div>
          </div>
          
          <Button
            onClick={resetConnection}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Conectado */}
      {step === 'connected' && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
              Conexão Realizada com Sucesso!
            </h3>
            <p className="text-muted-foreground mb-4">
              Sua instância <strong>{instanceName}</strong> está conectada e pronta para uso.
            </p>
          </div>
          
          <Button
            onClick={resetConnection}
            className="w-full"
          >
            Criar Nova Instância
          </Button>
        </div>
      )}

      {/* Erro */}
      {step === 'failed' && (
        <div className="text-center space-y-4">
          <div className="bg-destructive/15 p-6 rounded-lg">
            <XCircle className="mx-auto mb-4 text-destructive" size={48} />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              Falha na Conexão
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível conectar a instância <strong>{instanceName}</strong>.
            </p>
            {error && (
              <div className="bg-background p-3 rounded border text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={refreshQrCode}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              Tentar Novamente
            </Button>
            <Button
              onClick={resetConnection}
              variant="outline"
              className="flex-1"
            >
              Recomeçar
            </Button>
          </div>
        </div>
      )}

      {/* Logs de Debug */}
      {logs.length > 0 && (
        <div className="mt-8">
          <details className="bg-muted/50 rounded-lg">
            <summary className="p-3 cursor-pointer font-medium">
              Logs de Conexão ({logs.length})
            </summary>
            <div className="p-3 border-t max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`text-xs mb-1 ${
                    log.type === 'error' ? 'text-destructive' : 
                    log.type === 'success' ? 'text-green-600 dark:text-green-400' : 
                    'text-muted-foreground'
                  }`}
                >
                  <span className="text-muted-foreground/60">{log.timestamp}</span> - {log.message}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default Evolution;
