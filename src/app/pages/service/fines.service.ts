import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para multas
export interface Fine {
    id: number;
    usuario_id: number;
    usuario_nombre?: string;
    usuario_email?: string;
    orden_id: number;
    configuracion_multa_id: number;
    dano_id?: number;
    monto_total: number;
    estado: 'pendiente' | 'pagado' | 'exonerada';
    fecha_aplicacion: string;
    fecha_vencimiento: string;
    fecha_pago?: string;
    comentarios?: string;
    created_at: string;
    updated_at: string;

    // Campos adicionales para UI
    orden_folio?: string;
    configuracion_nombre?: string;
    dano_descripcion?: string;
}

export interface FineCreateRequest {
    usuario_id: number;
    orden_id: number;
    configuracion_multa_id: number;
    dano_id?: number;
    monto_total: number;
    comentarios?: string;
    fecha_vencimiento?: string;
}

export interface FineUpdateRequest {
    usuario_id?: number;
    orden_id?: number;
    configuracion_multa_id?: number;
    monto_total?: number;
    estado?: 'pendiente' | 'pagado' | 'exonerada';
    fecha_vencimiento?: string;
    comentarios?: string;
}

export interface FineResponse {
    success: boolean;
    data: Fine | Fine[];
    message: string;
    meta?: {
        total?: number;
        pendientes?: number;
        pagadas?: number;
        monto_total?: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class FinesService {
    private apiUrl = `${environment.apiUrl}/multas`;

    constructor(private http: HttpClient) {}

    // GET - Obtener todas las multas (ADMIN)
    getFines(search?: string, estado?: string): Observable<Fine[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (estado) {
            params = params.set('estado', estado);
        }

        return this.http.get<FineResponse>(this.apiUrl, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener multas');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener multa por ID
    getFineById(id: number): Observable<Fine> {
        return this.http.get<FineResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener la multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener multas por usuario
    getFinesByUser(usuarioId: number): Observable<Fine[]> {
        return this.http.get<FineResponse>(`${this.apiUrl}/usuario/${usuarioId}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener multas del usuario');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nueva multa
    createFine(fine: FineCreateRequest): Observable<Fine> {
        return this.http.post<FineResponse>(this.apiUrl, fine).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear la multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar multa
    updateFine(id: number, fine: FineUpdateRequest): Observable<Fine> {
        return this.http.put<FineResponse>(`${this.apiUrl}/${id}`, fine).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar la multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Marcar multa como pagada (Solo ADMIN)
    payFine(id: number): Observable<Fine> {
        return this.http.put<FineResponse>(`${this.apiUrl}/${id}/pagar`, {}).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al marcar la multa como pagada');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar multa (Solo ADMIN)
    deleteFine(id: number): Observable<boolean> {
        return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar la multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener usuarios para dropdown
    getUsuarios(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/usuarios`).pipe(
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

    // GET - Obtener órdenes para dropdown
    getOrdenes(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/ordenes`).pipe(
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

    // GET - Obtener configuraciones de multas para dropdown
    getConfiguraciones(): Observable<any[]> {
        return this.http.get<any>(`${this.apiUrl}/configuraciones`).pipe(
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

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            errorMessage = error.error?.message || error.message || `Error ${error.status}: ${error.statusText}`;
        }

        console.error('Error en FinesService:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
