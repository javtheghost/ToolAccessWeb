import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para herramientas
export interface Tool {
    id: number;
    subcategoria_id: number;
    nombre: string;
    descripcion: string;
    folio: string;
    foto_url?: string;
    stock: number;
    valor_reposicion: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    subcategoria_nombre?: string;
    categoria_nombre?: string;
}

export interface ToolCreateRequest {
    nombre: string;
    subcategoria_id: number;
    folio: string;
    stock?: number;
    valor_reposicion?: number;
    descripcion?: string;
    foto_url?: string;
    is_active?: boolean;
}

export interface ToolUpdateRequest {
    nombre?: string;
    subcategoria_id?: number;
    folio?: string;
    stock?: number;
    valor_reposicion?: number;
    descripcion?: string;
    foto_url?: string;
    is_active?: boolean;
}

export interface ToolResponse {
    success: boolean;
    data: Tool | Tool[];
    message: string;
    meta?: {
        total_mostradas?: number;
        activas?: number;
        inactivas?: number;
        sin_stock?: number;
        stock_total?: number;
        valor_promedio?: number;
        total_sistema?: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ToolsService {
    private apiUrl = `${environment.apiUrl}/tools`;

    constructor(private http: HttpClient) {}

    // GET - Obtener todas las herramientas
    getTools(search?: string, onlyActive?: boolean): Observable<Tool[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (onlyActive !== undefined) {
            params = params.set('only_active', onlyActive.toString());
        }

        return this.http.get<ToolResponse>(this.apiUrl, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener herramientas');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener herramienta por ID
    getToolById(id: number): Observable<Tool> {
        return this.http.get<ToolResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener la herramienta');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nueva herramienta
    createTool(tool: ToolCreateRequest): Observable<Tool> {
        // Validar campos requeridos
        if (!tool.nombre || tool.nombre.trim() === '') {
            return throwError(() => new Error('El nombre es requerido'));
        }
        if (!tool.subcategoria_id) {
            return throwError(() => new Error('La subcategoría es requerida'));
        }
        if (!tool.folio || tool.folio.trim() === '') {
            return throwError(() => new Error('El folio es requerido'));
        }

        // Preparar datos para el backend
        const requestData = {
            nombre: tool.nombre.trim(),
            subcategoria_id: tool.subcategoria_id,
            folio: tool.folio.trim().toUpperCase(),
            stock: tool.stock !== undefined ? tool.stock : 1,
            valor_reposicion: tool.valor_reposicion !== undefined ? tool.valor_reposicion : 0.00,
            descripcion: tool.descripcion?.trim() || '',
            foto_url: tool.foto_url || null,
            is_active: tool.is_active !== undefined ? tool.is_active : true
        };

        return this.http.post<ToolResponse>(this.apiUrl, requestData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear la herramienta');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar herramienta
    updateTool(id: number, tool: ToolUpdateRequest): Observable<Tool> {
        // Preparar datos para el backend
        const requestData: any = {};

        if (tool.nombre !== undefined) requestData.nombre = tool.nombre.trim();
        if (tool.subcategoria_id !== undefined) requestData.subcategoria_id = tool.subcategoria_id;
        if (tool.folio !== undefined) requestData.folio = tool.folio.trim().toUpperCase();
        if (tool.stock !== undefined) requestData.stock = tool.stock;
        if (tool.valor_reposicion !== undefined) requestData.valor_reposicion = tool.valor_reposicion;
        if (tool.descripcion !== undefined) requestData.descripcion = tool.descripcion?.trim() || '';
        if (tool.foto_url !== undefined) requestData.foto_url = tool.foto_url;
        if (tool.is_active !== undefined) requestData.is_active = tool.is_active;

        return this.http.put<ToolResponse>(`${this.apiUrl}/${id}`, requestData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar la herramienta');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar herramienta (soft delete)
    deleteTool(id: number): Observable<boolean> {
        return this.http.delete<ToolResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar la herramienta');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener herramientas por subcategoría
    getToolsBySubcategory(subcategoryId: number, onlyActive?: boolean): Observable<Tool[]> {
        let params = new HttpParams();
        if (onlyActive !== undefined) {
            params = params.set('only_active', onlyActive.toString());
        }

        return this.http.get<ToolResponse>(`${environment.apiUrl}/subcategories/${subcategoryId}/tools`, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener herramientas de la subcategoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Ocurrió un error';
        let errorSeverity: 'error' | 'warn' | 'info' = 'error';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            const status = error.status;
            const message = error.message;
            const errorDetails = error.error;

            console.error('Error completo:', error);
            console.error('Detalles del error:', errorDetails);

            if (status === 422) {
                // Error de validación
                console.log('[ToolsService] Detalles completos del error 422:', errorDetails);

                if (errorDetails && errorDetails.message) {
                    errorMessage = `Error de validación: ${errorDetails.message}`;
                } else if (errorDetails && errorDetails.errors) {
                    console.log('[ToolsService] Errores de validación específicos:', errorDetails.errors);
                    const validationErrors = Array.isArray(errorDetails.errors)
                        ? errorDetails.errors.join(', ')
                        : Object.entries(errorDetails.errors)
                            .map(([field, message]) => `${field}: ${message}`)
                            .join(', ');
                    errorMessage = `Errores de validación: ${validationErrors}`;
                } else {
                    errorMessage = `Error de validación (422): Los datos enviados no son válidos`;
                }
            } else if (errorDetails && errorDetails.code) {
                // Manejar códigos de error específicos del backend
                switch (errorDetails.code) {
                    case 'FOLIO_EXISTS':
                        errorMessage = 'Ya existe una herramienta activa con este folio. Por favor, usa un folio diferente.';
                        errorSeverity = 'warn';
                        break;
                    case 'HERRAMIENTA_NOT_FOUND':
                        errorMessage = 'La herramienta no fue encontrada.';
                        errorSeverity = 'error';
                        break;
                    case 'ADMIN_REQUIRED':
                        errorMessage = 'Solo administradores pueden realizar esta acción.';
                        errorSeverity = 'error';
                        break;
                    case 'VALIDATION_ERROR':
                        errorMessage = errorDetails.message || 'Los datos enviados no son válidos.';
                        errorSeverity = 'error';
                        break;
                    case 'UNAUTHORIZED':
                        errorMessage = 'No tienes permisos para realizar esta acción.';
                        errorSeverity = 'error';
                        break;
                    case 'FORBIDDEN':
                        errorMessage = 'Acceso denegado.';
                        errorSeverity = 'error';
                        break;
                    default:
                        errorMessage = errorDetails.message || `Error del servidor: ${message}`;
                        errorSeverity = 'error';
                        break;
                }
            } else {
                errorMessage = `Código de error: ${status}\nMensaje: ${message}`;
            }
        }

        console.error(errorMessage);
        return throwError(() => ({ message: errorMessage, severity: errorSeverity }));
    }
}
