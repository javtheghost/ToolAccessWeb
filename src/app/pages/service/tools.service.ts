import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

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
    folio?: string;
    stock?: number;
    valor_reposicion?: number;
    descripcion?: string;
    imagen?: File;
    is_active?: boolean;
}

export interface ToolUpdateRequest {
    nombre?: string;
    subcategoria_id?: number;
    folio?: string;
    stock?: number;
    valor_reposicion?: number;
    descripcion?: string;
    imagen?: File;
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
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/tools`;

    constructor(private http: HttpClient, private oauthService: OAuthService) {}

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

    // POST - Crear nueva herramienta con imagen
    createTool(tool: ToolCreateRequest): Observable<Tool> {
        // Validar campos requeridos
        if (!tool.nombre || tool.nombre.trim() === '') {
            return throwError(() => new Error('El nombre es requerido'));
        }
        if (!tool.subcategoria_id) {
            return throwError(() => new Error('La subcategoría es requerida'));
        }

        // Crear FormData para enviar datos y archivo
        const formData = new FormData();
        formData.append('nombre', tool.nombre.trim());
        formData.append('subcategoria_id', tool.subcategoria_id.toString());
        // Solo enviar folio si no está vacío (el backend lo genera automáticamente)
        if (tool.folio && tool.folio.trim().length > 0) {
            formData.append('folio', tool.folio.trim().toUpperCase());
        }
        formData.append('stock', (tool.stock !== undefined ? tool.stock : 1).toString());
        formData.append('valor_reposicion', (tool.valor_reposicion !== undefined ? tool.valor_reposicion : 0.00).toString());
        formData.append('descripcion', tool.descripcion?.trim() || '');
        formData.append('is_active', (tool.is_active !== undefined ? tool.is_active : true).toString());

        // Agregar imagen si existe
        if (tool.imagen) {
            formData.append('imagen', tool.imagen);
        }

        // Obtener el token del servicio OAuth y agregarlo manualmente si es necesario
        const token = this.oauthService.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.post<ToolResponse>(this.apiUrl, formData, { headers }).pipe(
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

    // PUT - Actualizar herramienta con imagen
    updateTool(id: number, tool: ToolUpdateRequest): Observable<Tool> {
        // Crear FormData para enviar datos y archivo
        const formData = new FormData();

        if (tool.nombre !== undefined) formData.append('nombre', tool.nombre.trim());
        if (tool.subcategoria_id !== undefined) formData.append('subcategoria_id', tool.subcategoria_id.toString());
        // Solo enviar folio si no está vacío
        if (tool.folio !== undefined && tool.folio.trim().length > 0) {
            formData.append('folio', tool.folio.trim().toUpperCase());
        }
        if (tool.stock !== undefined) formData.append('stock', tool.stock.toString());
        if (tool.valor_reposicion !== undefined) formData.append('valor_reposicion', tool.valor_reposicion.toString());
        if (tool.descripcion !== undefined) formData.append('descripcion', tool.descripcion.trim());
        if (tool.is_active !== undefined) formData.append('is_active', tool.is_active.toString());

        // Agregar imagen si existe
        if (tool.imagen) {
            formData.append('imagen', tool.imagen);
        }

        // Obtener el token del servicio OAuth y agregarlo manualmente si es necesario
        const token = this.oauthService.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.put<ToolResponse>(`${this.apiUrl}/${id}`, formData, { headers }).pipe(
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
        // Obtener el token del servicio OAuth y agregarlo manualmente si es necesario
        const token = this.oauthService.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.delete<ToolResponse>(`${this.apiUrl}/${id}`, { headers }).pipe(
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

        return this.http.get<ToolResponse>(`${environment.apiServiceGeneralUrl}/api/subcategories/${subcategoryId}/tools`, { params }).pipe(
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

    // Método para obtener la URL completa de la imagen
    getImageUrl(imagePath: string): string {
        if (!imagePath) {
            console.log('[ToolsService] getImageUrl - No imagePath provided');
            return '';
        }

        console.log('[ToolsService] getImageUrl - Original path:', imagePath);

        // Corregir rutas que usan el puerto incorrecto
        let correctedPath = imagePath;
        if (imagePath.includes('localhost:3000')) {
            correctedPath = imagePath.replace('localhost:3000', 'localhost:3001');
            console.log('[ToolsService] getImageUrl - Corregida ruta de puerto:', correctedPath);
        }

        // Si ya es una URL completa, retornarla (ya corregida si era necesario)
        if (correctedPath.startsWith('http')) {
            console.log('[ToolsService] getImageUrl - URL final:', correctedPath);
            return correctedPath;
        }

        // Construir la URL completa para rutas relativas
        const baseUrl = environment.apiServiceGeneralUrl;
        // Asegurar que hay un slash entre la base URL y la ruta de la imagen
        // Y agregar /uploads/ para acceder a los archivos estáticos
        const fullUrl = correctedPath.startsWith('/')
            ? `${baseUrl}${correctedPath}`
            : `${baseUrl}/uploads/${correctedPath}`;

        console.log('[ToolsService] getImageUrl - URL construida:', fullUrl);
        return fullUrl;
    }

    // Método para verificar si una imagen existe
    checkImageExists(imagePath: string): Observable<boolean> {
        const imageUrl = this.getImageUrl(imagePath);
        if (!imageUrl) return new Observable<boolean>(observer => observer.next(false));

        return this.http.head(imageUrl, { observe: 'response' }).pipe(
            map(response => {
                const exists = response.status === 200;
                console.log('[ToolsService] checkImageExists -', imageUrl, 'existe:', exists);
                return exists;
            }),
            catchError(error => {
                console.log('[ToolsService] checkImageExists -', imageUrl, 'error:', error);
                return new Observable<boolean>(observer => observer.next(false));
            })
        );
    }

    // Método para eliminar imagen de herramienta
    deleteToolImage(toolId: number): Observable<boolean> {
        // Obtener el token del servicio OAuth y agregarlo manualmente si es necesario
        const token = this.oauthService.getToken();
        let headers = new HttpHeaders();

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/${toolId}/image`, { headers }).pipe(
            map(response => {
                console.log('[ToolsService] deleteToolImage - respuesta:', response);
                return response.success;
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
