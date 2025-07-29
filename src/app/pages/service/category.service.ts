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
    private apiUrl = `${environment.apiUrl}/categories`;

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
    getCategoryById(id: string): Observable<Category> {
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
        return this.http.post<CategoryResponse>(this.apiUrl, category).pipe(
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
    updateCategory(id: string, category: CategoryUpdateRequest): Observable<Category> {
        return this.http.put<CategoryResponse>(`${this.apiUrl}/${id}`, category).pipe(
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
    deleteCategory(id: string): Observable<boolean> {
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

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Ocurrió un error';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
