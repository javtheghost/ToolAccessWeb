import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OAuthService } from '../service/oauth.service';

// Variables globales para el estado del refresh token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const TokenInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const oauthService = inject(OAuthService);
  const router = inject(Router);

  const token = oauthService.getToken();
  console.log('Interceptor - URL:', request.url);
  console.log('Interceptor - Token disponible:', !!token);

  if (token) {
    request = addToken(request, token);
    console.log('Interceptor - Token agregado al request');
  } else {
    console.log('Interceptor - No hay token disponible');
  }

  return next(request).pipe(
    catchError(error => {
      console.log('Interceptor - Error en petición:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          return handle401Error(request, next, oauthService, router);
        } else if (error.status === 500) {
          router.navigate(['/error', '500']);
        }
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  oauthService: OAuthService,
  router: Router
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
    return from(oauthService.refreshToken()).pipe(
      switchMap((tokenData: any) => {
        isRefreshing = false;
        if (tokenData && tokenData.access_token) {
          refreshTokenSubject.next(tokenData.access_token);
          return next(addToken(request, tokenData.access_token));
        }
        oauthService.logout(false);
        router.navigate(['/auth/login']);
        return throwError(() => 'No se pudo renovar el token');
      }),
      catchError(error => {
        isRefreshing = false;
        oauthService.logout(false);
        router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next(addToken(request, jwt));
      })
    );
  }
}
