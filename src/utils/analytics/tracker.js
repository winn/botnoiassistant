export class AnalyticsTracker {
  static events = {
    CHAT_MESSAGE: 'chat_message',
    VOICE_START: 'voice_start',
    VOICE_END: 'voice_end',
    ERROR: 'error',
    TOOL_USE: 'tool_use',
    AGENT_SWITCH: 'agent_switch'
  };

  static async trackEvent(eventName, properties = {}) {
    try {
      const payload = {
        event: eventName,
        timestamp: new Date().toISOString(),
        properties: {
          ...properties,
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      };

      // Track performance metrics if available
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      if (navigationTiming) {
        payload.performance = {
          loadTime: navigationTiming.loadEventEnd - navigationTiming.startTime,
          domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.startTime,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime
        };
      }

      // Send to analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  static async trackError(error, context = {}) {
    await this.trackEvent(this.events.ERROR, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context
    });
  }

  static async trackMessage(message, type, duration) {
    await this.trackEvent(this.events.CHAT_MESSAGE, {
      type,
      length: message.length,
      duration,
      hasVoice: Boolean(message.audioUrl)
    });
  }

  static async trackVoice(action, duration) {
    await this.trackEvent(
      action === 'start' ? this.events.VOICE_START : this.events.VOICE_END,
      { duration }
    );
  }

  static async trackToolUse(toolName, success, duration) {
    await this.trackEvent(this.events.TOOL_USE, {
      tool: toolName,
      success,
      duration
    });
  }
}