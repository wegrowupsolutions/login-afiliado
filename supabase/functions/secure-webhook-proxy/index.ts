import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { url, method, headers: customHeaders, body }: WebhookRequest = await req.json()
    
    if (!url || !method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: url, method' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate URL to prevent SSRF attacks
    const allowedDomains = ['webhook.n8nlabz.com.br']
    const urlObj = new URL(url)
    if (!allowedDomains.includes(urlObj.hostname)) {
      return new Response(
        JSON.stringify({ error: 'URL not allowed' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log the request for security monitoring
    console.log(`Webhook request from user ${user.id}: ${method} ${url}`)

    // Make the secure webhook request
    const webhookResponse = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const responseData = await webhookResponse.text()
    
    // Log the response for monitoring
    console.log(`Webhook response: ${webhookResponse.status} ${responseData.substring(0, 200)}`)

    return new Response(
      responseData,
      { 
        status: webhookResponse.status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': webhookResponse.headers.get('content-type') || 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in webhook proxy:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})