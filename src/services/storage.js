import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Helper functions for localStorage
function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
}

// Save or update an agent
export async function saveAgent(agent) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const agentData = {
      id: agent.id || crypto.randomUUID(),
      name: agent.name.trim(),
      character: agent.character.trim(),
      actions: agent.actions.trim(),
      enabled_tools: agent.enabled_tools || [],
      faqs: agent.faqs?.map(faq => ({
        ...faq,
        question: faq.question.trim(),
        answer: faq.answer.trim()
      })) || [],
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
      return data;
    } else {
      // Store in localStorage
      const agents = getLocalStorage('agents', []);
      const index = agents.findIndex(a => a.id === agentData.id);
      
      if (index !== -1) {
        agents[index] = agentData;
      } else {
        agents.push(agentData);
      }
      
      setLocalStorage('agents', agents);
      return agentData;
    }
  } catch (error) {
    console.error('Failed to save agent:', error);
    toast.error(error.message || 'Failed to save agent');
    return null;
  }
}

// Save or update a tool
export async function saveTool(tool) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const toolData = {
      id: tool.id || crypto.randomUUID(),
      name: tool.name.trim(),
      description: tool.description.trim(),
      input: {
        description: tool.input.description.trim(),
        schema: typeof tool.input.schema === 'string' ? tool.input.schema : JSON.stringify(tool.input.schema)
      },
      output: {
        description: tool.output.description.trim(),
        schema: typeof tool.output.schema === 'string' ? tool.output.schema : JSON.stringify(tool.output.schema)
      },
      method: tool.method || 'GET',
      endpoint: tool.endpoint.trim(),
      headers: typeof tool.headers === 'string' ? tool.headers : JSON.stringify(tool.headers),
      body_template: typeof tool.body_template === 'string' ? tool.body_template : JSON.stringify(tool.body_template),
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
      return data;
    } else {
      // Store in localStorage
      const tools = getLocalStorage('tools', []);
      const index = tools.findIndex(t => t.id === toolData.id);
      
      if (index !== -1) {
        tools[index] = toolData;
      } else {
        tools.push(toolData);
      }
      
      setLocalStorage('tools', tools);
      return toolData;
    }
  } catch (error) {
    console.error('Failed to save tool:', error);
    toast.error(error.message || 'Failed to save tool');
    return null;
  }
}

// Load agents
export async function loadAgents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage('agents', []);
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load agents:', error);
    return getLocalStorage('agents', []);
  }
}

// Load tools
export async function loadTools() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalStorage('tools', []);
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .or(`user_id.eq.${user.id},is_public.eq.true`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load tools:', error);
    return getLocalStorage('tools', []);
  }
}

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
      const credentials = getLocalStorage('credentials', {});
      credentials[name] = value;
      setLocalStorage('credentials', credentials);
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
      const credentials = getLocalStorage('credentials', {});
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
    const credentials = getLocalStorage('credentials', {});
    return credentials[name] || null;
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
      const conversations = getLocalStorage('conversations', {});
      if (!conversations[agentId]) {
        conversations[agentId] = [];
      }
      conversations[agentId].push({
        ...conversation,
        timestamp: Date.now()
      });
      setLocalStorage('conversations', conversations);
    }
    return true;
  } catch (error) {
    console.error('Failed to save conversation:', error);
    return false;
  }
}

// Load conversations for an agent
export async function loadAgentConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !agentId) {
      const conversations = getLocalStorage('conversations', {});
      return conversations[agentId] || [];
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('agent_id', agentId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load agent conversations:', error);
    const conversations = getLocalStorage('conversations', {});
    return conversations[agentId] || [];
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
      const conversations = getLocalStorage('conversations', {});
      conversations[agentId] = [];
      setLocalStorage('conversations', conversations);
    }
    return true;
  } catch (error) {
    console.error('Failed to clear conversations:', error);
    return false;
  }
}