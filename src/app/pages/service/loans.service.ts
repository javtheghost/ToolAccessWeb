import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces para órdenes de préstamo
export interface Loan {
    id: number;
    folio: string;
    usuario_id: number;
    usuario_nombre: string;
    estado: string;
    fecha_solicitud: string;
    fecha_aprobacion?: string;
    fecha_devolucion_estimada?: string;
    fecha_devolucion_real?: string;
    tiempo_solicitado: number;
    tiempo_aprobado?: number;
    detalles?: string;
    justificacion?: string;
    created_at?: string;
    updated_at?: string;
    herramientas?: LoanDetail[];
}

export interface LoanDetail {
    id: number;
    orden_prestamo_id: number;
    herramienta_id: number;
    herramienta_nombre: string;
    cantidad: number;
    created_at?: string;
}

export interface LoanResponse {
    success: boolean;
    data: Loan | Loan[];
    message: string;
    meta?: {
        total?: number;
        pendientes?: number;
        aprobadas?: number;
        rechazadas?: number;
        terminadas?: number;
        vencidas?: number;
        total_sistema?: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class LoansService {
    private apiUrl = `${environment.apiUrl}/loan-orders`;

    constructor(private http: HttpClient) {}

    // GET - Obtener todas las órdenes de préstamo (ADMIN)
    getLoans(search?: string, estado?: string): Observable<Loan[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('search', search);
        }
        if (estado) {
            params = params.set('estado', estado);
        }

        return this.http.get<LoanResponse>(this.apiUrl, { params }).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data : [response.data];
                } else {
                    throw new Error(response.message || 'Error al obtener órdenes de préstamo');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener orden de préstamo por ID con detalles (ADMIN)
    getLoanById(id: number): Observable<Loan> {
        return this.http.get<LoanResponse>(`${this.apiUrl}/${id}`).pipe(
            map(response => {
                if (response.success) {
                    return Array.isArray(response.data) ? response.data[0] : response.data;
                } else {
                    throw new Error(response.message || 'Error al obtener la orden de préstamo');
                }
            }),
            catchError(this.handleError)
        );
    }

    // GET - Obtener detalles de una orden (ADMIN) - Los detalles vienen incluidos en getLoanById
    getLoanDetails(loanId: number): Observable<LoanDetail[]> {
        return this.getLoanById(loanId).pipe(
            map(loan => loan.herramientas || [])
        );
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del servidor
            errorMessage = error.error?.message || error.message || `Error ${error.status}: ${error.statusText}`;
        }

        console.error('Error en LoansService:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
