import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OAuthService } from '../service/oauth.service';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private oauthService: OAuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    console.log('[TokenInterceptor] Interceptando petición:', request.url);
    const token = this.oauthService.getToken();
    if (token) {
      console.log('[TokenInterceptor] Token encontrado:', token);
      request = this.addToken(request, token);
    } else {
      console.log('[TokenInterceptor] No se encontró token para la petición.');
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            console.warn('[TokenInterceptor] Error 401 detectado. Intentando refrescar token...');
            return this.handle401Error(request, next);
          } else if (error.status === 500) {
            console.error('[TokenInterceptor] Error 500 detectado. Redirigiendo a página de error.');
            console.log('[TokenInterceptor] Navegando a /error/500');
            this.router.navigate(['/error', '500']);
          }
        }
        console.error('[TokenInterceptor] Error en petición HTTP:', error);
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      console.log('[TokenInterceptor] Iniciando proceso de refresh token...');
      return from(this.oauthService.refreshToken()).pipe(
        switchMap((tokenData: any) => {
          this.isRefreshing = false;
          if (tokenData && tokenData.access_token) {
            console.log('[TokenInterceptor] Nuevo access token recibido:', tokenData.access_token);
            this.refreshTokenSubject.next(tokenData.access_token);
            return next.handle(this.addToken(request, tokenData.access_token));
          }
          console.error('[TokenInterceptor] No se pudo renovar el token o no se recibió access_token. Haciendo logout.');
          this.oauthService.logout(false);
          this.router.navigate(['/auth/login']);
          return throwError(() => 'No se pudo renovar el token');
        }),
        catchError(error => {
          this.isRefreshing = false;
          console.error('[TokenInterceptor] Error al refrescar el token:', error);
          console.log('[TokenInterceptor] Haciendo logout por error de refresh token.');
          this.oauthService.logout(false);
          this.router.navigate(['/auth/login']);
          return throwError(() => error);

        })
      );
    } else {
      console.log('[TokenInterceptor] Esperando a que se renueve el token...');
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          console.log('[TokenInterceptor] Usando token renovado para repetir la petición.');
          return next.handle(this.addToken(request, jwt));
        })
      );
    }
  }
}
