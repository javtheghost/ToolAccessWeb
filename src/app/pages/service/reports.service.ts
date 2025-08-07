import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RateLimitingService } from './rate-limiting.service';

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
  usuarios: {
    total_usuarios: number;
    activos: number;
  };
  fecha_reporte?: string;
}

export interface Prestamo {
  id: number;
  folio: string;
  estado: string;
  fecha_solicitud: string;
  fecha_devolucion_estimada: string;
  tiempo_aprobado: number;
  usuario_nombre: string;
  usuario_email: string;
  recepcionista_nombre?: string;
  recepcionista_email?: string;
}

export interface Multa {
  id: number;
  monto: number;
  motivo: string;
  estado: string;
  fecha_creacion: string;
  usuario_nombre: string;
  usuario_email: string;
}

export interface HerramientaPopular {
  id: number;
  nombre: string;
  folio: string;
  foto_url?: string;
  categoria: string;
  subcategoria: string;
  veces_prestada: number;
  stock: number;
  estado: boolean;
}

export interface DatosHistoricos {
  mes: string;
  herramientas_activas: number;
  prestamos_activos: number;
  herramientas_disponibles: number;
  multas_generadas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private baseUrl = `${environment.apiServiceGeneralUrl}/api/reportes`;

  constructor(
    private http: HttpClient,
    private rateLimitingService: RateLimitingService
  ) { }

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
    // ✅ RATE LIMITING: Verificar límites antes de hacer petición
    const endpoint = 'reports-estadisticas';
    if (!this.rateLimitingService.canMakeRequest(endpoint, {
      maxRequests: 3,        // Solo 3 peticiones por minuto para estadísticas
      timeWindow: 60000,    // 1 minuto
      cooldownPeriod: 30000 // 30 segundos de cooldown
    })) {
      return throwError(() => new Error('Rate limit alcanzado para estadísticas'));
    }

    return this.http.get<Estadisticas>(`${this.baseUrl}/estadisticas`, {
      headers: this.getHeaders()
    }).pipe(
      // ✅ RATE LIMITING: Registrar petición exitosa
      tap(() => this.rateLimitingService.recordRequest(endpoint))
    );
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

  /**
   * Obtener datos históricos para gráficas (Solo ADMIN)
   * Si tu API no tiene este endpoint, puedes implementarlo en el backend
   */
  getDatosHistoricos(periodo: string = '12'): Observable<DatosHistoricos[]> {
    return this.http.get<DatosHistoricos[]>(`${this.baseUrl}/datos-historicos?periodo=${periodo}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Generar datos simulados basados en estadísticas actuales
   * Útil cuando no hay datos históricos disponibles
   */
  generarDatosSimulados(estadisticas: Estadisticas): DatosHistoricos[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const datos: DatosHistoricos[] = [];

    const herramientasActivas = estadisticas.herramientas?.herramientas_activas || 0;
    const prestamosActivos = estadisticas.prestamos?.activos || 0;
    const herramientasDisponibles = estadisticas.herramientas?.disponibles || 0;
    const multasGeneradas = estadisticas.multas?.total_multas || 0;

    for (let i = 0; i < 12; i++) {
      const progreso = i / 11; // 0 a 1
      const baseValue = Math.max(1, 0.3); // Valor mínimo

      datos.push({
        mes: meses[i],
        herramientas_activas: Math.round(baseValue + (herramientasActivas - baseValue) * progreso + (Math.random() - 0.5) * 0.2),
        prestamos_activos: Math.round(baseValue + (prestamosActivos - baseValue) * progreso + (Math.random() - 0.5) * 0.2),
        herramientas_disponibles: Math.round(baseValue + (herramientasDisponibles - baseValue) * progreso + (Math.random() - 0.5) * 0.2),
        multas_generadas: Math.round(baseValue + (multasGeneradas - baseValue) * progreso + (Math.random() - 0.5) * 0.2)
      });
    }

    return datos;
  }
}
