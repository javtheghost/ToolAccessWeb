import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
    User, 
    UserResponse, 
    UserCreateRequest, 
    UserUpdateRequest, 
    UserPasswordChangeRequest,
    UserFilters,
    Role,
    AVAILABLE_ROLES
} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        // El token debería ser añadido automáticamente por el interceptor
        // pero vamos a asegurar que el Content-Type esté correcto
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    // GET - Obtener todos los usuarios
    getUsers(filters?: UserFilters): Observable<User[]> {
        console.log('🌐 UserService: Solicitando usuarios con filtros:', filters);
        
        let params = new HttpParams();
        
        if (filters) {
            Object.keys(filters).forEach(key => {
                const value = (filters as any)[key];
                if (value !== null && value !== undefined && value !== '') {
                    params = params.set(key, value.toString());
                }
            });
        }

        console.log('📡 UserService: Parámetros HTTP:', params.toString());
        console.log('🌐 UserService: URL completa:', `${this.apiUrl}?${params.toString()}`);

        return this.http.get<UserResponse>(this.apiUrl, { 
            headers: this.getHeaders(),
            params 
        }).pipe(
            map(response => {
                console.log('📡 UserService: Respuesta recibida:', response);
                if (response.success) {
                    const users = Array.isArray(response.data) ? response.data : [response.data];
                    console.log('✅ UserService: Usuarios procesados:', users);
                    return users;
                } else {
                    console.error('❌ UserService: Respuesta con error:', response.message);
                    throw new Error(response.message || 'Error al obtener usuarios');
                }
            }),
            catchError((error) => {
                console.error('🚨 UserService: Error en HTTP request:', error);
                return this.handleError(error);
            })
        );
    }

    // GET - Obtener usuario por ID
    getUserById(id: number | string): Observable<User> {
        return this.http.get<UserResponse>(`${this.apiUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener el usuario');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nuevo usuario
    createUser(user: UserCreateRequest): Observable<User> {
        // Validaciones básicas
        if (!user.nombre || user.nombre.trim() === '') {
            return throwError(() => new Error('El nombre es requerido'));
        }
        if (!user.apellido_paterno || user.apellido_paterno.trim() === '') {
            return throwError(() => new Error('El apellido paterno es requerido'));
        }
        if (!user.email || user.email.trim() === '') {
            return throwError(() => new Error('El email es requerido'));
        }
        if (!user.password || user.password.trim() === '') {
            return throwError(() => new Error('La contraseña es requerida'));
        }
        if (!user.rol_id) {
            return throwError(() => new Error('El rol es requerido'));
        }

        return this.http.post<UserResponse>(this.apiUrl, user, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear el usuario');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar usuario
    updateUser(id: number | string, user: UserUpdateRequest): Observable<User> {
        return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user, {
            headers: this.getHeaders()
        }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar el usuario');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar usuario (desactivar usando update)
    deleteUser(id: number | string): Observable<boolean> {
        console.log(`🗑️ Desactivando usuario ${id} usando método UPDATE`);
        
        // Primero obtenemos el usuario actual para mantener sus datos
        return this.getUserById(id).pipe(
            switchMap(user => {
                // Creamos el objeto de actualización manteniendo todos los datos pero cambiando is_active
                const updateData: UserUpdateRequest = {
                    nombre: user.nombre,
                    apellido_paterno: user.apellido_paterno,
                    apellido_materno: user.apellido_materno,
                    email: user.email,
                    rol_id: user.rol_id,
                    is_active: false  // Lo desactivamos
                };
                
                return this.updateUser(id, updateData);
            }),
            map(() => {
                console.log('✅ Usuario desactivado correctamente usando UPDATE');
                return true;
            }),
            catchError((error) => {
                console.error('❌ Error al desactivar usuario:', error);
                return throwError(() => new Error('Error al desactivar el usuario: ' + error.message));
            })
        );
    }

    // GET - Obtener roles disponibles (usando constantes locales)
    getRoles(): Observable<Role[]> {
        // Retornamos los roles desde la constante local
        return new Observable(observer => {
            observer.next(AVAILABLE_ROLES);
            observer.complete();
        });
    }

    // PATCH - Activar/Desactivar usuario (usando UPDATE por problemas de CORS)
    toggleUserStatus(id: number | string, isActive: boolean): Observable<User> {
        console.log(`🔄 Cambiando estado del usuario ${id} a ${isActive ? 'activo' : 'inactivo'} usando UPDATE`);
        
        // Primero obtenemos el usuario actual para mantener sus datos
        return this.getUserById(id).pipe(
            switchMap(user => {
                // Creamos el objeto de actualización manteniendo todos los datos pero cambiando is_active
                const updateData: UserUpdateRequest = {
                    nombre: user.nombre,
                    apellido_paterno: user.apellido_paterno,
                    apellido_materno: user.apellido_materno,
                    email: user.email,
                    rol_id: user.rol_id,
                    is_active: isActive  // Usamos el valor que se pasa como parámetro
                };
                
                console.log('📤 Actualizando usuario con datos:', updateData);
                return this.updateUser(id, updateData);
            }),
            map(updatedUser => {
                console.log('✅ Usuario actualizado correctamente usando UPDATE');
                return updatedUser;
            }),
            catchError((error) => {
                console.error('❌ Error al cambiar estado del usuario:', error);
                return throwError(() => new Error('Error al cambiar el estado del usuario: ' + error.message));
            })
        );
    }

    // Utilidad para obtener nombre del rol por ID
    getRoleName(rolId: number | null | undefined): string {
        if (!rolId) return 'Sin rol';
        const role = AVAILABLE_ROLES.find(r => r.id === rolId);
        return role ? role.nombre : 'Rol desconocido';
    }

    // Utilidad para obtener nombre completo del usuario
    getFullName(user: User): string {
        const parts = [user.nombre, user.apellido_paterno, user.apellido_materno].filter(Boolean);
        return parts.join(' ') || 'Sin nombre';
    }

    // Manejo de errores
    private handleError = (error: any) => {
        console.error('❌ Error en UserService:', error);
        
        let errorMessage = 'Error desconocido';
        
        if (error.error?.message) {
            errorMessage = error.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        } else if (error.status === 0) {
            // Error de conectividad
            errorMessage = 'Error de conexión. Verifica que el servidor esté disponible y que tengas permisos de administrador.';
        } else if (error.status) {
            switch (error.status) {
                case 400:
                    errorMessage = 'Solicitud inválida. Verifique los datos enviados.';
                    break;
                case 401:
                    errorMessage = 'No autorizado. Verifica tu sesión e inicia sesión nuevamente.';
                    break;
                case 403:
                    errorMessage = 'Acceso denegado. Solo administradores pueden realizar esta acción.';
                    break;
                case 404:
                    errorMessage = 'Usuario no encontrado.';
                    break;
                case 409:
                    errorMessage = 'El usuario ya existe o hay un conflicto.';
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
