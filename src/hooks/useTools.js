import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { saveTool, loadTools } from '../services/storage';
import { supabase } from '../lib/supabase';

export function useTools() {
  const [tools, setTools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tools on mount
  useEffect(() => {
    async function loadInitialTools() {
      try {
        setIsLoading(true);
        const loadedTools = await loadTools();
        if (loadedTools) setTools(loadedTools);
      } catch (error) {
        console.error('Failed to load tools:', error);
        toast.error('Failed to load tools');
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialTools();
  }, []);

  const handleSaveTool = async (toolData) => {
    try {
      const savedTool = await saveTool(toolData);
      if (savedTool) {
        if (toolData.id) {
          setTools(prev => prev.map(tool => 
            tool.id === toolData.id ? savedTool : tool
          ));
        } else {
          setTools(prev => [...prev, savedTool]);
        }
        toast.success(toolData.id ? 'Tool updated' : 'Tool created');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save tool:', error);
      toast.error('Failed to save tool');
      return false;
    }
  };

  const handleDeleteTool = async (toolId) => {
    try {
      const { error } = await supabase
        .from('tools')
        .delete()
        .eq('id', toolId);

      if (error) throw error;

      setTools(prev => prev.filter(t => t.id !== toolId));
      toast.success('Tool deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete tool:', error);
      toast.error('Failed to delete tool');
      return false;
    }
  };

  return {
    tools,
    setTools,
    handleSaveTool,
    handleDeleteTool,
    isLoading
  };
}