import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { LoansService, Loan, LoanDetail } from '../service/loans.service';
import { finalize } from 'rxjs/operators';
import { MobileDetectionService } from '../service/mobile-detection.service';
import { WebSocketService, OrderEvent, NotificationEvent } from '../service/websocket.service';
import { Subscription } from 'rxjs';
import { ModalAlertService, ModalAlert } from '../utils/modal-alert.service';
import { ModalAlertComponent } from '../utils/modal-alert.component';
import { DomSanitizer } from '@angular/platform-browser';
import { TimeFormatPipe } from './time-format.pipe';
import { RateLimitingService } from '../service/rate-limiting.service';
import { getRateLimitConfig } from '../service/rate-limiting-config';

@Component({
    selector: 'app-loans-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        InputIconModule,
        IconFieldModule,
        DialogModule,
        TooltipModule,
        SkeletonModule,
        ModalAlertComponent,
        TimeFormatPipe
    ],
    templateUrl: './loans-crud.component.html',
    providers: [MessageService],
    styleUrls: ['./loans-crud.component.scss']
})
export class LoansCrudComponent implements OnInit, OnDestroy {
    loans: Loan[] = [];
    @ViewChild('dt') dt!: Table;

    // Detección de dispositivo móvil
    isMobile = false;

    showDetailModal = false;
    selectedLoanDetails: LoanDetail[] = [];
    loading = false;
    loadingDetails = false;

    // WebSocket subscriptions
    private subscriptions: Subscription[] = [];
    modalAlert: ModalAlert = { show: false, type: 'error', title: '', message: '' };

    constructor(
        private messageService: MessageService,
        private loansService: LoansService,
        private mobileDetectionService: MobileDetectionService,
        private webSocketService: WebSocketService,
        private modalAlertService: ModalAlertService,
        private sanitizer: DomSanitizer,
        private rateLimitingService: RateLimitingService
    ) {}

    ngOnInit() {
        this.loadLoans();
        this.setupMobileDetection();
        this.setupWebSocket();
    }

    ngOnDestroy() {
        // Limpiar suscripciones
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.webSocketService.disconnect();
    }

    private setupWebSocket() {
        // Suscribirse a eventos de órdenes para recargar la tabla automáticamente
        const orderCreatedSub = this.webSocketService.onOrderCreated().subscribe((event: OrderEvent) => {
            this.loadLoans();
            this.messageService.add({
                severity: 'info',
                summary: 'Nueva Orden',
                detail: this.sanitizeMessage('Se ha creado una nueva orden de préstamo'),
                life: 3000
            });
        });

        const orderApprovedSub = this.webSocketService.onOrderApproved().subscribe((event: OrderEvent) => {
            this.loadLoans();
            this.messageService.add({
                severity: 'success',
                summary: 'Orden Aprobada',
                detail: this.sanitizeMessage('Se ha aprobado una orden de préstamo'),
                life: 3000
            });
        });

        const orderRejectedSub = this.webSocketService.onOrderRejected().subscribe((event: OrderEvent) => {
            this.loadLoans();
            this.messageService.add({
                severity: 'warn',
                summary: 'Orden Rechazada',
                detail: this.sanitizeMessage('Se ha rechazado una orden de préstamo'),
                life: 3000
            });
        });

        const orderStatusChangedSub = this.webSocketService.onOrderStatusChanged().subscribe((event: OrderEvent) => {
            this.loadLoans();
        });

        const orderExpiredSub = this.webSocketService.onOrderExpired().subscribe((event: OrderEvent) => {
            this.loadLoans();
            this.messageService.add({
                severity: 'error',
                summary: 'Orden Vencida',
                detail: this.sanitizeMessage('Una orden de préstamo ha vencido'),
                life: 5000
            });
        });

        const orderExpiringSoonSub = this.webSocketService.onOrderExpiringSoon().subscribe((event: OrderEvent) => {
            this.loadLoans();
            this.messageService.add({
                severity: 'warn',
                summary: 'Orden Próxima a Vencer',
                detail: this.sanitizeMessage('Una orden de préstamo está próxima a vencer'),
                life: 4000
            });
        });

        // Suscribirse a notificaciones generales
        const notificationSub = this.webSocketService.onNotification().subscribe((notification: NotificationEvent) => {
            this.messageService.add({
                severity: notification.data?.type === 'success' ? 'success' : 'info',
                summary: 'Notificación',
                detail: this.sanitizeMessage(notification.data?.message || 'Nueva notificación'),
                life: 3000
            });
        });

        // Agregar todas las suscripciones para limpieza posterior
        this.subscriptions.push(
            orderCreatedSub,
            orderApprovedSub,
            orderRejectedSub,
            orderStatusChangedSub,
            orderExpiredSub,
            orderExpiringSoonSub,
            notificationSub
        );
    }

