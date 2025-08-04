import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

// Interfaces para configuración de multas
export interface FinesConfig {
    id: number;
    nombre: string;
    valor_base: number;
    aplica_a_categoria_id?: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    categoria_nombre?: string;
}

export interface FinesConfigCreateRequest {
    nombre: string;
    valor_base?: number;
    aplica_a_categoria_id?: number;
    is_active?: boolean;
}

export interface FinesConfigUpdateRequest {
    nombre?: string;
    valor_base?: number;
    aplica_a_categoria_id?: number;
    is_active?: boolean;
}

export interface FinesConfigResponse {
    success: boolean;
    data: FinesConfig | FinesConfig[];
    message: string;
    meta?: {
        total_mostradas?: number;
        activas?: number;
        inactivas?: number;
        valor_total?: number;
        valor_promedio?: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class FinesConfigService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/fine-configs`;

    constructor(private http: HttpClient, private oauthService: OAuthService) {}

    // GET - Obtener todas las configuraciones de multas
    getFinesConfigs(search?: string, onlyActive?: boolean): Observable<FinesConfig[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (onlyActive !== undefined) {
            params = params.set('only_active', onlyActive.toString());
        }

        return this.http.get<FinesConfigResponse>(this.apiUrl, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener configuraciones de multas');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener configuración de multa por ID
    getFinesConfigById(id: number): Observable<FinesConfig> {
        return this.http.get<FinesConfigResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener la configuración de multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nueva configuración de multa
    createFinesConfig(finesConfig: FinesConfigCreateRequest): Observable<FinesConfig> {
        const formData = new FormData();

        formData.append('nombre', finesConfig.nombre);
        if (finesConfig.valor_base !== undefined) {
            formData.append('valor_base', finesConfig.valor_base.toString());
        }
        if (finesConfig.aplica_a_categoria_id !== undefined) {
            formData.append('aplica_a_categoria_id', finesConfig.aplica_a_categoria_id.toString());
        }
        if (finesConfig.is_active !== undefined) {
            formData.append('is_active', finesConfig.is_active.toString());
        }

        return this.http.post<FinesConfigResponse>(this.apiUrl, formData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear la configuración de multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar configuración de multa
    updateFinesConfig(id: number, finesConfig: FinesConfigUpdateRequest): Observable<FinesConfig> {
        const formData = new FormData();

        if (finesConfig.nombre) {
            formData.append('nombre', finesConfig.nombre);
        }
        if (finesConfig.valor_base !== undefined) {
            formData.append('valor_base', finesConfig.valor_base.toString());
        }
        if (finesConfig.aplica_a_categoria_id !== undefined) {
            formData.append('aplica_a_categoria_id', finesConfig.aplica_a_categoria_id.toString());
        }
        if (finesConfig.is_active !== undefined) {
            formData.append('is_active', finesConfig.is_active.toString());
        }

        return this.http.put<FinesConfigResponse>(`${this.apiUrl}/${id}`, formData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar la configuración de multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar configuración de multa (soft delete)
    deleteFinesConfig(id: number): Observable<boolean> {
        return this.http.delete<FinesConfigResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar la configuración de multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Reactivar configuración de multa
    reactivateFinesConfig(id: number): Observable<FinesConfig> {
        return this.http.put<FinesConfigResponse>(`${this.apiUrl}/${id}/reactivate`, {}).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al reactivar la configuración de multa');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener estadísticas
    getFinesConfigStats(): Observable<any> {
        return this.http.get<FinesConfigResponse>(`${this.apiUrl}/stats`).pipe(
            map(response => {
                if (response.success) {
                    return response.meta;
                } else {
                    throw new Error(response.message || 'Error al obtener estadísticas');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener configuraciones por categoría
    getFinesConfigsByCategory(categoryId: number, onlyActive?: boolean): Observable<FinesConfig[]> {
        let params = new HttpParams();
        if (onlyActive !== undefined) {
            params = params.set('only_active', onlyActive.toString());
        }

        return this.http.get<FinesConfigResponse>(`${this.apiUrl}/category/${categoryId}`, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener configuraciones por categoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status) {
            switch (error.status) {
                case 400:
                    errorMessage = 'Datos inválidos';
                    break;
                case 401:
                    errorMessage = 'No autorizado';
                    break;
                case 403:
                    errorMessage = 'Acceso denegado';
                    break;
                case 404:
                    errorMessage = 'Configuración de multa no encontrada';
                    break;
                case 409:
                    errorMessage = 'Conflicto: La configuración de multa ya existe';
                    break;
                case 422:
                    errorMessage = 'Datos de validación incorrectos';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor';
                    break;
                default:
                    errorMessage = `Error ${error.status}: ${error.statusText}`;
            }
        }

        return throwError(() => new Error(errorMessage));
    }
}
