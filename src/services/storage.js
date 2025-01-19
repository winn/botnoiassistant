import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Local storage helpers
function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
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
          onConflict: 'user_id, name'
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
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (error) throw error;
    return data?.value || null;
  } catch (error) {
    console.error('Failed to load credential:', error);
    const credentials = getLocalStorage('credentials', {});
    return credentials[name] || null;
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

// Load agents
export async function loadAgents() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to load agents:', error);
    return null;
  }
}

// Save agent
export async function saveAgent(agentData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to save agents');
      return null;
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
    return null;
  }
}

// Load tools
export async function loadTools() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('user_id', user.id);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to load tools:', error);
    return null;
  }
}

// Save tool
export async function saveTool(toolData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('You must be logged in to save tools');
      return null;
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
    return null;
  }
}

// Load agent conversations
export async function loadAgentConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('agent_id', agentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

// Save conversation
export async function saveConversation(agentId, conversation) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

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
    console.error('Failed to save conversation:', error);
    return false;
  }
}

// Clear conversations
export async function clearConversations(agentId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', user.id)
      .eq('agent_id', agentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to clear conversations:', error);
    return false;
  }
}