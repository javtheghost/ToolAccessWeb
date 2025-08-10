import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';
import { CommunicationService } from './communication.service';

// Interfaces para daños - Adaptadas al backend de reportes de daños
export interface Damage {
    id: number;
    herramienta_id: number;
    orden_prestamo_id: number;
    tipo_dano_id: number;
    descripcion: string;
    costo_reparacion: number;
    report_date: string;
    repair_date?: string;
    status: 'reportado' | 'en_reparacion' | 'reparado' | 'dado_de_baja';
    created_at: string;
    updated_at: string;

    // Campos adicionales con joins
    herramienta_nombre?: string;
    herramienta_folio?: string;
    orden_folio?: string;
    tipo_dano_nombre?: string;
    porcentaje_aplicar?: number;

    // Campos adicionales para el formulario
    category?: any;
    subcategory?: any;
    repairCost?: number;
    fineType?: string;
}

export interface DamageCreateRequest {
    herramienta_id: number;
    orden_prestamo_id: number;
    tipo_dano_id: number;
    descripcion: string;
    costo_reparacion?: number;
}

export interface DamageUpdateRequest {
    herramienta_id?: number;
    orden_prestamo_id?: number;
    tipo_dano_id?: number;
    descripcion?: string;
    costo_reparacion?: number;
    status?: 'reportado' | 'en_reparacion' | 'reparado' | 'dado_de_baja';
    repair_date?: string;
}

export interface DamageManageRequest {
    status?: 'reportado' | 'en_reparacion' | 'reparado' | 'dado_de_baja';
    repair_date?: string;
    costo_reparacion?: number;
    descripcion?: string;
}

export interface DamageResponse {
    success: boolean;
    data: Damage | Damage[];
    message: string;
    statusCode?: number;
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        total_pages: number;
    };
    filters_applied?: {
        role_filter: string;
        estado?: string;
        herramienta_id?: string;
        usuario_responsable?: string;
        tipo_dano?: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class DamagesService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/damage-reports`;

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

        headers = headers.set('Content-Type', 'application/json');
        return headers;
    }

    // GET - Obtener todos los daños
    getDamages(estado?: string, herramienta_id?: number, usuario_responsable?: number, tipo_dano?: string, page?: number, limit?: number): Observable<Damage[]> {
        let params = new HttpParams();

        if (estado) params = params.set('status', estado);
        if (herramienta_id) params = params.set('herramienta_id', herramienta_id.toString());
        if (usuario_responsable) params = params.set('usuario_responsable', usuario_responsable.toString());
        if (tipo_dano) params = params.set('tipo_dano', tipo_dano);
        if (page) params = params.set('page', page.toString());
        if (limit) params = params.set('limit', limit.toString());

        // Debug logging
        console.log('🔍 DamagesService - getDamages called');
        console.log('🔍 API URL:', this.apiUrl);
        console.log('🔍 Headers:', this.getHeaders());
        console.log('🔍 Params:', params.toString());

        return this.http.get<DamageResponse>(this.apiUrl, {
            headers: this.getHeaders(),
            params: params
        }).pipe(
            tap(response => {
                console.log('✅ API Response:', response);
            }),
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener daños');
                }
            }),
            catchError(error => {
                console.error('❌ API Error:', error);
                console.error('❌ Error Status:', error.status);
                console.error('❌ Error Message:', error.message);
                return this.handleError(error);
            })
        );
    }
    // GET - Obtener daño por ID
    getDamageById(id: number): Observable<Damage> {
        return this.http.get<DamageResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener el daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Reportar daño
    reportDamage(damage: DamageCreateRequest): Observable<Damage> {
        return this.http.post<DamageResponse>(this.apiUrl, damage, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al reportar daño');
                }
            }),
            tap(result => {
                this.communicationService.notifyDamageCreated(result);
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar daño
    updateDamage(id: number, damage: DamageUpdateRequest): Observable<Damage> {
        return this.http.put<DamageResponse>(`${this.apiUrl}/${id}`, damage, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar daño');
                }
            }),
            tap(result => {
                this.communicationService.notifyDamageUpdated(result);
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Gestionar daño (solo ADMIN)
    manageDamage(id: number, damage: DamageManageRequest): Observable<Damage> {
        return this.http.put<DamageResponse>(`${this.apiUrl}/${id}/gestionar`, damage, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al gestionar daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar daño (solo ADMIN)
    deleteDamage(id: number): Observable<boolean> {
        return this.http.delete<DamageResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar daño');
                }
            }),
            tap(() => {
                this.communicationService.notifyDamageDeleted({ id });
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar estado del daño
    updateDamageStatus(id: number, estado: string, fecha_reparacion?: string, observaciones?: string): Observable<Damage> {
        const updateData = {
            status: estado,
            repair_date: fecha_reparacion,
            descripcion: observaciones
        };

        return this.http.put<DamageResponse>(`${this.apiUrl}/${id}`, updateData, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar estado del daño');
                }
            }),
            catchError(this.handleError)
        );
    }

    // Método privado para manejar errores
    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';
        
        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else if (error.status) {
            // Error del servidor
            if (error.error && error.error.message) {
                errorMessage = error.error.message;
            } else {
                switch (error.status) {
                    case 400:
                        errorMessage = 'Datos de entrada inválidos';
                        break;
                    case 401:
                        errorMessage = 'No autorizado';
                        break;
                    case 403:
                        errorMessage = 'Acceso denegado';
                        break;
                    case 404:
                        errorMessage = 'Recurso no encontrado';
                        break;
                    case 500:
                        errorMessage = 'Error interno del servidor';
                        break;
                    default:
                        errorMessage = `Error ${error.status}: ${error.statusText}`;
                }
            }
        }

        console.error('Error en DamagesService:', error);
        return throwError(() => new Error(errorMessage));
    }
}
