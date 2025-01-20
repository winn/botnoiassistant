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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const { agentId, timestamp, message, sessionId: existingSessionId } = await req.json()

    if (!agentId) {
      throw new Error('Missing agent ID')
    }

    // First verify the agent exists and is public
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, session_quota')
      .eq('id', agentId)
      .eq('is_public', true)
      .single()

    if (agentError || !agent) {
      throw new Error('Agent not found or not public')
    }

    // If we have an existing session ID, update message count
    if (existingSessionId && message) {
      // First get current session
      const { data: currentSession, error: sessionError } = await supabase
        .from('shared_sessions')
        .select('message_count, daily_usage')
        .eq('session_id', existingSessionId)
        .eq('agent_id', agentId)
        .single()

      if (sessionError) {
        throw new Error('Failed to get session')
      }

      // Check if session quota is exceeded
      if (currentSession.message_count >= agent.session_quota) {
        throw new Error('Session quota exceeded')
      }

      // Then update with incremented values
      const { error: updateError } = await supabase
        .from('shared_sessions')
        .update({
          message_count: (currentSession.message_count || 0) + 1,
          daily_usage: (currentSession.daily_usage || 0) + 1,
          last_message_at: new Date().toISOString()
        })
        .eq('session_id', existingSessionId)
        .eq('agent_id', agentId)

      if (updateError) {
        throw new Error('Failed to update session')
      }

      // Return success for message update
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Session updated'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }

    // For new sessions, verify timestamp and create session
    if (!timestamp) {
      throw new Error('Missing timestamp for new session')
    }

    // Create session ID from agent ID and timestamp
    const sessionId = `${agentId}_${timestamp}`

    // Create new session with agent's quota
    const { data: session, error: sessionError } = await supabase
      .from('shared_sessions')
      .insert({
        agent_id: agentId,
        session_id: sessionId,
        message_count: 0,
        daily_usage: 0,
        session_quota: agent.session_quota,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

    // Return success with session info
    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        session
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})