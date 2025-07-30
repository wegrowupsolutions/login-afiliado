export interface EvolutionInstance {
  name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'failed';
  createdAt: Date;
  lastConnectedAt?: Date;
  qrCodeUrl?: string;
}

export interface EvolutionConnectionEvent {
  type: 'connection_success' | 'connection_failed' | 'qr_generated' | 'polling_started';
  instanceName: string;
  timestamp: Date;
  details?: any;
}