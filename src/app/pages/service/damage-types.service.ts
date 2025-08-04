import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

// Interfaces para tipos de daño
export interface DamageType {
    id: number;
    nombre: string;
    descripcion?: string;
    porcentaje_aplicar: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface DamageTypeCreateRequest {
    nombre: string;
    descripcion?: string;
    porcentaje_aplicar?: number;
    is_active?: boolean;
}

export interface DamageTypeUpdateRequest {
    nombre?: string;
    descripcion?: string;
    porcentaje_aplicar?: number;
    is_active?: boolean;
}

export interface DamageTypeResponse {
    success: boolean;
    data: DamageType | DamageType[];
    message: string;
    meta?: {
        total_mostrados?: number;
        activos?: number;
        inactivos?: number;
        porcentaje_promedio?: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class DamageTypesService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/damage-types`;

    constructor(private http: HttpClient, private oauthService: OAuthService) {}

    // GET - Obtener todos los tipos de daño
    getDamageTypes(search?: string, onlyActive?: boolean): Observable<DamageType[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (onlyActive !== undefined) {
            params = params.set('only_active', onlyActive.toString());
        }

        return this.http.get<DamageTypeResponse>(this.apiUrl, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener tipos de daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener tipo de daño por ID
    getDamageTypeById(id: number): Observable<DamageType> {
        return this.http.get<DamageTypeResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener el tipo de daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nuevo tipo de daño
    createDamageType(damageType: DamageTypeCreateRequest): Observable<DamageType> {
        return this.http.post<DamageTypeResponse>(this.apiUrl, damageType).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear el tipo de daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar tipo de daño
    updateDamageType(id: number, damageType: DamageTypeUpdateRequest): Observable<DamageType> {
        return this.http.put<DamageTypeResponse>(`${this.apiUrl}/${id}`, damageType).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar el tipo de daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar tipo de daño (soft delete)
    deleteDamageType(id: number): Observable<boolean> {
        return this.http.delete<DamageTypeResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar el tipo de daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Reactivar tipo de daño
    reactivateDamageType(id: number): Observable<DamageType> {
        return this.http.put<DamageTypeResponse>(`${this.apiUrl}/${id}/reactivate`, {}).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al reactivar el tipo de daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener estadísticas
    getDamageTypesStats(): Observable<any> {
        return this.http.get<DamageTypeResponse>(`${this.apiUrl}/stats`).pipe(
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
                    errorMessage = 'Tipo de daño no encontrado';
                    break;
                case 409:
                    errorMessage = 'Conflicto: El tipo de daño ya existe';
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
