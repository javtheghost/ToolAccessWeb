import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OAuthService } from '../service/oauth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    // Usar el decorador @Inject para especificar el token de inyección si es necesario
    // pero aquí asumimos que OAuthService está correctamente registrado como provider
    private oauthService: OAuthService,
    private router: Router
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // No proteger rutas de OAuth
    if (state.url.includes('/oauth/') || state.url.includes('/auth/')) {
      // Acceso permitido a rutas de autenticación
      return of(true);
    }

    // Verificar autenticación de múltiples formas
    const isAuth = this.oauthService.isAuthenticated();
    const hasToken = this.oauthService.hasValidToken();
    const currentUser = this.oauthService.getCurrentUser();
    const token = this.oauthService.getToken();

    // Permitir acceso si está autenticado O tiene token válido
    if (isAuth || hasToken) {
      return of(true);
    }

    // Guardar la URL para redirección tras login
    localStorage.setItem('redirect_url', state.url);
    // Redirigir al login en lugar de error 401
    return of(this.router.createUrlTree(['/auth/login']));
  }
}
