import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

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
  private usingMockDataSubject = new Subject<boolean>();

  constructor(private http: HttpClient, private oauthService: OAuthService) { }

  // Observable para detectar cuando se usan datos de prueba
  public usingMockData$ = this.usingMockDataSubject.asObservable();

  // Método privado para obtener headers con token
  private getHeaders(): any {
    const token = this.oauthService.getToken();
    let headers: any = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token disponible para reportes:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No hay token disponible para reportes');
    }

    return headers;
  }

  // Método privado para manejar errores
  private handleError(error: HttpErrorResponse) {
    console.error('Error en ReportsService:', error);
    
    if (error.status === 0) {
      // Error de conexión - usar datos de prueba
      console.log('🔧 Usando datos de prueba debido a error de conexión');
      this.usingMockDataSubject.next(true);
      return of(null); // Retornar null para usar datos de prueba
    }
    
    return throwError(() => error);
  }

  // Método para notificar que se usan datos reales
  private notifyUsingRealData() {
    this.usingMockDataSubject.next(false);
  }

  // Datos de prueba para cuando la API no está disponible
  private getEstadisticasMock(): Estadisticas {
    return {
      herramientas: {
        total_herramientas: 150,
        herramientas_activas: 142,
        disponibles: 98,
        prestadas: 35,
        danadas: 9
      },
      prestamos: {
        total_prestamos: 245,
        activos: 35,
        devueltos: 198,
        vencidos: 12
      },
      multas: {
        total_multas: 28,
        pendientes: 15,
        pagadas: 13,
        monto_pendiente: 1250.00,
        monto_cobrado: 980.50
      },
      fecha_reporte: new Date().toISOString()
    };
  }

  private getPrestamosMock(): ReportePrestamos {
    return {
      prestamos: [
        {
          id: 1,
          herramienta_nombre: 'Taladro Eléctrico DeWalt',
          username: 'juan.perez',
          categoria_nombre: 'Herramientas Eléctricas',
          subcategoria_nombre: 'Taladros',
          fecha_prestamo: '2024-01-15T10:30:00Z',
          fecha_devolucion_esperada: '2024-01-22T10:30:00Z',
          estado: 'activo'
        },
        {
          id: 2,
          herramienta_nombre: 'Sierra Circular Makita',
          username: 'maria.garcia',
          categoria_nombre: 'Herramientas Eléctricas',
          subcategoria_nombre: 'Sierras',
          fecha_prestamo: '2024-01-14T14:20:00Z',
          fecha_devolucion_esperada: '2024-01-21T14:20:00Z',
          estado: 'activo'
        },
        {
          id: 3,
          herramienta_nombre: 'Martillo de Carpintero',
          username: 'carlos.lopez',
          categoria_nombre: 'Herramientas Manuales',
          subcategoria_nombre: 'Martillos',
          fecha_prestamo: '2024-01-10T09:15:00Z',
          fecha_devolucion_esperada: '2024-01-17T09:15:00Z',
          estado: 'devuelto'
        }
      ],
      total: 3,
      filtros: {}
    };
  }

  private getMultasMock(): ReporteMultas {
    return {
      multas: [
        {
          id: 1,
          username: 'juan.perez',
          herramienta_nombre: 'Taladro Eléctrico DeWalt',
          monto: 150.00,
          estado: 'pendiente',
          fecha_multa: '2024-01-20T16:45:00Z'
        },
        {
          id: 2,
          username: 'maria.garcia',
          herramienta_nombre: 'Sierra Circular Makita',
          monto: 200.00,
          estado: 'pagada',
          fecha_multa: '2024-01-18T11:30:00Z'
        },
        {
          id: 3,
          username: 'carlos.lopez',
          herramienta_nombre: 'Martillo de Carpintero',
          monto: 75.50,
          estado: 'pendiente',
          fecha_multa: '2024-01-22T08:20:00Z'
        }
      ],
      total: 3,
      filtros: {}
    };
  }

  private getHerramientasPopularesMock(): ReporteHerramientasPopulares {
    return {
      herramientas_populares: [
        {
          id: 1,
          nombre: 'Taladro Eléctrico DeWalt',
          categoria: 'Herramientas Eléctricas',
          subcategoria: 'Taladros',
          total_prestamos: 45,
          prestamos_activos: 3
        },
        {
          id: 2,
          nombre: 'Sierra Circular Makita',
          categoria: 'Herramientas Eléctricas',
          subcategoria: 'Sierras',
          total_prestamos: 38,
          prestamos_activos: 2
        },
        {
          id: 3,
          nombre: 'Martillo de Carpintero',
          categoria: 'Herramientas Manuales',
          subcategoria: 'Martillos',
          total_prestamos: 32,
          prestamos_activos: 1
        },
        {
          id: 4,
          nombre: 'Lijadora Orbital',
          categoria: 'Herramientas Eléctricas',
          subcategoria: 'Lijadoras',
          total_prestamos: 28,
          prestamos_activos: 0
        },
        {
          id: 5,
          nombre: 'Destornillador Eléctrico',
          categoria: 'Herramientas Eléctricas',
          subcategoria: 'Destornilladores',
          total_prestamos: 25,
          prestamos_activos: 1
        }
      ],
      limite: 10
    };
  }

  /**
   * Obtener estadísticas completas del sistema usando endpoints existentes
   */
  getEstadisticas(): Observable<Estadisticas> {
    // Usar endpoints existentes para obtener datos reales
    return this.http.get<any>(`${environment.apiServiceGeneralUrl}/api/tools`, {
      headers: this.getHeaders()
    }).pipe(
      map(toolsData => {
        // Generar estadísticas basadas en datos reales
        const herramientas = toolsData.data || [];
        const total_herramientas = herramientas.length;
        const herramientas_activas = herramientas.filter((h: any) => h.is_active).length;
        const disponibles = herramientas.filter((h: any) => h.estado === 'disponible').length;
        const prestadas = herramientas.filter((h: any) => h.estado === 'prestada').length;
        const danadas = herramientas.filter((h: any) => h.estado === 'dañada').length;

        return {
          herramientas: {
            total_herramientas,
            herramientas_activas,
            disponibles,
            prestadas,
            danadas
          },
          prestamos: {
            total_prestamos: 0, // Se obtendrá de otro endpoint
            activos: 0,
            devueltos: 0,
            vencidos: 0
          },
          multas: {
            total_multas: 0, // Se obtendrá de otro endpoint
            pendientes: 0,
            pagadas: 0,
            monto_pendiente: 0,
            monto_cobrado: 0
          },
          fecha_reporte: new Date().toISOString()
        };
      }),
      catchError(error => {
        console.log('🔧 API no disponible - usando datos de prueba para estadísticas');
        this.usingMockDataSubject.next(true);
        return of(this.getEstadisticasMock());
      })
    );
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
    }).pipe(
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          console.log('🔧 API no disponible - usando datos de prueba para préstamos');
          this.usingMockDataSubject.next(true);
        } else {
          console.error('Error obteniendo reporte de préstamos:', error);
        }
        return of(this.getPrestamosMock());
      }),
      map(data => {
        this.notifyUsingRealData();
        return data;
      })
    );
  }

  /**
   * Obtener reporte de herramientas más prestadas (Solo ADMIN)
   */
  getHerramientasPopulares(limite: number = 10): Observable<ReporteHerramientasPopulares> {
    const params = new HttpParams().set('limite', limite.toString());
    return this.http.get<ReporteHerramientasPopulares>(`${this.baseUrl}/herramientas-populares`, {
      params,
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          console.log('🔧 API no disponible - usando datos de prueba para herramientas populares');
          this.usingMockDataSubject.next(true);
        } else {
          console.error('Error obteniendo reporte de herramientas populares:', error);
        }
        const mockData = this.getHerramientasPopularesMock();
        mockData.limite = limite;
        return of(mockData);
      }),
      map(data => {
        this.notifyUsingRealData();
        return data;
      })
    );
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
    }).pipe(
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          console.log('🔧 API no disponible - usando datos de prueba para multas');
          this.usingMockDataSubject.next(true);
        } else {
          console.error('Error obteniendo reporte de multas:', error);
        }
        return of(this.getMultasMock());
      }),
      map(data => {
        this.notifyUsingRealData();
        return data;
      })
    );
  }
}
