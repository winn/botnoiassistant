import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Load user profile
export async function loadUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return null;
  }
}

// Save or update an agent
export async function saveAgent(agent) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to save agents');
      return null;
    }

    const agentData = {
      id: agent.id || crypto.randomUUID(),
      name: agent.name,
      character: agent.character,
      actions: agent.actions,
      enabled_tools: agent.enabledTools || [],
      faqs: agent.faqs || [],
      user_id: user.id,
      is_public: false
    };

    const { data, error } = await supabase
      .from('agents')
      .upsert(agentData)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      enabledTools: data.enabled_tools || [],
      faqs: data.faqs || []
    };
  } catch (error) {
    console.error('Failed to save agent:', error);
    toast.error('Failed to save agent');
    return null;
  }
}

// Load all agents for the current user
export async function loadAgents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(agent => ({
      ...agent,
      enabledTools: agent.enabled_tools || [],
      faqs: agent.faqs || []
    }));
  } catch (error) {
    console.error('Failed to load agents:', error);
    return [];
  }
}

// Save or update a tool
export async function saveTool(tool) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to save tools');
      return null;
    }

    const toolData = {
      id: tool.id || crypto.randomUUID(),
      name: tool.name,
      description: tool.description,
      input_schema: tool.input,
      output_schema: tool.output,
      method: tool.method,
      endpoint: tool.endpoint,
      headers: tool.headers || '{}',
      body_template: tool.body || '{}',
      user_id: user.id,
      is_public: false
    };

    const { data, error } = await supabase
      .from('tools')
      .upsert(toolData)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      input: data.input_schema,
      output: data.output_schema,
      body: data.body_template
    };
  } catch (error) {
    console.error('Failed to save tool:', error);
    toast.error('Failed to save tool');
    return null;
  }
}

// Load all tools for the current user
export async function loadTools() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(tool => ({
      ...tool,
      input: tool.input_schema,
      output: tool.output_schema,
      body: tool.body_template
    }));
  } catch (error) {
    console.error('Failed to load tools:', error);
    return [];
  }
}

// Save a setting for the current user
export async function saveSetting(key, value) {
  if (!key) return false;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('settings')
      .upsert({ 
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        user_id: user.id
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to save setting:', error);
    return false;
  }
}

// Load a setting for the current user
export async function loadSetting(key) {
  if (!key) return null;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    
    return data?.value || null;
  } catch (error) {
    console.warn('Failed to load setting:', error);
    return null;
  }
}

// Load conversations for a specific agent
export async function loadAgentConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !agentId) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        agents:agent_id (
          name,
          character,
          actions,
          enabled_tools,
          faqs
        )
      `)
      .eq('user_id', user.id)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(conv => ({
      userInput: conv.user_input,
      aiResponse: conv.ai_response,
      debug: conv.debug_info,
      timestamp: new Date(conv.created_at).getTime(),
      agentId: conv.agent_id,
      agentName: conv.agents?.name,
      agent: conv.agents ? {
        ...conv.agents,
        enabledTools: conv.agents.enabled_tools || [],
        faqs: conv.agents.faqs || []
      } : null
    }));
  } catch (error) {
    console.error('Failed to load agent conversations:', error);
    return [];
  }
}

// Load latest conversations for all agents
export async function loadLatestConversations() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        agents:agent_id (
          name,
          character,
          actions,
          enabled_tools,
          faqs
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50); // Limit to most recent 50 conversations

    if (error) throw error;

    return (data || []).map(conv => ({
      userInput: conv.user_input,
      aiResponse: conv.ai_response,
      debug: conv.debug_info,
      timestamp: new Date(conv.created_at).getTime(),
      agentId: conv.agent_id,
      agentName: conv.agents?.name,
      agent: conv.agents ? {
        ...conv.agents,
        enabledTools: conv.agents.enabled_tools || [],
        faqs: conv.agents.faqs || []
      } : null
    }));
  } catch (error) {
    console.error('Failed to load latest conversations:', error);
    return [];
  }
}

// Load all conversations grouped by agent
export async function loadAllConversations() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        agents:agent_id (
          name,
          character,
          actions,
          enabled_tools,
          faqs
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).reduce((acc, conv) => {
      const agentId = conv.agent_id;
      if (!acc[agentId]) {
        acc[agentId] = [];
      }

      acc[agentId].push({
        userInput: conv.user_input,
        aiResponse: conv.ai_response,
        debug: conv.debug_info,
        timestamp: new Date(conv.created_at).getTime(),
        agentId: conv.agent_id,
        agentName: conv.agents?.name,
        agent: conv.agents ? {
          ...conv.agents,
          enabledTools: conv.agents.enabled_tools || [],
          faqs: conv.agents.faqs || []
        } : null
      });

      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return {};
  }
}