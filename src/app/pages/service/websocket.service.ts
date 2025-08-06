import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { environment } from '../../../environments/environment';

// Type for Socket
type SocketType = ReturnType<typeof io>;

export interface OrderEvent {
  type: string;
  data: any;
  timestamp: string;
}

export interface NotificationEvent {
  type: string;
  data: any;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: SocketType | null = null;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  // Observables para diferentes tipos de eventos
  public connectionStatus$ = this.connectionStatus.asObservable();

  constructor() {
    this.connect();
  }

  /**
   * Conectar al servidor WebSocket
   */
  private connect(): void {
    if (this.socket?.connected) {
      return;
    }

    try {
      // Usar la URL base del API OAuth
      const socketUrl = environment.apiServiceGeneralUrl;
      
      this.socket = io(socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000,
        transports: ['websocket', 'polling']
      });

      this.setupEventListeners();
      
      console.log('🔌 Intentando conectar WebSocket a:', socketUrl);
    } catch (error) {
      console.error('❌ Error al conectar WebSocket:', error);
    }
  }

  /**
   * Configurar listeners de eventos del socket
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket?.id);
      this.connectionStatus.next(true);

      // Unirse a la sala del usuario (si hay token)
      const userId = this.getCurrentUserId();
      if (userId) {
        this.socket?.emit('join-user-room', userId);
        console.log(`👤 Usuario ${userId} unido a su sala personal`);
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 WebSocket desconectado:', reason);
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Error de conexión WebSocket:', error);
      this.connectionStatus.next(false);
    });

    this.socket.on('reconnect', (attemptNumber: any) => {
      console.log('🔄 WebSocket reconectado después de', attemptNumber, 'intentos');
      this.connectionStatus.next(true);
    });
  }

  /**
   * Obtener ID del usuario actual (desde localStorage o sessionStorage)
   */
  private getCurrentUserId(): string | null {
    try {
      // Buscar en diferentes posibles ubicaciones del token/usuario
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user.user_id || null;
      }

      // También verificar si hay un token y extraer el user_id
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      if (token) {
        // Decodificar el JWT para obtener el user_id (básico, sin librerías)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.user_id || payload.sub || null;
        } catch {
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo ID de usuario:', error);
      return null;
    }
  }

  /**
   * 📋 EVENTOS DE ÓRDENES DE PRÉSTAMO
   */

  // Escuchar órdenes creadas
  onOrderCreated(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'order:created');
  }

  // Escuchar órdenes aprobadas
  onOrderApproved(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'order:approved');
  }

  // Escuchar órdenes rechazadas
  onOrderRejected(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'order:rejected');
  }

  // Escuchar órdenes vencidas
  onOrderExpired(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'order:expired');
  }

  // Escuchar órdenes próximas a vencer
  onOrderExpiringSoon(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'order:expiring-soon');
  }

  // Escuchar cambios de estado general de órdenes
  onOrderStatusChanged(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'order:status-changed');
  }

  /**
   * 💰 EVENTOS DE MULTAS
   */

  // Escuchar multas creadas
  onFineCreated(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'fine:created');
  }

  // Escuchar multas pagadas
  onFinePaid(): Observable<OrderEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'fine:paid');
  }

  /**
   * 🔔 EVENTOS DE NOTIFICACIONES
   */

  // Escuchar notificaciones nuevas
  onNotification(): Observable<NotificationEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'notification:new');
  }

  // Escuchar notificaciones broadcast
  onBroadcastNotification(): Observable<NotificationEvent> {
    if (!this.socket) {
      return new Observable(observer => observer.complete());
    }
    return fromEvent(this.socket, 'notification:broadcast');
  }

  /**
   * 🛠️ MÉTODOS UTILITARIOS
   */

  // Verificar si está conectado
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Desconectar manualmente
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.connectionStatus.next(false);
      console.log('🔌 WebSocket desconectado manualmente');
    }
  }

  // Reconectar manualmente
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
      console.log('🔄 Intentando reconectar WebSocket...');
    } else {
      this.connect();
    }
  }

  // Emitir evento personalizado (para testing)
  emit(eventName: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(eventName, data);
      console.log(`📤 Evento emitido: ${eventName}`, data);
    }
  }

  // Limpiar al destruir el servicio
  ngOnDestroy(): void {
    this.disconnect();
  }
}
