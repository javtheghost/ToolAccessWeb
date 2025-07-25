import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OAuthService } from '../service/oauth.service';

/**
 * Guard para rutas públicas (login, registro, etc.).
 *
 * Funcionalidad:
 * - Si el usuario está autenticado y trata de acceder a rutas públicas → redirige al dashboard
 * - Si el usuario NO está autenticado → permite acceso a rutas públicas
 *
 * Uso: Proteger rutas como /auth/login, /auth/register, etc.
 */
@Injectable({ providedIn: 'root' })
export class PublicGuard implements CanActivate {
  constructor(
    private oauthService: OAuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    // No proteger rutas de error
    if (state.url.includes('/error/')) {
      return of(true);
    }

    // No proteger rutas de OAuth
    if (state.url.includes('/oauth/')) {
      return of(true);
    }

    // Verificar si el usuario está autenticado
    const isAuth = this.oauthService.isAuthenticated();
    const hasToken = this.oauthService.hasValidToken();

    // Si el usuario está autenticado, redirigir al dashboard
    if (isAuth || hasToken) {
      return of(this.router.createUrlTree(['/dashboard']));
    }

    // Si no está autenticado, permitir acceso a rutas públicas
    return of(true);
  }
}
