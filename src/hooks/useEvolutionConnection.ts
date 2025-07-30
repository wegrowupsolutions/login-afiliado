import { useState, useRef, useCallback } from 'react';

export interface ConnectionState {
  step: 'idle' | 'creating' | 'generate_qr' | 'qr_code' | 'connecting' | 'connected' | 'failed';
  instanceName: string;
  qrCodeImage: string | null;
  error: string;
  isLoading: boolean;
  connectionAttempts: number;
}

export const useEvolutionConnection = () => {
  const [state, setState] = useState<ConnectionState>({
    step: 'idle',
    instanceName: '',
    qrCodeImage: null,
    error: '',
    isLoading: false,
    connectionAttempts: 0
  });

  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const maxAttempts = 30;

  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConnection = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    
    if (state.qrCodeImage) {
      URL.revokeObjectURL(state.qrCodeImage);
    }

    setState({
      step: 'idle',
      instanceName: '',
      qrCodeImage: null,
      error: '',
      isLoading: false,
      connectionAttempts: 0
    });
  }, [state.qrCodeImage]);

  return {
    state,
    updateState,
    resetConnection,
    pollingInterval,
    maxAttempts
  };
};