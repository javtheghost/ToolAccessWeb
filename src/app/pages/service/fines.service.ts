import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';
import { CommunicationService } from './communication.service';

// Interfaces para multas
export interface Fine {
    id: number;
    orden_id: number;
    usuario_id: number;
    configuracion_multa_id: number;
    dano_id?: number;
    monto_total: number;
    estado: string; // Cambiado para aceptar cualquier string (mayúsculas o minúsculas)
    fecha_aplicacion: string;
    fecha_vencimiento: string;
    fecha_pago?: string;
    comentarios?: string;
    created_at: string;
    updated_at: string;

    // Campos adicionales con joins
    orden_folio?: string;
    configuracion_nombre?: string;
    dano_descripcion?: string;
    usuario_nombre?: string;
    usuario_email?: string;
    herramienta_nombre?: string;
    herramienta_folio?: string;
}

export interface FineCreateRequest {
    orden_id: number;
    usuario_id: number;
    configuracion_multa_id: number;
    dano_id?: number;
    monto_total: number;
    comentarios?: string;
    fecha_vencimiento?: string;
}

export interface FineUpdateRequest {
    orden_id?: number;
    usuario_id?: number;
    configuracion_multa_id?: number;
    monto_total?: number;
    estado?: string; // Cambiado para aceptar cualquier string
    fecha_vencimiento?: string;
    comentarios?: string;
}

export interface FineResponse {
    success: boolean;
    data: Fine | Fine[];
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class FinesService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/multas`;

    constructor(
        private http: HttpClient, 
        private oauthService: OAuthService,
        private communicationService: CommunicationService
    ) {}

    // Método privado para obtener headers con token
    private getHeaders(): HttpHeaders {
        const token = this.oauthService.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    // GET - Obtener todas las multas (ADMIN)
    getFines(search?: string, estado?: string): Observable<Fine[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (estado) {
            params = params.set('estado', estado);
        }

        return this.http.get<FineResponse>(this.apiUrl, {
            params,
            headers: this.getHeaders()
        }).pipe(
            map((response: FineResponse): Fine[] => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    // En lugar de lanzar error, retornar array vacío
                    console.warn('API retornó success: false:', response.message);
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error en getFines:', error);
                // Retornar array vacío en lugar de fallar
                return new Observable<Fine[]>(observer => {
                    observer.next([]);
                    observer.complete();
                });
            })
        );
    }

    // GET - Obtener multa por ID
    getFineById(id: number): Observable<Fine> {
        return this.http.get<FineResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    console.warn('API retornó success: false para getFineById:', response.message);
                    throw new Error(response.message || 'Error al obtener la multa');
                }
            }),
            catchError(error => {
                console.error('Error en getFineById:', error);
                return throwError(() => error);
            })
        );
    }

    // GET - Obtener multas por usuario
    getFinesByUser(usuarioId: number): Observable<Fine[]> {
        return this.http.get<FineResponse>(`${this.apiUrl}/usuario/${usuarioId}`, {
            headers: this.getHeaders()
        }).pipe(
            map((response: FineResponse): Fine[] => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    console.warn('API retornó success: false para getFinesByUser:', response.message);
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error en getFinesByUser:', error);
                return new Observable<Fine[]>(observer => {
                    observer.next([]);
                    observer.complete();
                });
            })
        );
    }

    // POST - Crear nueva multa
    createFine(fine: FineCreateRequest): Observable<Fine> {
        return this.http.post<FineResponse>(this.apiUrl, fine, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear la multa');
                }
            }),
            tap(result => {
                this.communicationService.notifyFineCreated(result);
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar multa
    updateFine(id: number, fine: FineUpdateRequest): Observable<Fine> {
        return this.http.put<FineResponse>(`${this.apiUrl}/${id}`, fine, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar la multa');
                }
            }),
            tap(result => {
                this.communicationService.notifyFineUpdated(result);
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Marcar multa como pagada (Solo ADMIN)
    payFine(id: number): Observable<Fine> {
        return this.http.put<FineResponse>(`${this.apiUrl}/${id}/pagar`, {}, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al marcar la multa como pagada');
                }
            }),
            tap(result => {
                this.communicationService.notifyFineUpdated(result);
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar multa (Solo ADMIN)
    deleteFine(id: number): Observable<boolean> {
        return this.http.delete<FineResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar la multa');
                }
            }),
            tap(() => {
                this.communicationService.notifyFineDeleted({ id });
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener usuarios para dropdown
    getUsuarios(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/usuarios`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success && Array.isArray(response.data)) {
                    return response.data;
                } else if (Array.isArray(response)) {
                    return response;
                } else {
                    console.warn('Formato de respuesta inesperado para usuarios:', response);
                    return [];
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener configuraciones para dropdown
    getConfiguraciones(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/configuraciones`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success && Array.isArray(response.data)) {
                    return response.data;
                } else if (Array.isArray(response)) {
                    return response;
                } else {
                    console.warn('Formato de respuesta inesperado para configuraciones:', response);
                    return [];
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener órdenes para dropdown
    getOrdenes(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/ordenes`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success && Array.isArray(response.data)) {
                    return response.data;
                } else if (Array.isArray(response)) {
                    return response;
                } else {
                    console.warn('Formato de respuesta inesperado para órdenes:', response);
                    return [];
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener órdenes de préstamo por usuario específico
    getLoansByUser(userId: number): Observable<any[]> {
        const loansApiUrl = `${environment.apiServiceGeneralUrl}/api/loan-orders/operador/${userId}`;

        return this.http.get<any>(loansApiUrl, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener órdenes de préstamo por usuario');
                }
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';

        // Si el error ya fue procesado por el interceptor, solo logear
        if (error.message && error.message !== 'Error desconocido') {
            console.error('Error en FinesService (ya procesado):', error.message);
            return throwError(() => error);
        }

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error de conexión: ${error.error.message}`;
        } else if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
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

        console.error('Error en FinesService:', {
            message: errorMessage,
            originalError: error
        });

        return throwError(() => new Error(errorMessage));
    }
}
