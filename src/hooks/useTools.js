import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { saveTool, loadTools } from '../services/storage';

export function useTools() {
  const [tools, setTools] = useState([]);

  // Load tools on mount
  useEffect(() => {
    async function loadInitialTools() {
      const loadedTools = await loadTools();
      if (loadedTools) setTools(loadedTools);
    }
    loadInitialTools();
  }, []);

  const handleSaveTool = async (toolData) => {
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
  };

  return {
    tools,
    setTools,
    handleSaveTool
  };
}