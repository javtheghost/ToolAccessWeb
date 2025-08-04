import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

// Interfaces para daños
export interface Dano {
    id: number;
    orden_id: number;
    usuario_id: number;
    herramienta_id?: number;
    descripcion: string;
    tipo_dano: string; // 'leve', 'moderado', 'grave'
    estado: string; // 'reportado', 'en_revision', 'resuelto', 'rechazado'
    fecha_reporte: string;
    fecha_resolucion?: string;
    comentarios?: string;
    created_at: string;
    updated_at: string;

    // Campos adicionales con joins
    orden_folio?: string;
    usuario_nombre?: string;
    usuario_email?: string;
    herramienta_nombre?: string;
    herramienta_folio?: string;
}

export interface DanoCreateRequest {
    orden_id: number;
    usuario_id: number;
    herramienta_id?: number;
    descripcion: string;
    tipo_dano: string;
    comentarios?: string;
}

export interface DanoUpdateRequest {
    orden_id?: number;
    usuario_id?: number;
    herramienta_id?: number;
    descripcion?: string;
    tipo_dano?: string;
    estado?: string;
    comentarios?: string;
    fecha_resolucion?: string;
}

export interface DanoResponse {
    success: boolean;
    data: Dano | Dano[];
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class DanosService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/danos`;

    constructor(private http: HttpClient, private oauthService: OAuthService) {}

    // Método privado para obtener headers con token
    private getHeaders(): HttpHeaders {
        const token = this.oauthService.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    // GET - Listar daños (ADMIN: CRUD completo)
    getDanos(search?: string, estado?: string, tipo_dano?: string): Observable<Dano[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (estado) {
            params = params.set('estado', estado);
        }
        if (tipo_dano) {
            params = params.set('tipo_dano', tipo_dano);
        }

        return this.http.get<DanoResponse>(this.apiUrl, {
            params,
            headers: this.getHeaders()
        }).pipe(
            map((response: DanoResponse): Dano[] => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    console.warn('API retornó success: false:', response.message);
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error en getDanos:', error);
                return new Observable<Dano[]>(observer => {
                    observer.next([]);
                    observer.complete();
                });
            })
        );
    }

    // GET - Obtener daño específico
    getDanoById(id: number): Observable<Dano> {
        return this.http.get<DanoResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    console.warn('API retornó success: false para getDanoById:', response.message);
                    throw new Error(response.message || 'Error al obtener el daño');
                }
            }),
            catchError(error => {
                console.error('Error en getDanoById:', error);
                return throwError(() => error);
            })
        );
    }

    // GET - Obtener daños por usuario
    getDanosByUser(usuarioId: number): Observable<Dano[]> {
        return this.http.get<DanoResponse>(`${this.apiUrl}/usuario/${usuarioId}`, {
            headers: this.getHeaders()
        }).pipe(
            map((response: DanoResponse): Dano[] => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    console.warn('API retornó success: false para getDanosByUser:', response.message);
                    return [];
                }
            }),
            catchError(error => {
                console.error('Error en getDanosByUser:', error);
                return new Observable<Dano[]>(observer => {
                    observer.next([]);
                    observer.complete();
                });
            })
        );
    }

    // POST - Reportar daño
    createDano(dano: DanoCreateRequest): Observable<Dano> {
        return this.http.post<DanoResponse>(this.apiUrl, dano, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al reportar el daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar daño (Solo ADMIN)
    updateDano(id: number, dano: DanoUpdateRequest): Observable<Dano> {
        return this.http.put<DanoResponse>(`${this.apiUrl}/${id}`, dano, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar el daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Cambiar estado del daño (Solo ADMIN)
    updateDanoEstado(id: number, estado: string, comentarios?: string): Observable<Dano> {
        const updateData: DanoUpdateRequest = {
            estado,
            comentarios
        };

        if (estado === 'resuelto') {
            updateData.fecha_resolucion = new Date().toISOString();
        }

        return this.updateDano(id, updateData);
    }

    // DELETE - Eliminar daño (Solo ADMIN)
    deleteDano(id: number): Observable<boolean> {
        return this.http.delete<DanoResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar el daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener usuarios para dropdown
    getUsuarios(): Observable<any[]> {
        return new Observable(observer => {
            observer.next([]);
            observer.complete();
        });
    }

    // GET - Obtener órdenes para dropdown
    getOrdenes(): Observable<any[]> {
        return new Observable(observer => {
            observer.next([]);
            observer.complete();
        });
    }

    // GET - Obtener herramientas para dropdown
    getHerramientas(): Observable<any[]> {
        return new Observable(observer => {
            observer.next([]);
            observer.complete();
        });
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error.message && error.message !== 'Error desconocido') {
            console.error('Error en DanosService (ya procesado):', error.message);
            return throwError(() => error);
        }

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error de conexión: ${error.error.message}`;
        } else if (error.status === 0) {
            errorMessage = 'No se puede conectar con el servidor. Verifica tu conexión.';
        } else if (error.status === 500) {
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

        console.error('Error en DanosService:', {
            message: errorMessage,
            originalError: error
        });

        return throwError(() => new Error(errorMessage));
    }
}
