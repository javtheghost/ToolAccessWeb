import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { OAuthService } from '../service/oauth.service';

// Variable global para manejar el estado de refresh
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const TokenInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const oauthService = inject(OAuthService);
  
  console.log('🔄 TokenInterceptor interceptando:', request.url);
  
  // No agregar token a peticiones OAuth
  if (request.url.includes('/oauth/')) {
    console.log('🚫 Omitiendo token para petición OAuth:', request.url);
    return next(request);
  }
  
  // Agregar token si existe
  const token = oauthService.getToken();
  if (token) {
    console.log('🎫 Agregando token a petición:', request.url);
    request = addToken(request, token);
  } else {
    console.log('❌ No hay token disponible para:', request.url);
  }

  return next(request).pipe(
    catchError(error => {
      console.log('💥 Error en petición:', request.url, error.status);
      
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('🔄 Intentando renovar token...');
        return handle401Error(request, next, oauthService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn, 
  oauthService: OAuthService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    // Convertir Promise a Observable
    return from(oauthService.refreshToken()).pipe(
      switchMap((tokenData: any) => {
        isRefreshing = false;
        if (tokenData) {
          console.log('✅ Token renovado exitosamente');
          refreshTokenSubject.next(tokenData.access_token);
          return next(addToken(request, tokenData.access_token));
        }
        console.log('❌ No se pudo renovar el token');
        return throwError(() => 'No se pudo renovar el token');
      }),
      catchError(error => {
        console.log('💥 Error renovando token:', error);
        isRefreshing = false;
        oauthService.logout();
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