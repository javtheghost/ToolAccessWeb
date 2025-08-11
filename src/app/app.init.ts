import { inject } from '@angular/core';
import { OAuthService } from './pages/service/oauth.service';

export function initializeApp() {
  return () => {
    return inject(OAuthService).initAuthState();
  };
}
