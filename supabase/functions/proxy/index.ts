import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const { sessionId, shareId, message } = await req.json()

    if (!sessionId || !shareId || !message) {
      throw new Error('Missing required parameters')
    }

    console.log('Processing request:', { shareId, sessionId, messageLength: message.length })

    // Get the public agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select(`
        id,
        user_id,
        name,
        character,
        actions,
        enabled_tools,
        faqs,
        is_public
      `)
      .eq('id', shareId)
      .eq('is_public', true)
      .single()

    if (agentError) {
      console.error('Database error:', agentError)
      throw new Error('Failed to load agent')
    }

    if (!agent) {
      throw new Error('Agent not found or is not public')
    }

    // Get owner's credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from('credentials')
      .select('name, value')
      .eq('user_id', agent.user_id)

    if (credentialsError) {
      console.error('Credentials error:', credentialsError)
      throw new Error('Failed to load credentials')
    }

    // Extract API keys from credentials
    const openaiKey = credentials?.find(c => c.name === 'openai')?.value
    const botnoiToken = credentials?.find(c => c.name === 'botnoi')?.value

    if (!openaiKey || !botnoiToken) {
      throw new Error('Agent owner has not configured required API credentials')
    }

    // Make request to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `${agent.character}\n\n${agent.actions}`
          },
          {
            role: 'user',
            content: message
          }
        ]
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => null)
      console.error('OpenAI API error:', errorData)
      throw new Error(errorData?.error?.message || 'OpenAI API error')
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0].message.content

    // Generate speech using Botnoi
    const botnoiResponse = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
      method: 'POST',
      headers: {
        'Botnoi-Token': botnoiToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text: aiResponse,
        speaker: "1",
        volume: 1,
        speed: 1,
        type_media: "mp3",
        save_file: true,
        language: "th"
      })
    })

    if (!botnoiResponse.ok) {
      const errorData = await botnoiResponse.json().catch(() => null)
      console.error('Botnoi API error:', errorData)
      throw new Error(errorData?.error?.message || 'Botnoi API error')
    }

    const botnoiData = await botnoiResponse.json()

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        audio_url: botnoiData.audio_url
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred'
      }),
      {
        status: error.status || 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})