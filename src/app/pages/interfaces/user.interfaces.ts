/**
 * Interface principal para un Usuario (basada en la respuesta real del servidor)
 */
export interface User {
    id?: number;
    rol_id?: number;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    email?: string;
    is_active?: boolean;
    last_login_at?: string | null;
    created_at?: string;
    updated_at?: string;
    rol_nombre?: string | null;
    rol_descripcion?: string | null;
}

/**
 * Interface para crear un nuevo usuario
 */
export interface UserCreateRequest {
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    email: string;
    password: string;
    rol_id: number;
    is_active?: boolean;
}

/**
 * Interface para actualizar un usuario existente
 */
export interface UserUpdateRequest {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    email?: string;
    rol_id?: number;
    is_active?: boolean;
}

/**
 * Interface para cambio de contraseña
 */
export interface UserPasswordChangeRequest {
    current_password?: string;
    new_password: string;
    confirm_password: string;
}

/**
 * Interface para rol de usuario
 */
export interface Role {
    id: number;
    nombre: string;
    descripcion?: string;
}

/**
 * Lista de roles disponibles
 */
export const AVAILABLE_ROLES: Role[] = [
    { id: 1, nombre: 'Administrador', descripcion: 'Administrador del sistema' },
    { id: 2, nombre: 'Operador', descripcion: 'Operador del sistema' },
    { id: 3, nombre: 'Recepcionista', descripcion: 'Recepcionista del sistema' }
];

/**
 * Interface para respuesta del servidor
 */
export interface UserResponse {
    success: boolean;
    message?: string;
    data: User | User[];
    timestamp?: string;
    meta?: {
        total_records?: number;
        filters?: any;
    };
}

/**
 * Interface para filtros de búsqueda
 */
export interface UserFilters {
    nombre?: string;
    email?: string;
    rol_id?: number;
    is_active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
