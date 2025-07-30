
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Smartphone, Wifi, AlertCircle, RefreshCw } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useEvolutionConnection } from '@/hooks/useEvolutionConnection';
import { EvolutionApiClient } from '@/utils/evolutionApi';
import { validateInstanceName } from '@/utils/evolutionHelpers';
import { EvolutionProvider } from '@/context/EvolutionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EvolutionConnection = () => {
  const { state, updateState, resetConnection, pollingInterval, maxAttempts } = useEvolutionConnection();
  const [logs, setLogs] = useState<Array<{ message: string; type: string; timestamp: string }>>([]);
  
  // Função para adicionar logs
  const addLog = (message: string, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Função para criar nova instância
  const createNewInstance = async () => {
    const validationError = validateInstanceName(state.instanceName);
    if (validationError) {
      updateState({ error: validationError });
      return;
    }

    updateState({ isLoading: true, step: 'creating', error: '' });
    addLog(`Criando nova instância: ${state.instanceName}`, 'info');

    try {
      const blob = await EvolutionApiClient.createInstance(state.instanceName.trim());
      const imageUrl = URL.createObjectURL(blob);
      updateState({ 
        qrCodeImage: imageUrl, 
        step: 'qr_code',  // MOSTRAR QR CODE PRIMEIRO!
        isLoading: false 
      });
      addLog('Instância criada com sucesso! QR Code gerado.', 'success');
    } catch (err: any) {
      addLog(`Erro ao criar instância: ${err.message}`, 'error');
      updateState({ 
        error: 'Falha ao criar instância. Tente novamente.',
        step: 'failed',
        isLoading: false 
      });
    }
  };

  // Função para gerar QR Code (para instâncias existentes)
  const generateQrCode = async () => {
    const validationError = validateInstanceName(state.instanceName);
    if (validationError) {
      updateState({ error: validationError });
      return;
    }

    updateState({ isLoading: true, step: 'generate_qr', error: '' });
    addLog(`Gerando QR Code para instância: ${state.instanceName}`, 'info');

    try {
      const blob = await EvolutionApiClient.refreshQrCode(state.instanceName.trim());
      const imageUrl = URL.createObjectURL(blob);
      updateState({ 
        qrCodeImage: imageUrl, 
        step: 'qr_code',  // MOSTRAR QR CODE PRIMEIRO!
        isLoading: false 
      });
      addLog('QR Code gerado com sucesso!', 'success');
    } catch (err: any) {
      addLog(`Erro ao gerar QR Code: ${err.message}`, 'error');
      updateState({ 
        error: 'Falha ao gerar QR Code. Tente novamente.',
        step: 'failed',
        isLoading: false 
      });
    }
  };

  // Função para iniciar verificação APÓS usuário escanear QR
  const startConnectionVerification = () => {
    updateState({ step: 'connecting', connectionAttempts: 0 });
    addLog('Iniciando verificação de conexão...', 'info');
    startConnectionPolling();
  };

  // Função para verificar conexão
  const checkConnection = async () => {
    try {
      const result = await EvolutionApiClient.checkConnection(state.instanceName);
      
      if (result.respond === 'positivo') {
        addLog('✅ Conexão estabelecida com sucesso!', 'success');
        updateState({ step: 'connected' });
        stopPolling();
        return true;
      } else {
        addLog(`Tentativa ${state.connectionAttempts + 1}/${maxAttempts} - Aguardando conexão...`, 'info');
        return false;
      }
    } catch (err: any) {
      addLog(`Erro na verificação: ${err.message}`, 'error');
      return false;
    }
  };

  // Polling para verificar conexão
  const startConnectionPolling = () => {
    pollingInterval.current = setInterval(async () => {
      const isConnected = await checkConnection();
      
      if (isConnected) {
        return; // Para o polling
      }
      
      updateState({ 
        connectionAttempts: state.connectionAttempts + 1 
      });
      
      if (state.connectionAttempts + 1 >= maxAttempts) {
        addLog('❌ Timeout na conexão. Tente gerar um novo QR Code.', 'error');
        updateState({ 
          step: 'failed',
          error: 'Tempo limite excedido. Gere um novo QR Code.' 
        });
        stopPolling();
      }
    }, 3000); // Verifica a cada 3 segundos
  };

  // Para o polling
  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Função para atualizar QR Code existente
  const refreshQrCode = async () => {
    updateState({ isLoading: true });
    addLog('Atualizando QR Code...', 'info');
    
    try {
      const blob = await EvolutionApiClient.refreshQrCode(state.instanceName);
      if (state.qrCodeImage) {
        URL.revokeObjectURL(state.qrCodeImage);
      }
      const imageUrl = URL.createObjectURL(blob);
      updateState({ 
        qrCodeImage: imageUrl,
        step: 'qr_code',  // Voltar para mostrar QR Code
        error: '',
        connectionAttempts: 0,
        isLoading: false
      });
      addLog('QR Code atualizado com sucesso!', 'success');
    } catch (err: any) {
      addLog(`Erro ao atualizar QR Code: ${err.message}`, 'error');
      updateState({ 
        error: 'Falha ao atualizar QR Code.',
        isLoading: false 
      });
    }
  };

  // Função para resetar
  const handleReset = () => {
    stopPolling();
    resetConnection();
    setLogs([]);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopPolling();
      if (state.qrCodeImage) {
        URL.revokeObjectURL(state.qrCodeImage);
      }
    };
  }, [state.qrCodeImage]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Smartphone className="text-green-500" size={32} />
          <h1 className="text-2xl font-bold text-card-foreground">Conectar Evolution API</h1>
        </div>
        <p className="text-muted-foreground">Configure sua instância do WhatsApp</p>
      </div>

      {/* Tela Inicial - Input + 2 Botões */}
      {state.step === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Nome da Instância
            </label>
            <input
              type="text"
              value={state.instanceName}
              onChange={(e) => updateState({ instanceName: e.target.value })}
              placeholder="Ex: minha-empresa-bot"
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              disabled={state.isLoading}
            />
          </div>
          
          {state.error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              <AlertCircle size={20} />
              <span>{state.error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={createNewInstance}
              disabled={state.isLoading || !state.instanceName.trim()}
              className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Criando...
                </>
              ) : (
                <>
                  <Wifi size={20} />
                  🆕 Criar Nova Instância
                </>
              )}
            </button>
            
            <button
              onClick={generateQrCode}
              disabled={state.isLoading || !state.instanceName.trim()}
              className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {state.isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw size={20} />
                  🔄 Gerar QR Code
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* QR Code Visível - NOVO ESTADO! */}
      {state.step === 'qr_code' && (
        <div className="text-center space-y-6">
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📱 Escaneie o QR Code</h3>
            {state.qrCodeImage && (
              <div className="flex justify-center mb-4">
                <img 
                  src={state.qrCodeImage} 
                  alt="QR Code" 
                  className="max-w-xs w-full border-2 border-border rounded-lg shadow-md"
                />
              </div>
            )}
            <div className="text-sm text-muted-foreground space-y-1">
              <p>1. Abra o WhatsApp no seu celular</p>
              <p>2. Vá em Menu → Dispositivos conectados</p>
              <p>3. Toque em "Conectar dispositivo"</p>
              <p>4. Escaneie o QR Code acima</p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ⏱️ Após escanear o QR Code, clique em "Iniciar Verificação" para confirmar a conexão
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={refreshQrCode}
              disabled={state.isLoading}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              🔄 Atualizar QR
            </button>
            
            <button
              onClick={startConnectionVerification}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              ✅ Iniciar Verificação
            </button>
            
            <button
              onClick={handleReset}
              className="bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80 flex items-center justify-center gap-2"
            >
              <XCircle size={16} />
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Verificando Conexão - Polling */}
      {state.step === 'connecting' && (
        <div className="text-center space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={48} />
            <h3 className="text-lg font-semibold mb-2">🔍 Verificando Conexão...</h3>
            <p className="text-muted-foreground mb-4">
              Aguardando confirmação da conexão com o WhatsApp
            </p>
            <div className="bg-background p-2 rounded border text-sm">
              Tentativa: {state.connectionAttempts}/{maxAttempts}
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80"
          >
            Cancelar Verificação
          </button>
        </div>
      )}

      {/* Sucesso - Conectado */}
      {state.step === 'connected' && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
              🎉 Conexão Realizada com Sucesso!
            </h3>
            <p className="text-muted-foreground mb-4">
              Sua instância <strong>{state.instanceName}</strong> está conectada e pronta para uso.
            </p>
          </div>
          
          <button
            onClick={handleReset}
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
          >
            🆕 Criar Nova Instância
          </button>
        </div>
      )}

      {/* Erro */}
      {state.step === 'failed' && (
        <div className="text-center space-y-4">
          <div className="bg-destructive/10 p-6 rounded-lg">
            <XCircle className="mx-auto mb-4 text-destructive" size={48} />
            <h3 className="text-lg font-semibold text-destructive mb-2">
              ❌ Falha na Conexão
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível conectar a instância <strong>{state.instanceName}</strong>.
            </p>
            {state.error && (
              <div className="bg-background p-3 rounded border text-sm text-destructive">
                {state.error}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={generateQrCode}
              disabled={state.isLoading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🔄 Gerar Novo QR Code
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80"
            >
              🔄 Recomeçar
            </button>
          </div>
        </div>
      )}

      {/* Logs de Debug */}
      {logs.length > 0 && (
        <div className="mt-8">
          <details className="bg-muted rounded-lg">
            <summary className="p-3 cursor-pointer font-medium text-card-foreground">
              📋 Logs de Conexão ({logs.length})
            </summary>
            <div className="p-3 border-t max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`text-xs mb-1 ${
                    log.type === 'error' ? 'text-destructive' : 
                    log.type === 'success' ? 'text-green-600' : 
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

const Evolution = () => {
  return (
    <EvolutionProvider>
      <div className="container mx-auto py-6 space-y-6">
        <DashboardHeader />
        <EvolutionConnection />
      </div>
    </EvolutionProvider>
  );
};


export default Evolution;
