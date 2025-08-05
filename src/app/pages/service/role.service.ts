import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface para un Rol (basada en la respuesta real del backend)
 */
export interface Role {
    id?: number;
    nombre: string;
    descripcion?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Interface para crear un rol
 */
export interface RoleCreateRequest {
    nombre: string;
    descripcion?: string;
    is_active?: boolean;
}

/**
 * Interface para actualizar un rol
 */
export interface RoleUpdateRequest {
    nombre?: string;
    descripcion?: string;
    is_active?: boolean;
}

/**
 * Interface para la respuesta del API
 */
export interface RoleResponse {
    success: boolean;
    message?: string;
    data: Role | Role[];
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private apiUrl = `${environment.apiUrl}/roles`;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    // GET - Obtener todos los roles
    getRoles(): Observable<Role[]> {
        console.log('🌐 RoleService: Solicitando roles de:', this.apiUrl);
        
        return this.http.get<RoleResponse>(this.apiUrl, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                console.log('📡 RoleService: Respuesta recibida:', response);
                if (response.success) {
                    const roles = Array.isArray(response.data) ? response.data : [response.data];
                    console.log('✅ RoleService: Roles procesados:', roles);
                    return roles;
                } else {
                    console.error('❌ RoleService: Respuesta con error:', response.message);
                    throw new Error(response.message || 'Error al obtener roles');
                }
            }),
            catchError((error) => {
                console.error('🚨 RoleService: Error en HTTP request:', error);
                return this.handleError(error);
            })
        );
    }

    // GET - Obtener rol por ID
    getRoleById(id: number | string): Observable<Role> {
        return this.http.get<RoleResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener el rol');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nuevo rol
    createRole(role: RoleCreateRequest): Observable<Role> {
        // Validaciones básicas
        if (!role.nombre || role.nombre.trim() === '') {
            return throwError(() => new Error('El nombre del rol es requerido'));
        }

        return this.http.post<RoleResponse>(this.apiUrl, role, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear el rol');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar rol
    updateRole(id: number | string, role: RoleUpdateRequest): Observable<Role> {
        console.log('datos:', role);
        return this.http.put<RoleResponse>(`${this.apiUrl}/${id}`, role, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar el rol');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar rol
    deleteRole(id: number | string): Observable<boolean> {
        return this.http.delete<RoleResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar el rol');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PATCH - Activar/Desactivar rol (usando UPDATE por consistencia con usuarios)
    toggleRoleStatus(id: number | string, isActive: boolean): Observable<Role> {
        console.log(`🔄 Cambiando estado del rol ${id} a ${isActive ? 'activo' : 'inactivo'} usando UPDATE`);
        
        // Primero obtenemos el rol actual para mantener sus datos
        return this.getRoleById(id).pipe(
            switchMap(role => {
                // Creamos el objeto de actualización manteniendo todos los datos pero cambiando is_active
                const updateData: RoleUpdateRequest = {
                    nombre: role.nombre,
                    descripcion: role.descripcion,
                    is_active: isActive  // Usamos el valor que se pasa como parámetro
                };
                
                console.log('📤 Actualizando rol con datos:', updateData);
                return this.updateRole(id, updateData);
            }),
            map(updatedRole => {
                console.log('✅ Rol actualizado correctamente usando UPDATE');
                return updatedRole;
            }),
            catchError((error) => {
                console.error('❌ Error al cambiar estado del rol:', error);
                return throwError(() => new Error('Error al cambiar el estado del rol: ' + error.message));
            })
        );
    }

    // Manejo de errores
    private handleError = (error: any) => {
        console.error('❌ Error en RoleService:', error);
        
        let errorMessage = 'Error desconocido';
        
        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 0) {
            errorMessage = 'Error de conexión. Verifica que el servidor esté disponible.';
        } else if (error.status) {
            switch (error.status) {
                case 400:
                    errorMessage = 'Solicitud inválida. Verifique los datos enviados.';
                    break;
                case 401:
                    errorMessage = 'No autorizado. Verifica tu sesión.';
                    break;
                case 403:
                    errorMessage = 'Acceso denegado. Solo administradores pueden realizar esta acción.';
                    break;
                case 404:
                    errorMessage = 'Rol no encontrado.';
                    break;
                case 409:
                    errorMessage = 'El rol ya existe o hay un conflicto.';
                    break;
                case 422:
                    errorMessage = 'Datos de entrada inválidos.';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor.';
                    break;
                default:
                    errorMessage = `Error del servidor: ${error.status}`;
            }
        }
        
        return throwError(() => new Error(errorMessage));
    };
}
