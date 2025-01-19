import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { saveAgent, loadAgents } from '../services/storage';
import { supabase } from '../lib/supabase';

const DEFAULT_AGENT = {
  id: crypto.randomUUID(),
  name: 'Eva',
  character: 'เป็นเพื่อนผู้หญิงน่ารัก คอยช่วยเหลือ ใจดี',
  actions: 'ให้ตอบสั้น ๆ เหมือนคุยกับเพื่อน ให้พูดไพเราะ ลงท้ายด้วยค่ะ แทนตัวเองว่า เอวา',
  enabled_tools: [],
  faqs: []
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
        
        if (loadedAgents?.length > 0) {
          setAgents(loadedAgents);
          setSelectedAgentId(loadedAgents[0].id);
        } else {
          // Save default agent if no agents exist
          const savedAgent = await saveAgent(DEFAULT_AGENT);
          if (savedAgent) {
            setAgents([savedAgent]);
            setSelectedAgentId(savedAgent.id);
          }
        }
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
      const savedAgent = await saveAgent(agentData);
      if (savedAgent) {
        if (agentData.id) {
          setAgents(prev => prev.map(agent => 
            agent.id === agentData.id ? savedAgent : agent
          ));
        } else {
          setAgents(prev => [...prev, savedAgent]);
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
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => {
        const newAgents = prev.filter(a => a.id !== agentId);
        // If no agents left, add default agent
        if (newAgents.length === 0) {
          return [DEFAULT_AGENT];
        }
        return newAgents;
      });

      // Update selected agent if needed
      if (selectedAgentId === agentId) {
        setSelectedAgentId(prev => {
          const remainingAgent = agents.find(a => a.id !== agentId);
          return remainingAgent?.id || DEFAULT_AGENT.id;
        });
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