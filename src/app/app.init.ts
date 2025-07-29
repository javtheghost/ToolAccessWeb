import { inject } from '@angular/core';
import { OAuthService } from './pages/service/oauth.service';

export function initializeApp() {
  const oauthService = inject(OAuthService);

  return () => {
    return oauthService.initAuthState();
  };
}
