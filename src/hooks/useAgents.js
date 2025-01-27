import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { saveAgent, loadAgents } from '../services/storage';
import { supabase } from '../lib/supabase';

const DEFAULT_AGENT = {
  id: 'default-agent',
  name: 'Eva',
  character: 'Eva is a friendly, knowledgeable, and patient AI assistant designed to help users navigate the AI builder platform. It uses simple, conversational language to make users feel comfortable and provides step-by-step guidance without overwhelming them. Aiden is proactive, offering tips and encouragement to keep users motivated. Its goal is to make building and sharing AI agents effortless and enjoyable.',
  actions: 'Be Approachable: Use warm, conversational language and avoid technical jargon.\n\nProvide Clear Guidance: Break down tasks into simple, actionable steps.\n\nAnticipate Needs: Offer suggestions and tips before users ask for help.\n\nCelebrate Progress: Acknowledge user achievements and encourage exploration of new features.',
  enabled_tools: [],
  faqs: [],
  isDefault: true
};

export function useAgents() {
  const [agents, setAgents] = useState([DEFAULT_AGENT]);
  const [selectedAgentId, setSelectedAgentId] = useState(DEFAULT_AGENT.id);
  const [isLoading, setIsLoading] = useState(true);

  // Load agents on mount
  useEffect(() => {
    async function loadInitialAgents() {
      try {
        setIsLoading(true);
        const loadedAgents = await loadAgents();
        
        // Always include default agent at the start
        const filteredAgents = loadedAgents?.filter(a => a.id !== DEFAULT_AGENT.id) || [];
        setAgents([DEFAULT_AGENT, ...filteredAgents]);
        setSelectedAgentId(DEFAULT_AGENT.id);
      } catch (error) {
        console.error('Failed to load agents:', error);
        toast.error('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialAgents();
  }, []);

  // Subscribe to shared_agents changes
  useEffect(() => {
    const channel = supabase
      .channel('shared_agents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_agents'
        },
        () => {
          // Refresh sharing status when changes occur
          const agentIds = agents.map(a => a.id);
          if (agentIds.length > 0) {
            updateSharingStatus(agentIds);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agents]);

  // Update sharing status
  const updateSharingStatus = useCallback(async (agentIds) => {
    if (!agentIds?.length) return;
    
    try {
      const { data } = await supabase
        .from('shared_agents')
        .select('agent_id')
        .in('agent_id', agentIds);

      const sharedAgentIds = new Set(data?.map(sa => sa.agent_id) || []);
      
      setAgents(prev => prev.map(agent => ({
        ...agent,
        is_shared: sharedAgentIds.has(agent.id)
      })));
    } catch (error) {
      console.error('Error updating share status:', error);
    }
  }, []);

  const handleSaveAgent = async (agentData) => {
    try {
      // Prevent modifying default agent
      if (agentData.id === DEFAULT_AGENT.id) {
        toast.error('Cannot modify the default agent');
        return false;
      }

      const savedAgent = await saveAgent(agentData);
      if (savedAgent) {
        if (agentData.id) {
          setAgents(prev => prev.map(agent => 
            agent.id === agentData.id ? savedAgent : agent
          ));
        } else {
          setAgents(prev => [DEFAULT_AGENT, ...prev.filter(a => a.id !== DEFAULT_AGENT.id), savedAgent]);
          setSelectedAgentId(savedAgent.id);
        }
        toast.success(agentData.id ? 'Agent updated' : 'Agent created');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save agent:', error);
      toast.error('Failed to save agent');
      return false;
    }
  };

  const handleDeleteAgent = async (agentId) => {
    // Prevent deleting default agent
    if (agentId === DEFAULT_AGENT.id) {
      toast.error('Cannot delete the default agent');
      return false;
    }

    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => [DEFAULT_AGENT, ...prev.filter(a => a.id !== agentId && a.id !== DEFAULT_AGENT.id)]);

      // Update selected agent if needed
      if (selectedAgentId === agentId) {
        setSelectedAgentId(DEFAULT_AGENT.id);
      }

      toast.success('Agent deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent');
      return false;
    }
  };

  return {
    agents,
    setAgents,
    selectedAgentId,
    setSelectedAgentId,
    handleSaveAgent,
    handleDeleteAgent,
    isLoading
  };
}