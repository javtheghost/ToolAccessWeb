import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, CategoryResponse, CategoryCreateRequest, CategoryUpdateRequest } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/categories`;

    constructor(private http: HttpClient) {}

    // GET - Obtener todas las categorías
    getCategories(): Observable<Category[]> {
        return this.http.get<CategoryResponse>(this.apiUrl).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener categorías');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener categoría por ID
    getCategoryById(id: number | string): Observable<Category> {
        return this.http.get<CategoryResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener la categoría');
                }
            }),
            catchError(this.handleError)
        );
    }

        // POST - Crear nueva categoría
    createCategory(category: CategoryCreateRequest): Observable<Category> {
        // Asegurar que el nombre esté presente y no esté vacío
        if (!category.name || category.name.trim() === '') {
            return throwError(() => new Error('El nombre es requerido'));
        }

        // Crear el objeto de datos con el formato correcto que espera el backend
        const requestData = {
            nombre: category.name.trim(),
            descripcion: category.description || '',
            is_active: category.active !== undefined ? category.active : true
        };

        return this.http.post<CategoryResponse>(this.apiUrl, requestData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al crear la categoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar categoría
    updateCategory(id: number | string, category: CategoryUpdateRequest): Observable<Category> {
        // Asegurar que el nombre esté presente si se está actualizando
        if (category.name && category.name.trim() === '') {
            return throwError(() => new Error('El nombre es requerido'));
        }

        // Crear el objeto de datos con el formato correcto que espera el backend
        const requestData = {
            nombre: category.name?.trim(),
            descripcion: category.description || '',
            is_active: category.active !== undefined ? category.active : true
        };

        return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, requestData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al actualizar la categoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar categoría
    deleteCategory(id: number | string): Observable<boolean> {
        return this.http.delete<CategoryResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar la categoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Reactivar categoría (cambiar is_active a true)
    reactivateCategory(id: number | string): Observable<Category> {
        const requestData = {
            is_active: true
        };

        return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, requestData).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al reactivar la categoría');
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
                console.log('[CategoryService] Detalles completos del error 422:', errorDetails);

                if (errorDetails && errorDetails.message) {
                    errorMessage = `Error de validación: ${errorDetails.message}`;
                } else if (errorDetails && errorDetails.errors) {
                    console.log('[CategoryService] Errores de validación específicos:', errorDetails.errors);
                    const validationErrors = Object.entries(errorDetails.errors)
                        .map(([field, message]) => `${field}: ${message}`)
                        .join(', ');
                    errorMessage = `Errores de validación: ${validationErrors}`;
                } else {
                    errorMessage = `Error de validación (422): Los datos enviados no son válidos`;
                }
            } else if (errorDetails && errorDetails.code) {
                // Manejar códigos de error específicos del backend
                switch (errorDetails.code) {
                    case 'CATEGORIA_EXISTS':
                        errorMessage = 'Ya existe una categoría con este nombre. Por favor, usa un nombre diferente.';
                        errorSeverity = 'warn';
                        break;
                    case 'CATEGORIA_NOT_FOUND':
                        errorMessage = 'La categoría no fue encontrada.';
                        errorSeverity = 'error';
                        break;
                    case 'CATEGORIA_IN_USE':
                        errorMessage = 'No se puede eliminar la categoría porque está siendo utilizada por otros elementos.';
                        errorSeverity = 'warn';
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
