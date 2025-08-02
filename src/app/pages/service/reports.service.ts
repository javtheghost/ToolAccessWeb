import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  fecha_reporte: string;
}

export interface Prestamo {
  id: number;
  herramienta_nombre: string;
  username: string;
  categoria_nombre: string;
  subcategoria_nombre: string;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  estado: string;
}

export interface HerramientaPopular {
  id: number;
  nombre: string;
  categoria: string;
  subcategoria: string;
  total_prestamos: number;
  prestamos_activos: number;
}

export interface Multa {
  id: number;
  username: string;
  herramienta_nombre: string;
  monto: number;
  estado: string;
  fecha_multa: string;
}

export interface ReportePrestamos {
  prestamos: Prestamo[];
  total: number;
  filtros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
  };
}

export interface ReporteMultas {
  multas: Multa[];
  total: number;
  filtros: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
  };
}

export interface ReporteHerramientasPopulares {
  herramientas_populares: HerramientaPopular[];
  limite: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener estadísticas completas del sistema (Solo ADMIN)
   */
  getEstadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.baseUrl}/estadisticas`);
  }

  /**
   * Obtener reporte de préstamos por período (Solo ADMIN)
   */
  getReportePrestamos(fechaInicio?: string, fechaFin?: string, estado?: string): Observable<ReportePrestamos> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin);
    }
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ReportePrestamos>(`${this.baseUrl}/prestamos`, { params });
  }

  /**
   * Obtener reporte de herramientas más prestadas (Solo ADMIN)
   */
  getHerramientasPopulares(limite: number = 10): Observable<ReporteHerramientasPopulares> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ReporteHerramientasPopulares>(`${this.baseUrl}/herramientas-populares`, { params });
  }

  /**
   * Obtener reporte de multas por período (Solo ADMIN)
   */
  getReporteMultas(fechaInicio?: string, fechaFin?: string, estado?: string): Observable<ReporteMultas> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fecha_inicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fecha_fin', fechaFin);
    }
    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ReporteMultas>(`${this.baseUrl}/multas`, { params });
  }
}
