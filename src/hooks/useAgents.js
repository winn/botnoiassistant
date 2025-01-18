import { useState, useEffect } from 'react';
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

  // Load agents on mount
  useEffect(() => {
    async function loadInitialAgents() {
      const loadedAgents = await loadAgents();
      if (loadedAgents?.length > 0) {
        setAgents(loadedAgents);
        setSelectedAgentId(loadedAgents[0].id);
      }
    }
    loadInitialAgents();
  }, []);

  const handleSaveAgent = async (agentData) => {
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
  };

  const handleDeleteAgent = async (agentId) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => prev.filter(a => a.id !== agentId));
      if (selectedAgentId === agentId) {
        setSelectedAgentId(agents.find(a => a.id !== agentId)?.id);
      }
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
    handleDeleteAgent
  };
}