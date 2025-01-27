import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Local storage helpers with error handling
function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Error writing to localStorage:', error);
    return false;
  }
}

// Save a credential with fallback to localStorage
export async function saveCredential(name, value) {
  try {
    // Always save to localStorage first as backup
    const credentials = getLocalStorage('credentials', {});
    credentials[name] = value;
    setLocalStorage('credentials', credentials);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return true; // Successfully saved to localStorage
    }

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
    return true;
  } catch (error) {
    console.warn('Failed to save credential to Supabase:', error);
    // Don't show error toast since we saved to localStorage successfully
    return true;
  }
}

// Load a credential with fallback to localStorage
export async function loadCredential(name) {
  try {
    // First try to get from localStorage
    const credentials = getLocalStorage('credentials', {});
    const localValue = credentials[name] || '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return localValue;
      }

      const { data, error } = await supabase
        .from('credentials')
        .select('value')
        .eq('user_id', user.id)
        .eq('name', name)
        .maybeSingle();

      if (error) {
        // Only log real errors
        if (!error.message?.includes('no rows')) {
          console.warn('Failed to load credential from Supabase:', error);
        }
        return localValue;
      }

      // If found in Supabase, update localStorage
      if (data?.value) {
        credentials[name] = data.value;
        setLocalStorage('credentials', credentials);
        return data.value;
      }

      return localValue;
    } catch (error) {
      console.warn('Failed to connect to Supabase:', error);
      return localValue;
    }
  } catch (error) {
    console.warn('Failed to load credential:', error);
    return '';
  }
}

// Load user profile with graceful fallback
export async function loadUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // Only show error for unexpected issues
      if (!error.message?.includes('no rows')) {
        console.warn('Failed to load user profile:', error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Failed to load user profile:', error);
    return null;
  }
}

// Load agents with fallback to localStorage
export async function loadAgents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return getLocalStorage('agents', []);
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Failed to load agents:', error);
    return getLocalStorage('agents', []);
  }
}

// Save agent with fallback to localStorage
export async function saveAgent(agentData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Save to local storage if not logged in
      const agents = getLocalStorage('agents', []);
      const newAgent = {
        ...agentData,
        id: agentData.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedAgents = agentData.id 
        ? agents.map(a => a.id === agentData.id ? newAgent : a)
        : [...agents, newAgent];

      setLocalStorage('agents', updatedAgents);
      return newAgent;
    }

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
  } catch (error) {
    console.error('Failed to save agent:', error);
    toast.error('Failed to save agent');
    return null;
  }
}

// Load tools with fallback to localStorage
export async function loadTools() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return getLocalStorage('tools', []);
    }

    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Failed to load tools:', error);
    return getLocalStorage('tools', []);
  }
}

// Save tool with fallback to localStorage
export async function saveTool(toolData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Save to local storage if not logged in
      const tools = getLocalStorage('tools', []);
      const newTool = {
        ...toolData,
        id: toolData.id || crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const updatedTools = toolData.id 
        ? tools.map(t => t.id === toolData.id ? newTool : t)
        : [...tools, newTool];

      setLocalStorage('tools', updatedTools);
      return newTool;
    }

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
  } catch (error) {
    console.error('Failed to save tool:', error);
    toast.error('Failed to save tool');
    return null;
  }
}

// Load agent conversations with fallback
export async function loadAgentConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return getLocalStorage(`conversations_${agentId}`, []);
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('Failed to load conversations:', error);
    return getLocalStorage(`conversations_${agentId}`, []);
  }
}

// Save conversation with fallback
export async function saveConversation(agentId, conversation) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Save to local storage if not logged in
      const conversations = getLocalStorage(`conversations_${agentId}`, []);
      const newConversation = {
        ...conversation,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString()
      };
      conversations.push(newConversation);
      setLocalStorage(`conversations_${agentId}`, conversations);
      return true;
    }

    const { error } = await supabase
      .from('conversations')
      .insert({
        agent_id: agentId,
        user_id: user.id,
        user_input: conversation.userInput,
        ai_response: conversation.aiResponse,
        debug_info: conversation.debug
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to save conversation:', error);
    return false;
  }
}

// Clear conversations with fallback
export async function clearConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocalStorage(`conversations_${agentId}`, []);
      return true;
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.warn('Failed to clear conversations:', error);
    return false;
  }
}