export const environment = {
  production: true,
  api: {
    clientId: 'web-app-angular',
    clientSecret: 'angular-secret-key-2025',
    redirectUri: 'http://localhost:4200/oauth/callback',
    baseUrl: 'http://localhost:3000',
    authUrl: 'http://localhost:3000/oauth/authorize',
    tokenUrl: 'http://localhost:3000/oauth/token',
    userinfoUrl: 'http://localhost:3000/oauth/userinfo',
    unifiedApiUrl: 'http://localhost:3000/api/unified',
    profileUrl: 'http://localhost:3000/api/auth/profile',
    refreshUrl: 'http://localhost:3000/oauth/refresh-interceptor',
    revokeUrl: 'http://localhost:3000/oauth/revoke'
  }
};
