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

interface Loan {
    id: string;
    folio: string;
    usuario: string;
    estado: string;
    fechaSolicitud: Date;
    fechaAprobacion: Date;
    fechaDevolucionEstimada: Date;
    fechaDevolucionReal: Date;
    tiempoSolicitado: number;
    tiempoAprobado: number;
    detalles?: string;
}

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
        [globalFilterFields]="['folio', 'usuario', 'estado']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedLoans"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Préstamos</h5>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
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
                <td>{{ loan.usuario }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full text-sm font-medium"
                          [ngClass]="{
                              'bg-green-100 text-green-800': loan.estado === 'Aprobado',
                              'bg-yellow-100 text-yellow-800': loan.estado === 'Pendiente',
                              'bg-red-100 text-red-800': loan.estado === 'Rechazado',
                              'bg-blue-100 text-blue-800': loan.estado === 'En Proceso'
                          }">
                        {{ loan.estado }}
                    </span>
                </td>
                <td>{{ loan.fechaSolicitud | date:'dd/MM/yy' }}</td>
                <td>{{ loan.fechaAprobacion | date:'dd/MM/yy' }}</td>
                <td>{{ loan.fechaDevolucionEstimada | date:'dd/MM/yy' }}</td>
                <td>{{ loan.fechaDevolucionReal | date:'dd/MM/yy' }}</td>
                <td>{{ loan.tiempoSolicitado }} días</td>
                <td>{{ loan.tiempoAprobado }} días</td>
                <td>
                    <p-button (click)="viewDetails(loan)" styleClass="p-button-text" [style]="{'color': 'var(--primary-color)'}" pTooltip="Ver detalle de préstamo" tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">visibility</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>

<!-- Modal de Detalle de Préstamo -->
<p-dialog [(visible)]="showDetailModal" [modal]="true" [style]="{width: '600px'}" [closable]="true" (onHide)="closeDetailModal()">
    <ng-template pTemplate="header">
        <span class="text-2xl font-bold text-[#1e3a8a]">Detalle de préstamo</span>
    </ng-template>
    <ng-template pTemplate="content">
        <div class="w-full">
            <p-table [value]="selectedLoanDetails" [tableStyle]="{ 'min-width': '100%' }" class="shadow-md rounded-lg">
                <ng-template pTemplate="header">
                    <tr class="bg-[#6ea1cc] text-white">
                        <th>Orden</th>
                        <th>Herramienta</th>
                        <th>Cantidad</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-detalle>
                    <tr>
                        <td>{{ detalle.orden_id }}</td>
                        <td>{{ detalle.herramienta }}</td>
                        <td>{{ detalle.cantidad }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </ng-template>
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
    selectedLoans: Loan[] | null = null;
    @ViewChild('dt') dt!: Table;

    showDetailModal = false;
    selectedLoanDetails: any[] = [];

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.loans = [
            {
                id: '1',
                folio: '23123',
                usuario: 'Samantha',
                estado: 'Aprobado',
                fechaSolicitud: new Date('2025-03-06'),
                fechaAprobacion: new Date('2025-03-08'),
                fechaDevolucionEstimada: new Date('2025-03-30'),
                fechaDevolucionReal: new Date('2025-03-30'),
                tiempoSolicitado: 5,
                tiempoAprobado: 20,
                detalles: 'Préstamo de herramientas para proyecto de construcción'
            },
            {
                id: '2',
                folio: '23124',
                usuario: 'Carlos',
                estado: 'Pendiente',
                fechaSolicitud: new Date('2025-03-10'),
                fechaAprobacion: new Date('2025-03-10'),
                fechaDevolucionEstimada: new Date('2025-03-25'),
                fechaDevolucionReal: new Date('2025-03-25'),
                tiempoSolicitado: 3,
                tiempoAprobado: 0,
                detalles: 'Solicitud de herramientas eléctricas'
            },
            {
                id: '3',
                folio: '23125',
                usuario: 'María',
                estado: 'En Proceso',
                fechaSolicitud: new Date('2025-03-05'),
                fechaAprobacion: new Date('2025-03-07'),
                fechaDevolucionEstimada: new Date('2025-03-20'),
                fechaDevolucionReal: new Date('2025-03-20'),
                tiempoSolicitado: 7,
                tiempoAprobado: 15,
                detalles: 'Herramientas para mantenimiento'
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    viewDetails(loan: Loan) {
        // Simulación de detalles de préstamo (esto normalmente vendría de la base de datos)
        this.selectedLoanDetails = [
            {
                orden_id: loan.folio,
                herramienta: 'Taladro',
                cantidad: 13
            },
            // Puedes agregar más detalles simulados aquí si lo deseas
        ];
        this.showDetailModal = true;
    }

    closeDetailModal() {
        this.showDetailModal = false;
        this.selectedLoanDetails = [];
    }
}
