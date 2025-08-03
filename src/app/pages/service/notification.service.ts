import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OAuthService } from './oauth.service';

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'prestamo_vencido' | 'devolucion' | 'multa' | 'recordatorio' | 'sistema';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  usuario_destinatario: number;
  leida: boolean;
  fecha_lectura: string | null;
  metadata?: any;
  is_active: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  usuario_creacion: number;
  usuario_actualizacion: number | null;
}

export interface NotificationResponse {
  data: Notification[];
  message: string;
  meta: {
    total: number;
    no_leidas: number;
    por_prioridad: {
      critica: number;
      alta: number;
      media: number;
      baja: number;
    };
    page: number;
    limit: number;
    total_pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiServiceGeneralUrl}/api/notificaciones`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  // Método privado para obtener headers con token
  private getHeaders(): HttpHeaders {
    const token = this.oauthService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Obtener notificaciones del usuario
   */
  getNotifications(params?: {
    tipo?: string;
    leida?: boolean;
    prioridad?: string;
    page?: number;
    limit?: number;
  }): Observable<NotificationResponse> {
    let url = this.apiUrl;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
    }

    return this.http.get<NotificationResponse>(url, {
      headers: this.getHeaders()
    });
  }

  /**
   * Marcar notificación como leída
   */
  markAsRead(notificationId: number): Observable<{ data: Notification; message: string }> {
    return this.http.put<{ data: Notification; message: string }>(
      `${this.apiUrl}/${notificationId}/leer`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<{ data: any; message: string }> {
    return this.http.put<{ data: any; message: string }>(
      `${this.apiUrl}/leer-todas`,
      {},
      { headers: this.getHeaders() }
    );
  }

  /**
   * Actualizar el contador de notificaciones no leídas
   */
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  /**
   * Obtener el contador actual de notificaciones no leídas
   */
  getUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Cargar notificaciones y actualizar contador
   */
  loadNotificationsAndUpdateCount(): Observable<NotificationResponse> {
    return new Observable(observer => {
      this.getNotifications().subscribe({
        next: (response) => {
          this.updateUnreadCount(response.meta.no_leidas);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Obtener icono según el tipo de notificación
   */
  getNotificationIcon(tipo: string): string {
    switch (tipo) {
      case 'prestamo_vencido':
        return 'pi pi-exclamation-triangle';
      case 'devolucion':
        return 'pi pi-check-circle';
      case 'multa':
        return 'pi pi-dollar';
      case 'recordatorio':
        return 'pi pi-clock';
      case 'sistema':
        return 'pi pi-cog';
      default:
        return 'pi pi-bell';
    }
  }

  /**
   * Obtener color según la prioridad
   */
  getPriorityColor(prioridad: string): string {
    switch (prioridad) {
      case 'critica':
        return '#dc2626'; // red-600
      case 'alta':
        return '#ea580c'; // orange-600
      case 'media':
        return '#ca8a04'; // yellow-600
      case 'baja':
        return '#059669'; // green-600
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Formatear fecha relativa
   */
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} h`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  }
}
