import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { FinesService, Fine } from '../service/fines.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-recent-fines-crud',
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
        DialogModule,
        ConfirmDialogModule,
        InputIconModule,
        IconFieldModule,
        DropdownModule,
        TooltipModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <p-table
        #dt
        [value]="fines"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['prestamo_id', 'usuario_id', 'descripcion', 'estado']"
        [tableStyle]="{ 'min-width': '100%' }"
        [(selection)]="selectedFines"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[5, 10, 15]"
        [scrollable]="true"
        scrollHeight="300px"
        class="shadow-md rounded-lg"
        [loading]="loading"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Multas Recientes</h5>
                <div class="flex gap-2">
                    <p-button
                        icon="pi pi-refresh"
                        (click)="loadFines()"
                        [loading]="loading"
                        styleClass="p-button-outlined p-button-sm"
                        pTooltip="Actualizar lista"
                        tooltipPosition="top">
                    </p-button>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1 w-full sm:w-auto">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] ">
                <th>ID Préstamo</th>
                <th>Usuario ID</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Multa</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-fine>
            <tr>
                <td>{{ fine.prestamo_id }}</td>
                <td>{{ fine.usuario_id }}</td>
                <td style="color: var(--secundary-color);">{{ fine.tipo | titlecase }}</td>
                <td style="color: var(--secundary-color);">{{ fine.descripcion }}</td>
                <td style="color: var(--secundary-color);">{{ fine.monto | currency: 'MXN' }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full"
                          [ngStyle]="{
                            'background': fine.estado === 'pendiente' ? '#fef3c7' :
                                        fine.estado === 'pagada' ? '#d1fae5' : '#fecaca',
                            'color': fine.estado === 'pendiente' ? '#92400e' :
                                   fine.estado === 'pagada' ? '#065f46' : '#991b1b'
                          }">
                        {{ fine.estado | titlecase }}
                    </span>
                </td>
                <td>{{ fine.fecha_multa | date:'dd/MM/yy' }}</td>
                <td>
                    <p-button
                        *ngIf="fine.estado === 'pendiente'"
                        (click)="payFine(fine)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                        pTooltip="Marcar como pagada"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">payments</i>
                        </ng-template>
                    </p-button>
                    <p-button
                        (click)="viewFineDetails(fine)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                        pTooltip="Ver detalles de la multa"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">visibility</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="8" class="text-center py-8">
                    <div class="flex flex-col items-center gap-2">
                        <i class="pi pi-inbox text-4xl text-gray-400"></i>
                        <span class="text-gray-500">No se encontraron multas</span>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>

<!-- Modal de Detalles Mejorado -->
<p-dialog
    [(visible)]="showDetailModal"
    header="Detalles de la Multa"
    [modal]="true"
    [style]="{ width: '50rem' }"
    [draggable]="false"
    [resizable]="false"
    (onHide)="closeDetailModal()"
