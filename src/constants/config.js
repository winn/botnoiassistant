export const APP_CONFIG = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 10000,
    retryAttempts: 3
  },
  chat: {
    maxMessageLength: 1000,
    typingDelay: 500,
    maxHistoryLength: 100
  },
  ui: {
    theme: {
      primary: 'sky',
      secondary: 'gray',
      accent: 'blue'
    },
    animation: {
      duration: 200,
      easing: 'ease-in-out'
    }
  }
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export const LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxUploadFiles: 10,
  maxConcurrentRequests: 5
};