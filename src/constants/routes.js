export const ROUTES = {
  home: '/',
  chat: '/chat',
  settings: '/settings',
  profile: '/profile',
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgot: '/auth/forgot',
    reset: '/auth/reset'
  }
};

export const PROTECTED_ROUTES = [
  ROUTES.settings,
  ROUTES.profile
];

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.auth.login,
  ROUTES.auth.register
];