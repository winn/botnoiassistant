import { useEffect } from 'react';
import { WebSocketService } from '../services/websocket';

export function useWebSocket() {
  useEffect(() => {
    const wsService = WebSocketService.getInstance();

    return () => {
      wsService.cleanup();
    };
  }, []);
}