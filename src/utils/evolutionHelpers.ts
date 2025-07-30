export const validateInstanceName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Nome da instância é obrigatório';
  }
  
  if (name.length < 3) {
    return 'Nome deve ter pelo menos 3 caracteres';
  }
  
  if (name.length > 50) {
    return 'Nome deve ter no máximo 50 caracteres';
  }
  
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    return 'Nome deve conter apenas letras, números, hífens e underscores';
  }
  
  return null;
};

export const formatConnectionTime = (attempts: number): string => {
  const seconds = attempts * 3; // 3 segundos por tentativa
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

export const generateInstanceName = (prefix: string = 'instance'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};