import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { OAuthService } from '../service/oauth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private oauthService: OAuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.oauthService.user$.pipe(
      take(1),
      map(user => {
        if (user && user.rol && user.rol.nombre === 'Administradores') {
          return true;
        }
        this.router.navigate(['/dashboard']);
        return false;
      })
    );
  }
} 