import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Estadisticas {
  herramientas: {
    total_herramientas: number;
    herramientas_activas: number;
    disponibles: number;
    prestadas: number;
    danadas: number;
  };
  prestamos: {
    total_prestamos: number;
    activos: number;
    devueltos: number;
    vencidos: number;
  };
  multas: {
    total_multas: number;
    pendientes: number;
    pagadas: number;
    monto_pendiente: number;
    monto_cobrado: number;
  };
  fecha_reporte?: string;
}

export interface Prestamo {
  id: number;
  herramienta_nombre: string;
  username: string;
  categoria_nombre: string;
  subcategoria_nombre: string;
  fecha_prestamo: string;
  fecha_devolucion_estimada: string;
  estado: string;
}

export interface Multa {
  id: number;
  prestamo_id: number;
  monto: number;
  motivo: string;
  estado: string;
  fecha_creacion: string;
  fecha_pago?: string;
}

export interface HerramientaPopular {
  id: number;
  nombre: string;
  categoria: string;
  subcategoria: string;
  veces_prestada: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiServiceGeneralUrl}/api/reportes`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Obtener estadísticas completas del sistema (Solo ADMIN)
   */
  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.baseUrl}/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener reporte de préstamos por período (Solo ADMIN)
   */
  getReportePrestamos(params?: string): Observable<Prestamo[]> {
    let url = `${this.baseUrl}/prestamos`;
    
    if (params) {
      url += `?${params}`;
    }

    return this.http.get<Prestamo[]>(url, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener herramientas más prestadas (Solo ADMIN)
   */
  getHerramientasPopulares(params?: string): Observable<HerramientaPopular[]> {
    let url = `${this.baseUrl}/herramientas-populares`;
    
    if (params) {
      url += `?${params}`;
    }

    return this.http.get<HerramientaPopular[]>(url, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener reporte de multas por período (Solo ADMIN)
   */
  getReporteMultas(params?: string): Observable<Multa[]> {
    let url = `${this.baseUrl}/multas`;
    
    if (params) {
      url += `?${params}`;
    }

    return this.http.get<Multa[]>(url, {
      headers: this.getHeaders()
    });
  }
}
