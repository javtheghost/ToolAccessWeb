import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { OAuthService } from '../service/oauth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private oauthService: OAuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    const token = this.oauthService.getToken();
    console.log('[AdminGuard] Token recuperado en canActivate:', token);
    if (!token) {
      console.warn('[AdminGuard] No hay token, redirigiendo a /error/401');
      return of(this.router.createUrlTree(['/error', '401']));
    }

    return this.oauthService.user$.pipe(
      take(1),
      map(user => {
        console.log('[AdminGuard] Valor de user$ emitido:', user);
        if (user === null) {
          // Usuario aún no cargado, permitir acceso provisionalmente
          console.log('[AdminGuard] Usuario aún no cargado, permitiendo acceso provisional');
          return true;
        }
        if (user.rol && user.rol.nombre === 'admin') {
          console.log('[AdminGuard] Usuario es admin, acceso permitido');
          return true;
        }
        console.warn('[AdminGuard] Usuario no es admin, redirigiendo a /error/401');
        return this.router.createUrlTree(['/error', '401']);
      })
    );
  }
}
