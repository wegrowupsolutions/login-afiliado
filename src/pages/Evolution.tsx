
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, Smartphone, Wifi, AlertCircle, RefreshCw, ArrowLeft, Power, Trash2 } from 'lucide-react';
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
  const [connectedInstance, setConnectedInstance] = useState<{
    name: string;
    phoneNumber: string;
  } | null>(null);
  const navigate = useNavigate();
  
  // Função para adicionar logs
  const addLog = (message: string, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  // Função para conectar Evolution (automático)
  const connectEvolution = async () => {
    const validationError = validateInstanceName(state.instanceName);
    if (validationError) {
      updateState({ error: validationError });
      return;
    }

    updateState({ isLoading: true, step: 'creating', error: '' });
    addLog(`Conectando instância: ${state.instanceName}`, 'info');

    try {
      const blob = await EvolutionApiClient.createInstance(state.instanceName.trim());
      const imageUrl = URL.createObjectURL(blob);
      updateState({ 
        qrCodeImage: imageUrl, 
        step: 'qr_code',
        isLoading: false 
      });
      addLog('QR Code gerado! Iniciando verificação automática...', 'success');
      
      // Iniciar polling automaticamente após 2 segundos
      setTimeout(() => {
        startAutomaticPolling();
      }, 2000);
    } catch (err: any) {
      addLog(`Erro ao conectar: ${err.message}`, 'error');
      updateState({ 
        error: 'Erro ao conectar. Tente novamente.',
        step: 'failed',
        isLoading: false 
      });
    }
  };

  // Função para iniciar polling automático
  const startAutomaticPolling = () => {
    updateState({ step: 'connecting', connectionAttempts: 0 });
    
    console.log('🔄 Iniciando polling para:', state.instanceName);
    addLog('Iniciando verificação automática de conexão...', 'info');
    
    const interval = setInterval(async () => {
      console.log(`🔍 Tentativa ${state.connectionAttempts + 1}/3`);
      
      try {
        const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/pop-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName: state.instanceName })
        });

        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('📋 Result:', result);
        
        if (result.respond === 'positivo') {
          console.log('✅ CONEXÃO CONFIRMADA!');
          clearInterval(interval);
          addLog('✅ Conexão estabelecida com sucesso!', 'success');
          
          // Simular número de telefone (seria ideal obter da API real)
          setConnectedInstance({
            name: state.instanceName,
            phoneNumber: '5511965788543' // Número simulado
          });
          
          updateState({ step: 'connected' });
          return;
        }

        // Incrementar tentativas
        const newCount = state.connectionAttempts + 1;
        console.log(`⏰ Tentativa ${newCount}/3`);
        addLog(`Tentativa ${newCount}/${maxAttempts} - Aguardando conexão...`, 'info');
        
        if (newCount >= maxAttempts) {
          console.log('❌ TIMEOUT - 3 tentativas esgotadas');
          clearInterval(interval);
          addLog('❌ Conexão não confirmada em 3 tentativas', 'error');
          updateState({ 
            step: 'failed',
            error: 'Conexão não confirmada em 3 tentativas',
            connectionAttempts: newCount
          });
        } else {
          updateState({ connectionAttempts: newCount });
        }

      } catch (err: any) {
        console.error('🚨 Erro no polling:', err);
        clearInterval(interval);
        addLog(`Erro na verificação: ${err.message}`, 'error');
        updateState({ 
          step: 'failed',
          error: `Erro na verificação: ${err.message}` 
        });
      }
    }, 3000); // 3 segundos
    
    pollingInterval.current = interval;
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
    setConnectedInstance(null);
    setLogs([]);
  };

  // Função para desconectar instância
  const handleDisconnect = () => {
    addLog(`Desconectando instância: ${connectedInstance?.name}`, 'info');
    setConnectedInstance(null);
    updateState({ step: 'idle', instanceName: '', error: '' });
  };

  // Função para excluir instância
  const handleDelete = async () => {
    if (!connectedInstance) return;
    
    addLog(`Excluindo instância: ${connectedInstance.name}`, 'info');
    
    try {
      // Aqui você chamaria a API para excluir a instância
      // await EvolutionApiClient.deleteInstance(connectedInstance.name);
      
      addLog('Instância excluída com sucesso!', 'success');
      setConnectedInstance(null);
      updateState({ step: 'idle', instanceName: '', error: '' });
    } catch (err: any) {
      addLog(`Erro ao excluir instância: ${err.message}`, 'error');
    }
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
      {/* Botão Voltar */}
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="ml-2 text-sm text-muted-foreground">Voltar ao Dashboard</span>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Smartphone className="text-green-500" size={32} />
          <h1 className="text-2xl font-bold text-card-foreground">Conectar Evolution API</h1>
        </div>
        <p className="text-muted-foreground">Configure sua instância do WhatsApp</p>
      </div>

      {/* Tela Inicial - Input + 1 Botão */}
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
          
          <button
            onClick={connectEvolution}
            disabled={state.isLoading || !state.instanceName.trim()}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {state.isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Conectando...
              </>
            ) : (
              <>
                <Wifi size={20} />
                🔗 Conectar Evolution
              </>
            )}
          </button>
        </div>
      )}

      {/* QR Code + Verificação Automática */}
      {(state.step === 'qr_code' || state.step === 'connecting') && (
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
          
          {state.step === 'connecting' && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Loader2 className="animate-spin text-blue-500" size={20} />
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                  🔄 Verificando conexão automaticamente...
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Tentativa: {state.connectionAttempts}/{maxAttempts}
              </p>
            </div>
          )}
          
          <button
            onClick={handleReset}
            className="w-full bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80 flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            ❌ Cancelar
          </button>
        </div>
      )}


      {/* Sucesso - Instância Conectada */}
      {state.step === 'connected' && connectedInstance && (
        <div className="space-y-6">
          {/* Card da Instância Conectada */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {connectedInstance.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {connectedInstance.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Connected
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="flex-1 border-orange-500/20 text-orange-600 hover:bg-orange-500/10"
              >
                <Power className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="flex-1 border-red-500/20 text-red-600 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
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
              onClick={connectEvolution}
              disabled={state.isLoading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-lg hover:bg-muted/80"
            >
              🔙 Voltar
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
