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
        ModalAlertComponent
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
        private modalAlertService: ModalAlertService
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
            console.log('📋 Nueva orden creada, recargando tabla...', event);
            this.loadLoans();
            this.messageService.add({
                severity: 'info',
                summary: 'Nueva Orden',
                detail: `Se ha creado una nueva orden de préstamo`,
                life: 3000
            });
        });

        const orderApprovedSub = this.webSocketService.onOrderApproved().subscribe((event: OrderEvent) => {
            console.log('✅ Orden aprobada, recargando tabla...', event);
            this.loadLoans();
            this.messageService.add({
                severity: 'success',
                summary: 'Orden Aprobada',
                detail: `Se ha aprobado una orden de préstamo`,
                life: 3000
            });
        });

        const orderRejectedSub = this.webSocketService.onOrderRejected().subscribe((event: OrderEvent) => {
            console.log('❌ Orden rechazada, recargando tabla...', event);
            this.loadLoans();
            this.messageService.add({
                severity: 'warn',
                summary: 'Orden Rechazada',
                detail: `Se ha rechazado una orden de préstamo`,
                life: 3000
            });
        });

        const orderStatusChangedSub = this.webSocketService.onOrderStatusChanged().subscribe((event: OrderEvent) => {
            console.log('🔄 Estado de orden cambiado, recargando tabla...', event);
            this.loadLoans();
        });

        const orderExpiredSub = this.webSocketService.onOrderExpired().subscribe((event: OrderEvent) => {
            console.log('⏰ Orden vencida, recargando tabla...', event);
            this.loadLoans();
            this.messageService.add({
                severity: 'error',
                summary: 'Orden Vencida',
                detail: `Una orden de préstamo ha vencido`,
                life: 5000
            });
        });

        const orderExpiringSoonSub = this.webSocketService.onOrderExpiringSoon().subscribe((event: OrderEvent) => {
            console.log('⚠️ Orden próxima a vencer, recargando tabla...', event);
            this.loadLoans();
            this.messageService.add({
                severity: 'warn',
                summary: 'Orden Próxima a Vencer',
                detail: `Una orden de préstamo está próxima a vencer`,
                life: 4000
            });
        });

        // Suscribirse a notificaciones generales
        const notificationSub = this.webSocketService.onNotification().subscribe((notification: NotificationEvent) => {
            this.messageService.add({
                severity: notification.data?.type === 'success' ? 'success' : 'info',
                summary: 'Notificación',
                detail: notification.data?.message || 'Nueva notificación',
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
                this.modalAlert = this.modalAlertService.createErrorAlert(title, message);
                break;
            case 'warning':
                this.modalAlert = this.modalAlertService.createWarningAlert(title, message);
                break;
            case 'info':
                this.modalAlert = this.modalAlertService.createInfoAlert(title, message);
                break;
            case 'success':
                this.modalAlert = this.modalAlertService.createSuccessAlert(title, message);
                break;
        }
    }

    hideModalAlert() {
        this.modalAlert = this.modalAlertService.hideAlert();
    }

    loadLoans() {
        this.loading = true;
        this.loansService.getLoans()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (loans) => {
                    this.loans = loans;
                    this.showModalAlert('success', 'Éxito', `Se cargaron ${loans.length} órdenes de préstamo`);
                },
                error: (error) => {
                    console.error('Error al cargar órdenes de préstamo:', error);
                    this.showModalAlert('error', 'Error', error.message || 'Error al cargar las órdenes de préstamo');
                }
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    viewDetails(loan: Loan) {
        this.loadingDetails = true;
        this.showDetailModal = true;

        this.loansService.getLoanDetails(loan.id)
            .pipe(finalize(() => this.loadingDetails = false))
            .subscribe({
                next: (details) => {
                    this.selectedLoanDetails = details;
                },
                error: (error) => {
                    console.error('Error al cargar detalles de la orden:', error);
                    this.showModalAlert('error', 'Error', error.message || 'Error al cargar los detalles de la orden');
                    this.selectedLoanDetails = [];
                }
            });
    }

    closeDetailModal() {
        this.showDetailModal = false;
        this.selectedLoanDetails = [];
    }
}
