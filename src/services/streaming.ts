import { supabase } from '../lib/supabase';

export class StreamingService {
  private static channelName = 'streaming';

  static async broadcastText(text: string, agentId: string) {
    await supabase
      .channel(this.channelName)
      .send({
        type: 'broadcast',
        event: 'streaming',
        payload: { text, agentId }
      });
  }

  static async broadcastCompletion(agentId: string) {
    await supabase
      .channel(this.channelName)
      .send({
        type: 'broadcast',
        event: 'streaming',
        payload: { complete: true, agentId }
      });
  }
}