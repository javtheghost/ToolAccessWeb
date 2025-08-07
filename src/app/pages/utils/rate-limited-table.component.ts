import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { RateLimitingService } from '../service/rate-limiting.service';

export interface TableConfig {
  endpoint: string;
  maxRequests?: number;
  timeWindow?: number;
  cooldownPeriod?: number;
  debounceTime?: number;
}

@Component({
  selector: 'app-rate-limited-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow">
      <!-- Header de la tabla -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold text-[var(--primary-color)]">{{ title }}</h3>
            <p class="text-sm text-gray-600">{{ subtitle }}</p>
          </div>

          <!-- Contador de rate limiting -->
          <div class="flex items-center gap-4">
            <div *ngIf="showRateLimitInfo" class="text-xs text-gray-500">
              <div>Peticiones restantes: {{ remainingRequests }}</div>
              <div *ngIf="timeRemaining > 0">Tiempo restante: {{ formatTime(timeRemaining) }}</div>
            </div>

            <button
              (click)="refreshData()"
              [disabled]="loading || isRefreshing || !canRefresh"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              [title]="getRefreshButtonTooltip()"
            >
              <svg *ngIf="!loading && !isRefreshing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <svg *ngIf="loading || isRefreshing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {{ getRefreshButtonText() }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido de la tabla -->
      <div class="p-6">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class RateLimitedTableComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Tabla';
  @Input() subtitle: string = '';
  @Input() config: TableConfig = { endpoint: 'default-table' };
  @Input() showRateLimitInfo: boolean = true;

  @Output() refreshRequested = new EventEmitter<void>();

  loading = false;
  isRefreshing = false;
  canRefresh = true;
  remainingRequests = 0;
  timeRemaining = 0;

  private destroy$ = new Subject<void>();
  private refreshSubject = new Subject<void>();
  private updateTimer: any;

  constructor(private rateLimitingService: RateLimitingService) {
    // Configurar debounce para el refrescado
    this.refreshSubject.pipe(
      debounceTime(this.config.debounceTime || 2000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.executeRefresh();
    });
  }

  ngOnInit() {
    this.updateRateLimitInfo();
    // Actualizar información de rate limiting cada segundo
    this.updateTimer = setInterval(() => {
      this.updateRateLimitInfo();
    }, 1000);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  refreshData() {
    if (this.loading || this.isRefreshing) {
      return;
    }

    // Verificar rate limiting
    if (!this.rateLimitingService.canMakeRequest(this.config.endpoint, {
      maxRequests: this.config.maxRequests,
      timeWindow: this.config.timeWindow,
      cooldownPeriod: this.config.cooldownPeriod
    })) {
      console.warn(`Rate limit alcanzado para ${this.config.endpoint}`);
      return;
    }

    this.isRefreshing = true;
    this.refreshSubject.next();
  }

  private executeRefresh() {
    this.refreshRequested.emit();
    this.rateLimitingService.recordRequest(this.config.endpoint);
    this.isRefreshing = false;
  }

  private updateRateLimitInfo() {
    this.remainingRequests = this.rateLimitingService.getRemainingRequests(this.config.endpoint);
    this.timeRemaining = this.rateLimitingService.getTimeRemaining(this.config.endpoint);
    this.canRefresh = this.rateLimitingService.canMakeRequest(this.config.endpoint);
  }

  getRefreshButtonText(): string {
    if (this.loading || this.isRefreshing) {
      return 'Actualizando...';
    }
    if (!this.canRefresh) {
      return 'Esperando...';
    }
    return 'Actualizar';
  }

  getRefreshButtonTooltip(): string {
    if (!this.canRefresh) {
      return `Rate limit alcanzado. Tiempo restante: ${this.formatTime(this.timeRemaining)}`;
    }
    return 'Actualizar datos de la tabla';
  }

  formatTime(milliseconds: number): string {
    if (milliseconds <= 0) return '0s';

    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Método público para que el componente padre pueda indicar cuando termina la carga
  setLoading(loading: boolean) {
    this.loading = loading;
  }
}
