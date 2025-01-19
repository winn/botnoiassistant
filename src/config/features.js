export const FEATURES = {
  voice: {
    enabled: true,
    recognition: {
      enabled: true,
      language: 'th-TH',
      continuous: true
    },
    synthesis: {
      enabled: true,
      defaultVoice: 'th-TH'
    }
  },
  chat: {
    streaming: true,
    debug: false,
    maxLength: 1000
  },
  ui: {
    darkMode: false,
    animations: true,
    responsiveVoice: true // Hide voice features on mobile
  }
};