    private setupMobileDetection() {
        // Suscribirse a los cambios de detección móvil
        this.mobileDetectionService.isMobile$.subscribe((isMobile: boolean) => {
            this.isMobile = isMobile;
        });
    }

    showModalAlert(type: 'error' | 'warning' | 'info' | 'success', title: string, message: string) {
        switch (type) {
            case 'error':
                this.modalAlert = this.modalAlertService.createErrorAlert(
                    this.sanitizeString(title),
                    this.sanitizeMessage(message)
                );
                break;
            case 'warning':
                this.modalAlert = this.modalAlertService.createWarningAlert(
                    this.sanitizeString(title),
                    this.sanitizeMessage(message)
                );
                break;
            case 'info':
                this.modalAlert = this.modalAlertService.createInfoAlert(
                    this.sanitizeString(title),
                    this.sanitizeMessage(message)
                );
                break;
            case 'success':
                this.modalAlert = this.modalAlertService.createSuccessAlert(
                    this.sanitizeString(title),
                    this.sanitizeMessage(message)
                );
                break;
        }
    }

    hideModalAlert() {
        this.modalAlert = this.modalAlertService.hideAlert();
    }

    loadLoans() {
        // ✅ RATE LIMITING: Verificar límites antes de hacer petición
        const endpoint = 'loans-load';
        const config = getRateLimitConfig(endpoint);

        if (!this.rateLimitingService.canMakeRequest(endpoint, config)) {
            const timeRemaining = this.rateLimitingService.getTimeRemaining(endpoint);
            const remainingRequests = this.rateLimitingService.getRemainingRequests(endpoint);

            this.messageService.add({
                severity: 'warn',
                summary: 'Límite alcanzado',
                detail: `Espera ${Math.ceil(timeRemaining / 1000)}s antes de hacer otra petición. Peticiones restantes: ${remainingRequests}`,
                life: 3000
            });
            return;
        }

        this.loading = true;
        this.loansService.getLoans()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (loans) => {
                    // Sanitizar préstamos recibidos
                    this.loans = loans.map(loan => this.sanitizeLoan(loan));

                    // ✅ RATE LIMITING: Registrar petición exitosa
                    this.rateLimitingService.recordRequest(endpoint);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Se cargaron ${loans.length} órdenes de préstamo`,
                        life: 3000
                    });
                },
                error: (error) => {
                    console.error('Error al cargar órdenes de préstamo:', error);
                    this.showModalAlert('error', 'Error', this.sanitizeMessage(error.message || 'Error al cargar las órdenes de préstamo'));
                }
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        const target = event.target as HTMLInputElement;
        const sanitizedValue = this.sanitizeString(target.value);
        table.filterGlobal(sanitizedValue, 'contains');
    }

    viewDetails(loan: Loan) {
        // ✅ RATE LIMITING: Verificar límites antes de cargar detalles
        const endpoint = 'loans-details';
        const config = getRateLimitConfig(endpoint);

        if (!this.rateLimitingService.canMakeRequest(endpoint, config)) {
            const timeRemaining = this.rateLimitingService.getTimeRemaining(endpoint);
            const remainingRequests = this.rateLimitingService.getRemainingRequests(endpoint);

            this.messageService.add({
                severity: 'warn',
                summary: 'Límite alcanzado',
                detail: `Espera ${Math.ceil(timeRemaining / 1000)}s antes de ver más detalles. Peticiones restantes: ${remainingRequests}`,
                life: 3000
            });
            return;
        }

        this.loadingDetails = true;
        this.showDetailModal = true;

        this.loansService.getLoanDetails(loan.id)
            .pipe(finalize(() => this.loadingDetails = false))
            .subscribe({
                next: (details) => {
                    // Sanitizar detalles del préstamo
                    this.selectedLoanDetails = details.map(detail => this.sanitizeLoanDetail(detail));

                    // ✅ RATE LIMITING: Registrar petición exitosa
                    this.rateLimitingService.recordRequest(endpoint);
                },
                error: (error) => {
                    console.error('Error al cargar detalles de la orden:', error);
                    this.showModalAlert('error', 'Error', this.sanitizeMessage(error.message || 'Error al cargar los detalles de la orden'));
                    this.selectedLoanDetails = [];
                }
            });
    }

    closeDetailModal() {
        this.showDetailModal = false;
        this.selectedLoanDetails = [];
    }

    // MÉTODOS DE SANITIZACIÓN
    private sanitizeLoan(loan: Loan): Loan {
        return {
            ...loan,
            usuario_nombre: loan.usuario_nombre ? this.sanitizeString(loan.usuario_nombre) : '',
            usuario_email: loan.usuario_email ? this.sanitizeEmail(loan.usuario_email) : '',
            estado: loan.estado ? this.sanitizeString(loan.estado) : '',
            observaciones: loan.observaciones ? this.sanitizeString(loan.observaciones) : ''
        };
    }

    private sanitizeLoanDetail(detail: LoanDetail): LoanDetail {
        return {
            ...detail,
            herramienta_nombre: detail.herramienta_nombre ? this.sanitizeString(detail.herramienta_nombre) : '',
            categoria_nombre: detail.categoria_nombre ? this.sanitizeString(detail.categoria_nombre) : '',
            subcategoria_nombre: detail.subcategoria_nombre ? this.sanitizeString(detail.subcategoria_nombre) : '',
            observaciones: detail.observaciones ? this.sanitizeString(detail.observaciones) : ''
        };
    }

    private sanitizeString(value: string | undefined): string {
        if (!value || typeof value !== 'string') return '';

        // Remover caracteres peligrosos y limitar longitud
        return value
            .replace(/[<>]/g, '') // Remover < y >
            .replace(/javascript:/gi, '') // Remover javascript:
            .replace(/on\w+=/gi, '') // Remover event handlers
            .substring(0, 200); // Limitar longitud
    }

    private sanitizeEmail(value: string | undefined): string {
        if (!value || typeof value !== 'string') return '';

        // Validar formato de email y sanitizar
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const sanitized = this.sanitizeString(value);

        return emailRegex.test(sanitized) ? sanitized : '';
    }

    private sanitizeMessage(message: string): string {
        return this.sanitizeString(message);
    }

    // MÉTODOS PARA CLASES CSS Y ESTADOS
    getDateStatus(date: string | undefined, type: 'solicitud' | 'aprobacion' | 'devolucion_estimada' | 'devolucion_real'): {
        text: string;
        color: string;
        fontWeight: string;
        icon?: string;
    } {
        if (!date) {
            switch (type) {
                case 'solicitud':
                    return { text: 'Pendiente', color: 'text-gray-500', fontWeight: 'font-normal', icon: '⏳' };
                case 'aprobacion':
                    return { text: 'Sin aprobar', color: 'text-orange-500', fontWeight: 'font-medium', icon: '⏸️' };
                case 'devolucion_estimada':
                    return { text: 'Sin estimar', color: 'text-blue-500', fontWeight: 'font-medium', icon: '📅' };
                case 'devolucion_real':
                    return { text: 'Sin devolver', color: 'text-red-500', fontWeight: 'font-medium', icon: '🛠️' };
                default:
                    return { text: '-', color: 'text-gray-400', fontWeight: 'font-normal' };
            }
        }

        const dateObj = new Date(date);
        const now = new Date();
        const isPast = dateObj < now;
        const isToday = dateObj.toDateString() === now.toDateString();

        switch (type) {
                        case 'solicitud':
                return {
                    text: 'Completada',
                    color: 'text-green-600',
                    fontWeight: 'font-bold',
                    icon: '📝'
                };
            case 'aprobacion':
                return {
                    text: 'Aprobada',
                    color: 'text-[var(--secundary-color)]',
                    fontWeight: 'font-bold',
                    icon: '✅'
                };
            case 'devolucion_estimada':
                if (isPast && !isToday) {
                    return {
                        text: 'Vencida',
                        color: 'text-red-600',
                        fontWeight: 'font-bold',
                        icon: '⚠️'
                    };
                } else if (isToday) {
                    return {
                        text: 'Hoy',
                        color: 'text-orange-600',
                        fontWeight: 'font-bold',
                        icon: '🔥'
                    };
                                } else {
                    return {
                        text: 'Pendiente',
                        color: 'text-[var(--primary-color)]',
                        fontWeight: 'font-bold',
                        icon: '📅'
                    };
                }
                                                case 'devolucion_real':
                return {
                    text: 'Devuelta',
                    color: 'text-[var(--color-success)]',
                    fontWeight: 'font-bold',
                    icon: '🛠️'
                };
            default:
                return { text: 'Completada', color: 'text-gray-600', fontWeight: 'font-medium' };
        }
    }

        getTimeStatus(minutes: number | undefined, type: 'solicitado' | 'aprobado'): {
        text: string;
        color: string;
        fontWeight: string;
    } {
        if (!minutes || minutes <= 0) {
            switch (type) {
                case 'solicitado':
                    return { text: 'Sin especificar', color: 'text-gray-500', fontWeight: 'font-normal' };
                case 'aprobado':
                    return { text: 'Sin aprobar', color: 'text-orange-500', fontWeight: 'font-medium' };
                default:
                    return { text: '-', color: 'text-gray-400', fontWeight: 'font-normal' };
            }
        }

        switch (type) {
            case 'solicitado':
                return { text: 'Tiempo solicitado', color: 'text-[var(--secundary-color)]', fontWeight: 'font-bold' };
            case 'aprobado':
                return { text: 'Tiempo aprobado', color: 'text-[var(--color-success)]', fontWeight: 'font-bold' };
            default:
                return { text: 'Tiempo', color: 'text-gray-600', fontWeight: 'font-medium' };
        }
    }

    // MÉTODOS PARA CLASES CSS
    getDateCellClasses(date: string | undefined, type: 'solicitud' | 'aprobacion' | 'devolucion_estimada' | 'devolucion_real'): string {
        if (!date) {
            return 'date-pending';
        }

        switch (type) {
            case 'solicitud':
            case 'aprobacion':
                return 'date-approved';
            case 'devolucion_estimada':
                const dateObj = new Date(date);
                const now = new Date();
                const isPast = dateObj < now;
                const isToday = dateObj.toDateString() === now.toDateString();

                if (isPast && !isToday) return 'date-overdue';
                if (isToday) return 'date-today';
                return 'date-future';
            case 'devolucion_real':
                return 'date-completed';
            default:
                return '';
        }
    }

    getTimeCellClasses(minutes: number | undefined, type: 'solicitado' | 'aprobado'): string {
        if (!minutes || minutes <= 0) {
            return type === 'aprobado' ? 'time-pending' : '';
        }

        return type === 'solicitado' ? 'time-requested' : 'time-approved';
    }

    isDateOverdue(date: string | undefined): boolean {
        if (!date) return false;
        const dateObj = new Date(date);
        const now = new Date();
        return dateObj < now && dateObj.toDateString() !== now.toDateString();
    }

    isDateToday(date: string | undefined): boolean {
        if (!date) return false;
        const dateObj = new Date(date);
        const now = new Date();
        return dateObj.toDateString() === now.toDateString();
    }

    isDateFuture(date: string | undefined): boolean {
        if (!date) return false;
        const dateObj = new Date(date);
        const now = new Date();
        return dateObj > now;
    }
}
