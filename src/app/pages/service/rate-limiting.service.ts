import { Injectable } from '@angular/core';
import { Subject, Observable, timer } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

export interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // en milisegundos
  cooldownPeriod: number; // en milisegundos
}

@Injectable({
  providedIn: 'root'
})
export class RateLimitingService {
  private requestCounts = new Map<string, number>();
  private lastRequestTimes = new Map<string, number>();
  private cooldownTimers = new Map<string, any>();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 5,
    timeWindow: 60000, // 1 minuto
    cooldownPeriod: 30000 // 30 segundos
  };

  /**
   * Verifica si se puede hacer una petición según el rate limiting
   * @param endpoint Identificador único del endpoint
   * @param config Configuración opcional de rate limiting
   * @returns true si se puede hacer la petición, false si está limitado
   */
  canMakeRequest(endpoint: string, config?: Partial<RateLimitConfig>): boolean {
    const fullConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();

    // Verificar si está en cooldown
    if (this.cooldownTimers.has(endpoint)) {
      return false;
    }

    // Obtener información del endpoint
    const requestCount = this.requestCounts.get(endpoint) || 0;
    const lastRequestTime = this.lastRequestTimes.get(endpoint) || 0;

    // Si ha pasado el tiempo de ventana, resetear contador
    if (now - lastRequestTime > fullConfig.timeWindow) {
      this.requestCounts.set(endpoint, 1);
      this.lastRequestTimes.set(endpoint, now);
      return true;
    }

    // Verificar si se ha excedido el límite
    if (requestCount >= fullConfig.maxRequests) {
      this.startCooldown(endpoint, fullConfig.cooldownPeriod);
      return false;
    }

    // Incrementar contador y actualizar tiempo
    this.requestCounts.set(endpoint, requestCount + 1);
    this.lastRequestTimes.set(endpoint, now);
    return true;
  }

  /**
   * Registra una petición exitosa
   * @param endpoint Identificador del endpoint
   */
  recordRequest(endpoint: string): void {
    const now = Date.now();
    this.lastRequestTimes.set(endpoint, now);
  }

  /**
   * Obtiene el tiempo restante hasta que se pueda hacer otra petición
   * @param endpoint Identificador del endpoint
   * @returns Tiempo restante en milisegundos, 0 si no hay restricción
   */
  getTimeRemaining(endpoint: string): number {
    const lastRequestTime = this.lastRequestTimes.get(endpoint) || 0;
    const now = Date.now();
    const timeElapsed = now - lastRequestTime;

    if (timeElapsed >= this.defaultConfig.timeWindow) {
      return 0;
    }

    return this.defaultConfig.timeWindow - timeElapsed;
  }

  /**
   * Obtiene el número de peticiones restantes en la ventana actual
   * @param endpoint Identificador del endpoint
   * @returns Número de peticiones restantes
   */
  getRemainingRequests(endpoint: string): number {
    const requestCount = this.requestCounts.get(endpoint) || 0;
    return Math.max(0, this.defaultConfig.maxRequests - requestCount);
  }

  /**
   * Inicia el período de cooldown para un endpoint
   * @param endpoint Identificador del endpoint
   * @param duration Duración del cooldown en milisegundos
   */
  private startCooldown(endpoint: string, duration: number): void {
    // Limpiar timer existente si lo hay
    if (this.cooldownTimers.has(endpoint)) {
      clearTimeout(this.cooldownTimers.get(endpoint));
    }

    // Crear nuevo timer
    const timer = setTimeout(() => {
      this.cooldownTimers.delete(endpoint);
      this.requestCounts.set(endpoint, 0);
    }, duration);

    this.cooldownTimers.set(endpoint, timer);
  }

  /**
   * Limpia todos los datos de rate limiting para un endpoint
   * @param endpoint Identificador del endpoint
   */
  clearEndpoint(endpoint: string): void {
    this.requestCounts.delete(endpoint);
    this.lastRequestTimes.delete(endpoint);

    if (this.cooldownTimers.has(endpoint)) {
      clearTimeout(this.cooldownTimers.get(endpoint));
      this.cooldownTimers.delete(endpoint);
    }
  }

  /**
   * Limpia todos los datos de rate limiting
   */
  clearAll(): void {
    this.requestCounts.clear();
    this.lastRequestTimes.clear();

    this.cooldownTimers.forEach(timer => clearTimeout(timer));
    this.cooldownTimers.clear();
  }
}
