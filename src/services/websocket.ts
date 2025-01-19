import { supabase } from '../lib/supabase';
import { store } from '../store';
import { addMessage, setStreamingText } from '../store/slices/chatSlice';
import { updateAgent } from '../store/slices/agentsSlice';

export class WebSocketService {
  private static instance: WebSocketService;
  private subscriptions: Map<string, any> = new Map();

  private constructor() {
    this.initializeSubscriptions();
  }

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private initializeSubscriptions() {
    // Subscribe to real-time messages
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          if (payload.new) {
            store.dispatch(addMessage({
              agentId: payload.new.agent_id,
              message: {
                id: payload.new.id,
                content: payload.new.content,
                role: payload.new.role,
                timestamp: new Date(payload.new.created_at).getTime()
              }
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to agent updates
    const agentsSubscription = supabase
      .channel('agents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents'
        },
        (payload) => {
          if (payload.new) {
            store.dispatch(updateAgent(payload.new));
          }
        }
      )
      .subscribe();

    // Subscribe to streaming responses
    const streamingSubscription = supabase
      .channel('streaming')
      .on(
        'broadcast',
        { event: 'streaming' },
        (payload) => {
          if (payload.text) {
            store.dispatch(setStreamingText(payload.text));
          }
        }
      )
      .subscribe();

    this.subscriptions.set('messages', messagesSubscription);
    this.subscriptions.set('agents', agentsSubscription);
    this.subscriptions.set('streaming', streamingSubscription);
  }

  public cleanup() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}