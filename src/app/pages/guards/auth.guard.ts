import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OAuthService } from '../service/oauth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private oauthService: OAuthService, private router: Router) {
    console.log('🔧 AuthGuard inicializado');
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('🛡️ AuthGuard ejecutándose para:', state.url);
    console.log('📍 Ruta actual:', route.routeConfig?.path);
    console.log('🔍 Parámetros de ruta:', route.params);
    
    // No proteger rutas de OAuth
    if (state.url.includes('/oauth/') || state.url.includes('/auth/')) {
      console.log('🚫 AuthGuard: Ruta OAuth/Auth detectada, permitiendo acceso');
      return of(true);
    }
    
    // Verificar autenticación de múltiples formas
    const isAuth = this.oauthService.isAuthenticated();
    const hasToken = this.oauthService.hasValidToken();
    const currentUser = this.oauthService.getCurrentUser();
    const token = this.oauthService.getToken();
    
    console.log('🔍 Verificación de autenticación:', { 
      isAuth, 
      hasToken, 
      hasUser: !!currentUser,
      hasTokenValue: !!token,
      tokenLength: token?.length || 0
    });
    
    // Permitir acceso si está autenticado O tiene token válido
    if (isAuth || hasToken) {
      console.log('✅ AuthGuard: Acceso permitido');
      console.log('👤 Usuario actual:', currentUser);
      return of(true);
    }
    
    console.log('❌ AuthGuard: Acceso denegado, redirigiendo a login');
    console.log('🔍 Estado final:', {
      isAuth,
      hasToken,
      hasUser: !!currentUser,
      url: state.url
    });
    
    localStorage.setItem('redirect_url', state.url);
    this.router.navigate(['/auth/login']);
    return of(false);
  }
} 