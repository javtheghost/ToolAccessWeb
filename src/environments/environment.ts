export const environment = {
  production: false,
  api: {
    clientId: 'web-app-angular',
    clientSecret: 'angular-secret-key-2025',
    redirectUri: 'http://localhost:4200/oauth/callback',  // Localhost para development
    baseUrl: 'https://oauth.toolaccess.tech',                    // Servidor remoto
    authUrl: 'https://oauth.toolaccess.tech/oauth/authorize',
    tokenUrl: 'https://oauth.toolaccess.tech/oauth/token',
    userinfoUrl: 'https://oauth.toolaccess.tech/oauth/userinfo',
    unifiedApiUrl: 'https://oauth.toolaccess.tech/api/unified',
    profileUrl: 'https://oauth.toolaccess.tech/api/auth/profile',
    refreshUrl: 'https://oauth.toolaccess.tech/oauth/refresh-interceptor',
    revokeUrl: 'https://oauth.toolaccess.tech/oauth/revoke'
  },
  // OAuth API (autenticación)
  apiUrl: 'https://oauth.toolaccess.tech/api',
  // API Service General (servicios principales)
  apiServiceGeneralUrl: 'http://localhost:3001'
};
