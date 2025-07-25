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
    // Si no hay token, redirigir a la página de error 401
    if (!token) {
      return of(this.router.createUrlTree(['/error', '401']));
    }

    return this.oauthService.user$.pipe(
      take(1),
      map(user => {
        if (user === null) {
          // Usuario aún no cargado, permitir acceso provisionalmente
          return true;
        }
        if (user.rol && user.rol.nombre === 'admin') {
          // Acceso permitido para administradores
          return true;
        }
        // Redirigir a la página de error 401 si no es admin
        return this.router.createUrlTree(['/error', '401']);
      })
    );
  }
}
