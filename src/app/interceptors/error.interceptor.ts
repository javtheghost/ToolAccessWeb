import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error desconocido';

        // Manejar diferentes tipos de errores
        if (error.error instanceof ErrorEvent) {
          // Error del cliente
          errorMessage = `Error de conexión: ${error.error.message}`;
        } else {
          // Error del servidor
          if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión a internet.';
          } else if (error.status === 401) {
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
          } else if (error.status === 403) {
            errorMessage = 'No tienes permisos para realizar esta acción.';
          } else if (error.status === 404) {
            errorMessage = 'El recurso solicitado no fue encontrado.';
          } else if (error.status === 500) {
            // Manejar errores 500 específicamente
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = 'Error interno del servidor. Intenta más tarde.';
            }
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Error ${error.status}: ${error.statusText}`;
          }
        }

        // Log del error para debugging
        console.error('Error HTTP interceptado:', {
          url: request.url,
          method: request.method,
          status: error.status,
          message: errorMessage,
          originalError: error
        });

        // Retornar el error para que los componentes puedan manejarlo
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
