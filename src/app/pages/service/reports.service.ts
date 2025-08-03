import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

export interface Estadisticas {
  total_herramientas: number;
  herramientas_activas: number;
  herramientas_inactivas: number;
  herramientas_sin_stock: number;
  total_categorias: number;
  total_subcategorias: number;
  prestamos_activos: number;
  prestamos_vencidos: number;
  multas_pendientes: number;
  multas_pagadas: number;
  danos_reportados: number;
  danos_reparados: number;
  valor_total_inventario: number;
  valor_promedio_herramienta: number;
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

export interface ReporteResponse {
  success: boolean;
  data: any;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiServiceGeneralUrl}/api/reportes`;

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  // Método privado para obtener headers con token
  private getHeaders(): any {
    const token = this.oauthService.getToken();
    let headers: any = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
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

    return this.http.get<ReportePrestamos>(`${this.baseUrl}/prestamos`, {
      params,
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener reporte de herramientas más prestadas (Solo ADMIN)
   */
  getHerramientasPopulares(limite: number = 10): Observable<ReporteHerramientasPopulares> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ReporteHerramientasPopulares>(`${this.baseUrl}/herramientas-populares`, {
      params,
      headers: this.getHeaders()
    });
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

    return this.http.get<ReporteMultas>(`${this.baseUrl}/multas`, {
      params,
      headers: this.getHeaders()
    });
  }
}
