export interface EvolutionApiResponse {
  respond?: 'positivo' | 'negativo';
  message?: string;
  status?: string;
}

export class EvolutionApiClient {
  private static baseUrl = 'https://webhook.serverwegrowup.com.br/webhook';

  static async createInstance(instanceName: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/instancia-evolution-afiliado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceName })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response.blob();
  }

  static async checkConnection(instanceName: string): Promise<EvolutionApiResponse> {
    const response = await fetch(`${this.baseUrl}/pop-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceName })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response.json();
  }

  static async refreshQrCode(instanceName: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/atualizar-qr-code-afiliado`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instanceName })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return response.blob();
  }
}