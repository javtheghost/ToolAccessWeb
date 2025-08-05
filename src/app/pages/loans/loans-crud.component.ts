import { Component, OnInit, ViewChild } from '@angular/core';
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
        SkeletonModule
    ],
    templateUrl: './loans-crud.component.html',
    providers: [MessageService],
    styleUrls: ['./loans-crud.component.scss']
})
export class LoansCrudComponent implements OnInit {
    loans: Loan[] = [];
    @ViewChild('dt') dt!: Table;

    // Detección de dispositivo móvil
    isMobile = false;

    showDetailModal = false;
    selectedLoanDetails: LoanDetail[] = [];
    loading = false;
    loadingDetails = false;

    constructor(
        private messageService: MessageService,
        private loansService: LoansService,
        private mobileDetectionService: MobileDetectionService
    ) {}

    ngOnInit() {
        this.loadLoans();
        this.setupMobileDetection();
    }

    private setupMobileDetection() {
        // Suscribirse a los cambios de detección móvil
        this.mobileDetectionService.isMobile$.subscribe((isMobile: boolean) => {
            this.isMobile = isMobile;
        });
    }

    loadLoans() {
        this.loading = true;
        this.loansService.getLoans()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (loans) => {
                    this.loans = loans;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Se cargaron ${loans.length} órdenes de préstamo`
                    });
                },
                error: (error) => {
                    console.error('Error al cargar órdenes de préstamo:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al cargar las órdenes de préstamo'
                    });
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
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al cargar los detalles de la orden'
                    });
                    this.selectedLoanDetails = [];
                }
            });
    }

    closeDetailModal() {
        this.showDetailModal = false;
        this.selectedLoanDetails = [];
    }
}
