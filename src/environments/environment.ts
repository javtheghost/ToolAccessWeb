export const environment = {
  production: false,
  api: {
    clientId: 'web-app-angular',
    clientSecret: 'angular-secret-key-2025',
    redirectUri: 'http://localhost:4200/oauth/callback',  // Localhost para development
    baseUrl: 'http://159.223.203.247',                    // Servidor remoto
    authUrl: 'http://159.223.203.247/oauth/authorize',
    tokenUrl: 'http://159.223.203.247/oauth/token',
    userinfoUrl: 'http://159.223.203.247/oauth/userinfo',
    unifiedApiUrl: 'http://159.223.203.247/api/unified',
    profileUrl: 'http://159.223.203.247/api/auth/profile',
    refreshUrl: 'http://159.223.203.247/oauth/refresh-interceptor',
    revokeUrl: 'http://159.223.203.247/oauth/revoke'
  },
  apiUrl: 'http://159.223.203.247/api'
};