>
    <div *ngIf="selectedFine" class="space-y-6">
        <!-- Información Principal -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Información Principal</h3>

                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">ID de Multa:</span>
                        <span class="text-gray-900 font-semibold">#{{ selectedFine.id }}</span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">ID de Préstamo:</span>
                        <span class="text-blue-600 font-semibold">#{{ selectedFine.prestamo_id }}</span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">ID de Usuario:</span>
                        <span class="text-gray-900 font-semibold">#{{ selectedFine.usuario_id }}</span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Tipo de Multa:</span>
                        <span class="text-blue-600 font-semibold">{{ selectedFine.tipo | titlecase }}</span>
                    </div>
                </div>
            </div>

            <!-- Información Financiera -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Información Financiera</h3>

                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span class="font-medium text-gray-700">Monto:</span>
                        <span class="text-green-600 font-bold text-lg">{{ selectedFine.monto | currency: 'MXN' }}</span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Estado:</span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium"
                              [ngClass]="{
                                  'bg-yellow-100 text-yellow-800': selectedFine.estado === 'pendiente',
                                  'bg-green-100 text-green-800': selectedFine.estado === 'pagada',
                                  'bg-red-100 text-red-800': selectedFine.estado === 'vencida'
                              }">
                            {{ selectedFine.estado | titlecase }}
                        </span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Creado por:</span>
                        <span class="text-gray-900 font-semibold">Usuario #{{ selectedFine.usuario_creacion }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Descripción -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Descripción</h3>
            <div class="p-4 bg-blue-50 rounded-lg">
                <p class="text-gray-800 leading-relaxed">{{ selectedFine.descripcion }}</p>
            </div>
        </div>

        <!-- Fechas -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Fechas</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">Fecha de Multa</div>
                    <div class="font-semibold text-gray-900">{{ selectedFine.fecha_multa | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>

                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">Fecha de Creación</div>
                    <div class="font-semibold text-gray-900">{{ selectedFine.fecha_creacion | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>

                <div class="p-3 bg-gray-50 rounded-lg" *ngIf="selectedFine.fecha_pago">
                    <div class="text-sm text-gray-600 mb-1">Fecha de Pago</div>
                    <div class="font-semibold text-green-600">{{ selectedFine.fecha_pago | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
            </div>
        </div>
    </div>
</p-dialog>

<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative" style="background: #fff;">
    <button type="button" (click)="onCustomConfirmReject()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="flex flex-col items-start">
      <i class="material-symbols-outlined text-6xl mb-4"
        [ngClass]="{
          'text-yellow-500': confirmIcon === 'warning',
          'text-red-500': confirmIcon === 'error',
          'text-blue-500': confirmIcon === 'info'
        }">
        {{ confirmIcon === 'warning' ? 'warning' : confirmIcon === 'error' ? 'error' : 'info' }}
      </i>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmar Acción</h3>
      <p class="text-gray-600 mb-6" [innerHTML]="confirmMessage"></p>
      <div class="flex gap-3 w-full">
        <button type="button" (click)="onCustomConfirmAccept()" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Confirmar
        </button>
        <button type="button" (click)="onCustomConfirmReject()" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</div>

<p-confirmDialog></p-confirmDialog>
    `,
    providers: [MessageService, ConfirmationService],
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
export class RecentFinesCrudComponent implements OnInit {
    fines: Fine[] = [];
    selectedFines: Fine[] | null = null;
    @ViewChild('dt') dt!: Table;

    showDetailModal = false;
    selectedFine: Fine | null = null;
    loading = false;
    loadingDetails = false;

    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;
    confirmIcon: string = 'warning';

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private finesService: FinesService
    ) {}

    ngOnInit() {
        this.loadFines();
    }

    loadFines() {
        this.loading = true;
        this.finesService.getFines()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (fines) => {
                    this.fines = fines;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Se cargaron ${fines.length} multas`
                    });
                },
                error: (error) => {
                    console.error('Error al cargar multas:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al cargar las multas'
                    });
                }
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    viewFineDetails(fine: Fine) {
        this.selectedFine = fine;
        this.showDetailModal = true;
    }

    closeDetailModal() {
        this.showDetailModal = false;
        this.selectedFine = null;
    }

    payFine(fine: Fine) {
        this.confirmMessage = `¿Estás seguro de que deseas marcar como pagada la multa por un monto de <span class='text-primary'>$${fine.monto.toFixed(2)} MXN</span>?`;
        this.confirmAction = () => {
            this.finesService.payFine(fine.id)
                .subscribe({
                    next: (updatedFine: Fine) => {
                        const index = this.fines.findIndex((f: Fine) => f.id === fine.id);
                        if (index !== -1) {
                            this.fines[index] = updatedFine;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Multa marcada como pagada exitosamente'
                        });
                    },
                    error: (error) => {
                        console.error('Error al pagar multa:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al marcar la multa como pagada'
                        });
                    }
                });
        };
        this.showCustomConfirm = true;
    }

    onCustomConfirmAccept() {
        if (this.confirmAction) {
            this.confirmAction();
        }
        this.showCustomConfirm = false;
    }

    onCustomConfirmReject() {
        this.showCustomConfirm = false;
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.showDetailModal) {
            this.closeDetailModal();
        }
    }
}
