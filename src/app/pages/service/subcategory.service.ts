import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para Subcategorías
export interface Subcategory {
    id?: number;
    nombre?: string;
    descripcion?: string;
    categoria_id?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SubcategoryDisplay {
    id: number;
    nombre: string;
    descripcion: string;
    categoria_id: number;
    categoria_nombre: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SubcategoryResponse {
    success: boolean;
    message: string;
    data: Subcategory | Subcategory[] | SubcategoryDisplay | SubcategoryDisplay[];
    total?: number;
}

export interface SubcategoryCreateRequest {
    nombre: string;
    descripcion?: string;
    categoria_id: number;
    is_active?: boolean;
}

export interface SubcategoryUpdateRequest {
    nombre?: string;
    descripcion?: string;
    categoria_id?: number;
    is_active?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class SubcategoryService {
    private apiUrl = `${environment.apiServiceGeneralUrl}/api/subcategories`;

    constructor(private http: HttpClient) {}

            // GET - Obtener todas las subcategorías
    getAllSubcategories(): Observable<SubcategoryDisplay[]> {
        console.log('🚀 Iniciando getAllSubcategories...');

        // Obtener todas las categorías primero
        return this.http.get<any>(`${environment.apiServiceGeneralUrl}/api/categories`).pipe(
            switchMap(categoriesResponse => {
                console.log('📊 Respuesta de categorías:', categoriesResponse);

                if (!categoriesResponse.success || !categoriesResponse.data) {
                    console.error('❌ Error en respuesta de categorías:', categoriesResponse);
                    // Si no hay categorías, devolver array vacío
                    return of([]);
                }

                const categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [categoriesResponse.data];
                console.log('📋 Categorías procesadas:', categories);

                // Si no hay categorías, devolver array vacío
                if (categories.length === 0) {
                    console.log('⚠️ No hay categorías disponibles');
                    return of([]);
                }

                // Obtener subcategorías para cada categoría
                const subcategoryRequests = categories.map((category: any) => {
                    const url = `${environment.apiServiceGeneralUrl}/api/categories/${category.id}/subcategories`;
                    console.log(`🔍 Obteniendo subcategorías para categoría ${category.id} (${category.nombre})`);
                    console.log(`🌐 URL: ${url}`);
                    return this.http.get<any>(url).pipe(
                        catchError(error => {
                            console.warn(`⚠️ Error obteniendo subcategorías para categoría ${category.id}:`, error);
                            // Retornar un observable que emite un array vacío en caso de error
                            return of({ success: true, data: [] });
                        })
                    );
                });

                return forkJoin(subcategoryRequests).pipe(
                    map((subcategoryResponses: any) => {
                        console.log('📋 Respuestas de subcategorías:', subcategoryResponses);

                        const allSubcategories: SubcategoryDisplay[] = [];

                        subcategoryResponses.forEach((response: any, index: number) => {
                            console.log(`📝 Procesando respuesta ${index}:`, response);
                            if (response.success && response.data) {
                                const subcategories = Array.isArray(response.data) ? response.data : [response.data];
                                console.log(`✅ Subcategorías de categoría ${index}:`, subcategories);

                                // Agregar el nombre de la categoría a cada subcategoría
                                const categoryName = categories[index].nombre;
                                const subcategoriesWithCategoryName = subcategories.map((subcategory: any) => ({
                                    ...subcategory,
                                    categoria_nombre: categoryName
                                }));

                                allSubcategories.push(...subcategoriesWithCategoryName);
                            } else {
                                console.warn(`⚠️ Respuesta ${index} sin datos:`, response);
                                console.warn(`⚠️ Esto puede significar que no hay subcategorías en esta categoría o hay un error`);
                            }
                        });

                        console.log('🎯 Total de subcategorías combinadas:', allSubcategories.length);
                        return allSubcategories;
                    }),
                    catchError(error => {
                        console.error('❌ Error procesando subcategorías:', error);
                        return of([]);
                    })
                );
            }),
            catchError(error => {
                console.error('❌ Error en getAllSubcategories:', error);
                // En caso de error, devolver un array vacío en lugar de fallar completamente
                return of([]);
            })
        );
    }

    // GET - Obtener subcategoría por ID
    getSubcategoryById(id: number | string): Observable<SubcategoryDisplay> {
        console.log('🔍 getSubcategoryById() iniciado con ID:', id);

        return this.http.get<SubcategoryResponse>(`${this.apiUrl}/${id}`).pipe(
            tap(response => {
                console.log('📡 Respuesta GET del backend:', response);
            }),
            switchMap(response => {
                if (response.success) {
                    const subcategory = Array.isArray(response.data) ? response.data[0] : response.data;
                    console.log('📊 Subcategoría obtenida del backend:', subcategory);
                    console.log('📊 Tiene categoria_nombre?', !!(subcategory as any).categoria_nombre);

                    // If it already has categoria_nombre, return directly
                    if ((subcategory as any).categoria_nombre) {
                        console.log('✅ Ya tiene categoria_nombre, retornando directamente');
                        return of(subcategory as SubcategoryDisplay); // Use of() to return an Observable
                    }

                    // If it doesn't have categoria_nombre, get the category
                    console.log('🔄 No tiene categoria_nombre, obteniendo categoría...');
                    return this.http.get<any>(`${environment.apiServiceGeneralUrl}/api/categories/${subcategory.categoria_id}`).pipe(
                        tap(categoryResponse => {
                            console.log('📡 Respuesta de categoría:', categoryResponse);
                        }),
                        map(categoryResponse => {
                            if (categoryResponse.success && categoryResponse.data) {
                                const category = Array.isArray(categoryResponse.data) ? categoryResponse.data[0] : categoryResponse.data;
                                console.log('📊 Categoría obtenida:', category);

                                const result = {
                                    ...subcategory,
                                    categoria_nombre: category.nombre
                                } as SubcategoryDisplay;

                                console.log('✅ Subcategoría con categoria_nombre agregada:', result);
                                return result;
                            } else {
                                console.log('⚠️ Categoría no encontrada, usando valor por defecto');
                                return {
                                    ...subcategory,
                                    categoria_nombre: 'Categoría no encontrada'
                                } as SubcategoryDisplay;
                            }
                        })
                    );
                } else {
                    console.error('❌ GET falló:', response.message);
                    throw new Error(response.message || 'Error al obtener la subcategoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // POST - Crear nueva subcategoría
    createSubcategory(subcategory: SubcategoryCreateRequest): Observable<SubcategoryDisplay> {
        // Asegurar que el nombre esté presente y no esté vacío
        if (!subcategory.nombre || subcategory.nombre.trim() === '') {
            return throwError(() => new Error('El nombre es requerido'));
        }

        // Asegurar que la categoría esté seleccionada
        if (!subcategory.categoria_id) {
            return throwError(() => new Error('La categoría es requerida'));
        }

        // Crear el objeto de datos con el formato correcto que espera el backend
        const requestData = {
            nombre: subcategory.nombre.trim(),
            descripcion: subcategory.descripcion || '',
            categoria_id: subcategory.categoria_id,
            is_active: subcategory.is_active !== undefined ? subcategory.is_active : true
        };

        return this.http.post<SubcategoryResponse>(this.apiUrl, requestData).pipe(
            switchMap(response => {
                if (response.success) {
                    const data = Array.isArray(response.data) ? response.data[0] : response.data;
                    // Obtener la subcategoría completa con categoria_nombre
                    if (data.id) {
                        return this.getSubcategoryById(data.id);
                    } else {
                        throw new Error('ID de subcategoría no encontrado en la respuesta');
                    }
                } else {
                    throw new Error(response.message || 'Error al crear la subcategoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Actualizar subcategoría
    updateSubcategory(id: number | string, requestData: SubcategoryUpdateRequest): Observable<SubcategoryDisplay> {
        console.log('🔄 updateSubcategory() iniciado con ID:', id);
        console.log('🔄 Datos de actualización:', requestData);

        return this.http.put<SubcategoryResponse>(`${this.apiUrl}/${id}`, requestData).pipe(
            tap(response => {
                console.log('📡 Respuesta PUT del backend:', response);
            }),
            switchMap(response => {
                if (response.success) {
                    console.log('✅ PUT exitoso, llamando getSubcategoryById...');
                    return this.getSubcategoryById(id); // Get full subcategory with category name
                } else {
                    console.error('❌ PUT falló:', response.message);
                    throw new Error(response.message || 'Error al actualizar la subcategoría');
                }
            }),
            tap(result => {
                console.log('✅ Resultado final de updateSubcategory:', result);
                console.log('✅ Categoria_nombre en resultado:', (result as any).categoria_nombre);
            }),
            catchError(this.handleError)
        );
    }

    // DELETE - Eliminar subcategoría
    deleteSubcategory(id: number | string): Observable<boolean> {
        return this.http.delete<SubcategoryResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return true;
                } else {
                    throw new Error(response.message || 'Error al eliminar la subcategoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // PUT - Reactivar subcategoría (cambiar is_active a true)
    reactivateSubcategory(id: number | string): Observable<SubcategoryDisplay> {
        const requestData = {
            is_active: true
        };

        return this.http.put<SubcategoryResponse>(`${this.apiUrl}/${id}`, requestData).pipe(
            map(response => {
                if (response.success) {
                    const data = Array.isArray(response.data) ? response.data[0] : response.data;
                    // Convertir Subcategory a SubcategoryDisplay
                    const subcategory = data as Subcategory;
                    return {
                        id: subcategory.id!,
                        nombre: subcategory.nombre!,
                        descripcion: subcategory.descripcion || '',
                        categoria_id: subcategory.categoria_id!,
                        categoria_nombre: 'Categoría', // Valor por defecto, se actualizará al recargar
                        is_active: subcategory.is_active || false,
                        created_at: subcategory.created_at,
                        updated_at: subcategory.updated_at
                    } as SubcategoryDisplay;
                } else {
                    throw new Error(response.message || 'Error al reactivar la subcategoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener subcategorías por categoría
    getSubcategoriesByCategory(categoryId: number): Observable<SubcategoryDisplay[]> {
        return this.http.get<SubcategoryResponse>(`${this.apiUrl}/by-category/${categoryId}`).pipe(
            map(response => {
                if (response.success) {
                    const data = Array.isArray(response.data) ? response.data : [response.data];
                    return data as SubcategoryDisplay[];
                } else {
                    throw new Error(response.message || 'Error al obtener subcategorías por categoría');
                }
            }),
            catchError(this.handleError)
        );
    }

    // Método de prueba para verificar si el problema es que no hay datos
    getTestSubcategories(): Observable<SubcategoryDisplay[]> {
        console.log('🧪 Usando datos de prueba...');
        const testData: SubcategoryDisplay[] = [
            {
                id: 1,
                nombre: 'Subcategoría de Prueba 1',
                descripcion: 'Esta es una subcategoría de prueba',
                categoria_id: 1,
                categoria_nombre: 'Categoría de Prueba',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                nombre: 'Subcategoría de Prueba 2',
                descripcion: 'Otra subcategoría de prueba',
                categoria_id: 1,
                categoria_nombre: 'Categoría de Prueba',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        return new Observable(observer => {
            setTimeout(() => {
                console.log('✅ Datos de prueba devueltos:', testData);
                observer.next(testData);
                observer.complete();
            }, 1000);
        });
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
                console.log('[SubcategoryService] Detalles completos del error 422:', errorDetails);

                if (errorDetails && errorDetails.message) {
                    errorMessage = `Error de validación: ${errorDetails.message}`;
                } else if (errorDetails && errorDetails.errors) {
                    console.log('[SubcategoryService] Errores de validación específicos:', errorDetails.errors);
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
                    case 'SUBCATEGORIA_EXISTS':
                        errorMessage = 'Ya existe una subcategoría con este nombre en la categoría seleccionada. Por favor, usa un nombre diferente.';
                        errorSeverity = 'warn';
                        break;
                    case 'SUBCATEGORIA_NOT_FOUND':
                        errorMessage = 'La subcategoría no fue encontrada.';
                        errorSeverity = 'error';
                        break;
                    case 'SUBCATEGORIA_IN_USE':
                        errorMessage = 'No se puede eliminar la subcategoría porque está siendo utilizada por otros elementos.';
                        errorSeverity = 'warn';
                        break;
                    case 'CATEGORIA_NOT_FOUND':
                        errorMessage = 'La categoría seleccionada no existe.';
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
