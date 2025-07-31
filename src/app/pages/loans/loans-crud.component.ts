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
import { LoansService, Loan, LoanDetail } from '../service/loans.service';
import { finalize } from 'rxjs/operators';

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
        TooltipModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <p-table
        #dt
        [value]="loans"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['folio', 'usuario_nombre', 'estado']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
        [loading]="loading"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Consulta de Órdenes de Préstamo</h5>
                <div class="flex gap-2">
                    <p-button
                        icon="pi pi-refresh"
                        (click)="loadLoans()"
                        [loading]="loading"
                        styleClass="p-button-outlined p-button-sm"
                        pTooltip="Actualizar lista"
                        tooltipPosition="top">
                    </p-button>
                </div>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar por folio, usuario o estado..." />
                </p-iconfield>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>Folio</th>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
                <th>Fecha Aprobación</th>
                <th>Fecha Devolución Estimada</th>
                <th>Fecha Devolución Real</th>
                <th>Tiempo Solicitado</th>
                <th>Tiempo Aprobado</th>
                <th>Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-loan>
            <tr>
                <td>{{ loan.folio }}</td>
                <td>{{ loan.usuario_nombre }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full text-sm font-medium"
                          [ngClass]="{
                              'bg-green-100 text-green-800': loan.estado === 'aprobada',
                              'bg-yellow-100 text-yellow-800': loan.estado === 'pendiente',
                              'bg-red-100 text-red-800': loan.estado === 'rechazada',
                              'bg-blue-100 text-blue-800': loan.estado === 'terminada'
                          }">
                        {{ loan.estado | titlecase }}
                    </span>
                </td>
                <td>{{ loan.fecha_solicitud ? (loan.fecha_solicitud | date:'dd/MM/yy') : '-' }}</td>
                <td>{{ loan.fecha_aprobacion ? (loan.fecha_aprobacion | date:'dd/MM/yy') : '-' }}</td>
                <td>{{ loan.fecha_devolucion_estimada ? (loan.fecha_devolucion_estimada | date:'dd/MM/yy') : '-' }}</td>
                <td>{{ loan.fecha_devolucion_real ? (loan.fecha_devolucion_real | date:'dd/MM/yy') : '-' }}</td>
                <td>{{ loan.tiempo_solicitado }} días</td>
                <td>{{ loan.tiempo_aprobado ? loan.tiempo_aprobado + ' días' : '-' }}</td>
                <td>
                    <p-button
                        icon="pi pi-eye"
                        styleClass="p-button-text p-button-sm"
                        (click)="viewDetails(loan)"
                        pTooltip="Ver detalles"
                        tooltipPosition="top">
                    </p-button>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="10" class="text-center py-8">
                    <div class="flex flex-col items-center gap-2">
                        <i class="pi pi-inbox text-4xl text-gray-400"></i>
                        <span class="text-gray-500">No se encontraron órdenes de préstamo</span>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>

<!-- Modal de Detalles -->
<p-dialog
    [(visible)]="showDetailModal"
    header="Detalles de la Orden de Préstamo"
    [modal]="true"
    [style]="{ width: '50rem' }"
    [draggable]="false"
    [resizable]="false"
    (onHide)="closeDetailModal()"
>
    <div *ngIf="loadingDetails" class="flex justify-center py-8">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div *ngIf="!loadingDetails">
        <p-table
            [value]="selectedLoanDetails"
            [tableStyle]="{ 'min-width': '40rem' }"
            [rowHover]="true"
            class="shadow-sm rounded-lg"
        >
            <ng-template pTemplate="header">
                <tr class="bg-gray-50">
                    <th>Herramienta</th>
                    <th>Cantidad</th>
                    <th>Fecha Registro</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-detail>
                <tr>
                    <td>{{ detail.herramienta_nombre }}</td>
                    <td>{{ detail.cantidad }}</td>
                    <td>{{ detail.created_at ? (detail.created_at | date:'dd/MM/yy HH:mm') : '-' }}</td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="3" class="text-center py-4">
                        <div class="flex flex-col items-center gap-2">
                            <i class="pi pi-tools text-2xl text-gray-400"></i>
                            <span class="text-gray-500">No hay herramientas registradas</span>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>
</p-dialog>
    `,
    providers: [MessageService],
    styles: [
        `/* Estilos para hacer el modal más suave y sin aspecto cuadrado */
        :host ::ng-deep .p-dialog {
            border-radius: 12px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-header {
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
        }`
    ]
})
export class LoansCrudComponent implements OnInit {
    loans: Loan[] = [];
    @ViewChild('dt') dt!: Table;

    showDetailModal = false;
    selectedLoanDetails: LoanDetail[] = [];
    loading = false;
    loadingDetails = false;

    constructor(
        private messageService: MessageService,
        private loansService: LoansService
    ) {}

    ngOnInit() {
        this.loadLoans();
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
