import { supabase } from '@/integrations/supabase/client';

interface SecureApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

interface SecureApiResponse {
  data?: any;
  error?: string;
  status: number;
}

/**
 * Secure API utility that routes external API calls through a Supabase edge function
 * This prevents direct exposure of external API endpoints and adds security logging
 */
export const secureApiCall = async ({
  url,
  method,
  headers,
  body
}: SecureApiRequest): Promise<SecureApiResponse> => {
  try {
    // Input validation
    if (!url || !method) {
      return {
        error: 'URL and method are required',
        status: 400
      };
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return {
        error: 'Invalid URL format',
        status: 400
      };
    }

    const { data, error } = await supabase.functions.invoke('secure-webhook-proxy', {
      body: {
        url,
        method,
        headers,
        body
      }
    });

    if (error) {
      console.error('Secure API call failed:', error);
      return {
        error: error.message || 'API call failed',
        status: 500
      };
    }

    return {
      data,
      status: 200
    };
  } catch (error) {
    console.error('Secure API call error:', error);
    return {
      error: 'Internal error occurred',
      status: 500
    };
  }
};

/**
 * Input sanitization utility
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
};

/**
 * Data validation utility for external API requests
 */
export const validateApiRequestData = (data: any): boolean => {
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i
  ];

  const dataString = JSON.stringify(data || {});
  
  return !dangerousPatterns.some(pattern => pattern.test(dataString));
};