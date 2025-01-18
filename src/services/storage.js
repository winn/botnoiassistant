import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Local storage keys
const STORAGE_KEYS = {
  AGENTS: 'agents',
  TOOLS: 'tools',
  CREDENTIALS: 'credentials',
  CONVERSATIONS: 'conversations',
  PROFILE: 'profile'
};

// Helper functions for localStorage
const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
};

// Load user profile
export async function loadUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage(STORAGE_KEYS.PROFILE);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return getLocalStorage(STORAGE_KEYS.PROFILE);
  }
}

// Save or update an agent
export async function saveAgent(agent) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const agentData = {
      id: agent.id || crypto.randomUUID(),
      name: agent.name,
      character: agent.character,
      actions: agent.actions,
      enabled_tools: agent.enabled_tools || [],
      faqs: agent.faqs || [],
      is_public: false
    };

    if (user) {
      const { data, error } = await supabase
        .from('agents')
        .upsert({
          ...agentData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        enabled_tools: data.enabled_tools || [],
        faqs: data.faqs || []
      };
    } else {
      // Store in localStorage
      const agents = getLocalStorage(STORAGE_KEYS.AGENTS, []);
      const index = agents.findIndex(a => a.id === agentData.id);
      
      if (index !== -1) {
        agents[index] = agentData;
      } else {
        agents.push(agentData);
      }
      
      setLocalStorage(STORAGE_KEYS.AGENTS, agents);
      return agentData;
    }
  } catch (error) {
    console.error('Failed to save agent:', error);
    toast.error('Failed to save agent');
    return null;
  }
}

// Load all agents
export async function loadAgents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage(STORAGE_KEYS.AGENTS, []);
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(agent => ({
      ...agent,
      enabled_tools: agent.enabled_tools || [],
      faqs: agent.faqs || []
    }));
  } catch (error) {
    console.error('Failed to load agents:', error);
    return getLocalStorage(STORAGE_KEYS.AGENTS, []);
  }
}

// Save or update a tool
export async function saveTool(tool) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const toolData = {
      id: tool.id || crypto.randomUUID(),
      name: tool.name,
      description: tool.description,
      input: tool.input,
      output: tool.output,
      method: tool.method,
      endpoint: tool.endpoint,
      headers: tool.headers || '{}',
      body_template: tool.body || '{}',
      is_public: false
    };

    if (user) {
      const { data, error } = await supabase
        .from('tools')
        .upsert({
          ...toolData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        input: data.input,
        output: data.output,
        body: data.body_template
      };
    } else {
      // Store in localStorage
      const tools = getLocalStorage(STORAGE_KEYS.TOOLS, []);
      const index = tools.findIndex(t => t.id === toolData.id);
      
      if (index !== -1) {
        tools[index] = toolData;
      } else {
        tools.push(toolData);
      }
      
      setLocalStorage(STORAGE_KEYS.TOOLS, tools);
      return {
        ...toolData,
        body: toolData.body_template
      };
    }
  } catch (error) {
    console.error('Failed to save tool:', error);
    toast.error('Failed to save tool');
    return null;
  }
}

// Load all tools
export async function loadTools() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage(STORAGE_KEYS.TOOLS, []);
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(tool => ({
      ...tool,
      input: tool.input,
      output: tool.output,
      body: tool.body_template
    }));
  } catch (error) {
    console.error('Failed to load tools:', error);
    return getLocalStorage(STORAGE_KEYS.TOOLS, []);
  }
}

// Save a credential
export async function saveCredential(name, value) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('credentials')
        .upsert({
          user_id: user.id,
          name,
          value
        }, {
          onConflict: 'user_id,name'
        });

      if (error) throw error;
    } else {
      // Store in localStorage
      const credentials = getLocalStorage(STORAGE_KEYS.CREDENTIALS, {});
      credentials[name] = value;
      setLocalStorage(STORAGE_KEYS.CREDENTIALS, credentials);
    }
    return true;
  } catch (error) {
    console.error('Failed to save credential:', error);
    toast.error('Failed to save credential');
    return false;
  }
}

// Load a credential
export async function loadCredential(name) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const credentials = getLocalStorage(STORAGE_KEYS.CREDENTIALS, {});
      return credentials[name] || null;
    }

    const { data, error } = await supabase
      .from('credentials')
      .select('value')
      .eq('name', name)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data?.value || null;
  } catch (error) {
    console.error('Failed to load credential:', error);
    const credentials = getLocalStorage(STORAGE_KEYS.CREDENTIALS, {});
    return credentials[name] || null;
  }
}

// Load conversations for a specific agent
export async function loadAgentConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !agentId) {
      const conversations = getLocalStorage(STORAGE_KEYS.CONVERSATIONS, {});
      return conversations[agentId] || [];
    }

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
        enabled_tools: conv.agents.enabled_tools || [],
        faqs: conv.agents.faqs || []
      } : null
    }));
  } catch (error) {
    console.error('Failed to load agent conversations:', error);
    const conversations = getLocalStorage(STORAGE_KEYS.CONVERSATIONS, {});
    return conversations[agentId] || [];
  }
}

// Load latest conversations for all agents
export async function loadLatestConversations() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // For localStorage, get all conversations and sort by timestamp
      const conversations = getLocalStorage(STORAGE_KEYS.CONVERSATIONS, {});
      return Object.values(conversations)
        .flat()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 50);
    }

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
      .order('created_at', { ascending: false })
      .limit(50);

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
        enabled_tools: conv.agents.enabled_tools || [],
        faqs: conv.agents.faqs || []
      } : null
    }));
  } catch (error) {
    console.error('Failed to load latest conversations:', error);
    // Fallback to localStorage
    const conversations = getLocalStorage(STORAGE_KEYS.CONVERSATIONS, {});
    return Object.values(conversations)
      .flat()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 50);
  }
}

// Save a conversation
export async function saveConversation(agentId, conversation) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('conversations')
        .insert({
          agent_id: agentId,
          user_input: conversation.userInput,
          ai_response: conversation.aiResponse,
          debug_info: conversation.debug,
          user_id: user.id
        });

      if (error) throw error;
    } else {
      // Store in localStorage
      const conversations = getLocalStorage(STORAGE_KEYS.CONVERSATIONS, {});
      if (!conversations[agentId]) {
        conversations[agentId] = [];
      }
      conversations[agentId].push({
        ...conversation,
        timestamp: Date.now()
      });
      setLocalStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
    return true;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return false;
  }
}

// Clear conversations for an agent
export async function clearConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('agent_id', agentId)
        .eq('user_id', user.id);

      if (error) throw error;
    } else {
      // Clear from localStorage
      const conversations = getLocalStorage(STORAGE_KEYS.CONVERSATIONS, {});
      conversations[agentId] = [];
      setLocalStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
    }
    return true;
  } catch (error) {
    console.error('Failed to clear conversations:', error);
    return false;
  }
}