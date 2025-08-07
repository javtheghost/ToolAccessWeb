import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';

import { CardModule } from 'primeng/card';
import { CustomDatePickerComponent } from '../utils/custom-date-picker.component';
// Servicios
import { FinesService, Fine, FineCreateRequest, FineUpdateRequest } from '../service/fines.service';
import { PaginationUtils } from '../utils/pagination.utils';
import { finalize } from 'rxjs/operators';
import { CommunicationService } from '../service/communication.service';
import { Subject, takeUntil } from 'rxjs';
import { ModalAlertService, ModalAlert } from '../utils/modal-alert.service';
import { ModalAlertComponent } from '../utils/modal-alert.component';

@Component({
    selector: 'app-recent-fines-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
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
        TooltipModule,
        InputNumberModule,
        SkeletonModule,
        CustomDatePickerComponent,
        CardModule,
        ModalAlertComponent
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <div class="card">
        <!-- Skeleton para toda la tabla (headers + datos) -->
        <div *ngIf="loading" class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header skeleton -->
            <div class="bg-[#6ea1cc] text-white p-3">
                <div class="flex items-center space-x-4">
                    <p-skeleton height="1.5rem" width="60px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="140px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="140px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                </div>
            </div>
            <!-- Filas skeleton -->
            <div class="p-4 space-y-3">
                <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <p-skeleton height="1rem" width="60px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="140px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="100px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="140px"></p-skeleton>
                    <p-skeleton height="1rem" width="100px"></p-skeleton>
                    <p-skeleton height="1rem" width="80px"></p-skeleton>
                </div>
            </div>
        </div>

        <!-- Tabla de multas -->
        <div *ngIf="!loading">
            <p-table
                #dt
                [value]="fines"
                [rows]="paginationUtils.getPaginationConfig().defaultRows"
                [paginator]="true"
                [globalFilterFields]="['orden_id', 'usuario_id', 'configuracion_nombre', 'estado']"
                [tableStyle]="{ 'min-width': '100%' }"
                [(selection)]="selectedFines"
                [rowHover]="true"
                dataKey="id"
                [showCurrentPageReport]="false"
                [rowsPerPageOptions]="paginationUtils.getPaginationConfig().options"
                [scrollable]="true"
                scrollHeight="300px"
                class="shadow-md rounded-lg"
                [loading]="loading"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <div>
                            <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Multas</h5>
                            <p class="text-sm text-[var(--primary-color)] mt-1 px-2">
                                Gestiona y da seguimiento a todas las multas aplicadas en el sistema.
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <p-iconfield class="flex-1 w-full sm:w-auto">
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                        </p-iconfield>
                        <div class="flex justify-end w-full sm:w-auto">
                            <p-button label="Nueva Multa" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                        </div>
                    </div>
                </ng-template>
                <ng-template pTemplate="header">
                    <tr class="bg-[#6ea1cc] text-white">
                        <th pSortableColumn="usuario_nombre">
                            <div class="flex justify-content-center align-items-center">
                                Usuario
                                <p-sortIcon field="usuario_nombre"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="orden_folio">
                            <div class="flex justify-content-center align-items-center">
                                Orden Préstamo
                                <p-sortIcon field="orden_folio"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="configuracion_nombre" class="hidden md:table-cell">
                            <div class="flex justify-content-center align-items-center">
                                Configuración
                                <p-sortIcon field="configuracion_nombre"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="monto_total">
                            <div class="flex justify-content-center align-items-center">
                                Monto
                                <p-sortIcon field="monto_total"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="estado">
                            <div class="flex justify-content-center align-items-center">
                                Estado
                                <p-sortIcon field="estado"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="fecha_aplicacion" class="hidden lg:table-cell">
                            <div class="flex justify-content-center align-items-center">
                                Fecha Aplicación
                                <p-sortIcon field="fecha_aplicacion"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="fecha_vencimiento" class="hidden xl:table-cell">
                            <div class="flex justify-content-center align-items-center">
                                Fecha Vencimiento
                                <p-sortIcon field="fecha_vencimiento"></p-sortIcon>
                            </div>
                        </th>
                        <th pSortableColumn="fecha_pago" class="hidden xl:table-cell">
                            <div class="flex justify-content-center align-items-center">
                                Fecha Pago
                                <p-sortIcon field="fecha_pago"></p-sortIcon>
                            </div>
                        </th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-fine>
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td>
                            <div class="flex flex-col">
                                <span class="font-semibold text-gray-900 text-sm sm:text-base">{{ fine.usuario_nombre || 'Usuario #' + fine.usuario_id }}</span>
                                <span class="text-xs text-gray-500 hidden sm:block">{{ fine.usuario_email || 'Sin email' }}</span>
                            </div>
                        </td>
                        <td>
                            <div class="flex flex-col">
                                <span class="font-semibold text-blue-600 text-sm sm:text-base">{{ fine.orden_folio || 'Orden #' + fine.orden_id }}</span>
                            </div>
                        </td>
                        <td class="hidden md:table-cell">
                            <div class="flex flex-col">
                                <span class="font-semibold text-gray-900">{{ fine.configuracion_nombre || 'Config #' + fine.configuracion_multa_id }}</span>
                            </div>
                        </td>
                        <td class="text-sm sm:text-base">
                            <span class="badge badge-success font-semibold">{{ fine.monto_total | currency:'MXN' }}</span>
                        </td>
                        <td>
                            <span [class]="getEstadoClass(getEstadoDisplay(fine).toLowerCase())" class="text-xs sm:text-sm">
                                {{ getEstadoDisplay(fine) }}
                            </span>
                        </td>
                        <td class="hidden lg:table-cell text-sm">
                            <div class="flex flex-col">
                                <span class="badge badge-primary font-medium">{{ fine.fecha_aplicacion | date:'dd/MM/yyyy' }}</span>
                                <span class="badge badge-info text-xs mt-1">{{ fine.fecha_aplicacion | date:'hh:mm a' }}</span>
                            </div>
                        </td>
                        <td class="hidden xl:table-cell text-sm">
                            <span [class]="getFechaVencimientoBadgeClass(fine.fecha_vencimiento)" class="badge">
                                {{ fine.fecha_vencimiento | date:'dd/MM/yyyy' }}
                            </span>
                        </td>
                        <td class="hidden xl:table-cell text-sm">
                            <span *ngIf="fine.fecha_pago; else noPago" class="badge badge-success font-medium">
                                {{ fine.fecha_pago | date:'dd/MM/yyyy' }}
                            </span>
                            <ng-template #noPago>
                                <span class="badge badge-secondary italic">Sin pago</span>
                            </ng-template>
                        </td>
                        <td>
                            <div class="flex flex-wrap gap-1 justify-center sm:justify-start">
                                <p-button
                                    (onClick)="viewFineDetails(fine)"
                                    styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                                    pTooltip="Ver detalles"
                                    tooltipPosition="top">
                                    <ng-template pTemplate="icon">
                                        <i class="material-symbols-outlined">visibility</i>
                                    </ng-template>
                                </p-button>
                                <p-button
                                    (onClick)="editFine(fine)"
                                    styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                                    pTooltip="Editar"
                                    tooltipPosition="top">
                                    <ng-template pTemplate="icon">
                                        <i class="material-symbols-outlined">edit</i>
                                    </ng-template>
                                </p-button>
                                <p-button
                                    *ngIf="fine.estado?.toLowerCase() === 'pendiente'"
                                    (onClick)="payFine(fine)"
                                    styleClass="custom-flat-icon-button custom-flat-icon-button-pay mr-2"
                                    pTooltip="Marcar como pagada"
                                    tooltipPosition="top">
                                    <ng-template pTemplate="icon">
                                        <i class="material-symbols-outlined">payments</i>
                                    </ng-template>
                                </p-button>
                                <p-button
                                    (onClick)="deleteFine(fine)"
                                    styleClass="custom-flat-icon-button custom-flat-icon-button-delete"
                                    pTooltip="Eliminar"
                                    tooltipPosition="top">
                                    <ng-template pTemplate="icon">
                                        <i class="material-symbols-outlined">delete</i>
                                    </ng-template>
                                </p-button>
                            </div>
                        </td>
                    </tr>
                </ng-template>
                        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="9" class="text-center py-8">
                    <div class="flex flex-col items-center gap-2">
                        <i class="pi pi-database text-4xl text-[var(--primary-color)]"></i>
                        <h6 class="text-[var(--primary-color)] font-medium">No hay multas registradas</h6>
                        <p class="text-gray-500 text-sm">Cuando se registren multas, aparecerán aquí.</p>
                    </div>
                </td>
            </tr>
        </ng-template>
            </p-table>
        </div>
    </div>
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
    <div *ngIf="selectedFine" class="space-y-6" style="font-family: Arial, sans-serif;">
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
                        <span class="font-medium text-gray-700">Usuario:</span>
                        <div class="text-right">
                            <div class="font-semibold text-gray-900">{{ selectedFine.usuario_nombre || 'Usuario #' + selectedFine.usuario_id }}</div>
                            <div class="text-sm text-gray-500">{{ selectedFine.usuario_email || 'Sin email' }}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Orden Préstamo:</span>
                        <div class="text-right">
                            <div class="font-semibold text-blue-600">{{ selectedFine.orden_folio || 'Orden #' + selectedFine.orden_id }}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Configuración:</span>
                        <div class="text-right">
                            <div class="font-semibold text-gray-900">{{ selectedFine.configuracion_nombre || 'Config #' + selectedFine.configuracion_multa_id }}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg" *ngIf="selectedFine.dano_id">
                        <span class="font-medium text-gray-700">Daño:</span>
                        <div class="text-right">
                            <div class="font-semibold text-red-600">{{ selectedFine.dano_descripcion || 'Daño #' + selectedFine.dano_id }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Información Financiera -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Información Financiera</h3>

                <div class="space-y-3">
                    <div class="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span class="font-medium text-gray-700">Monto:</span>
                        <span class="text-green-600 font-bold text-lg">{{ selectedFine.monto_total | currency: 'MXN' }}</span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Estado:</span>
                        <span [class]="getEstadoClass(selectedFine.estado)">
                            {{ selectedFine.estado.toLowerCase() | titlecase }}
                        </span>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Fecha Vencimiento:</span>
                        <span class="text-gray-900 font-semibold">{{ selectedFine.fecha_vencimiento | date:'dd/MM/yyyy' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Comentarios -->
        <div class="space-y-4" *ngIf="selectedFine.comentarios">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Comentarios</h3>
            <div class="p-4 bg-blue-50 rounded-lg">
                <p class="text-gray-800 leading-relaxed">{{ selectedFine.comentarios }}</p>
            </div>
        </div>

        <!-- Fechas -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Fechas</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">Fecha de Aplicación</div>
                    <div class="font-semibold text-gray-900">{{ selectedFine.fecha_aplicacion | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>

                <div class="p-3 bg-gray-50 rounded-lg">
                    <div class="text-sm text-gray-600 mb-1">Fecha de Vencimiento</div>
                    <div class="font-semibold text-gray-900">{{ selectedFine.fecha_vencimiento | date:'dd/MM/yyyy' }}</div>
                </div>

                <div class="p-3 bg-gray-50 rounded-lg" *ngIf="selectedFine.fecha_pago">
                    <div class="text-sm text-gray-600 mb-1">Fecha de Pago</div>
                    <div class="font-semibold text-green-600">{{ selectedFine.fecha_pago | date:'dd/MM/yyyy HH:mm' }}</div>
                </div>
            </div>
        </div>
    </div>
</p-dialog>

<p-confirmDialog></p-confirmDialog>

<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative" style="font-family: Arial, sans-serif;">
    <!-- Tachita de cerrar -->
    <button type="button" (click)="onCustomConfirmReject()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="flex flex-col items-start">
      <i class="material-symbols-outlined text-6xl mb-4"
        [ngClass]="{
          'text-danger': confirmIcon === 'delete',
          'text-warning': confirmIcon === 'warning',
          'text-green-500': confirmIcon === 'pay'
        }"
      >{{ confirmIcon === 'pay' ? 'payments' : confirmIcon }}</i>
      <div class="text-left mb-6">
        <div [innerHTML]="confirmMessage"></div>
      </div>
      <div class="flex gap-4 self-end">
        <button type="button"
          class="custom-cancel-btn px-4 py-2 font-semibold w-24 text-center"
          (click)="onCustomConfirmReject()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : confirmIcon === 'pay' ? 'custom-confirm-accept-success' : 'custom-confirm-accept-warning'"
          class="px-4 py-2 rounded font-semibold w-24 text-center"
          (click)="onCustomConfirmAccept()"
        >Aceptar</button>
      </div>
    </div>
  </div>
</div>

<!-- Dialog para crear/editar multa -->
<p-dialog
    [(visible)]="fineDialog"
    [style]="{ width: '95vw', maxWidth: '600px' }"
    [modal]="true"
    [draggable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Multa' : 'Nueva Multa' }}
    </span>
  </ng-template>
  <ng-template pTemplate="content">
    <!-- Alerta Modal -->
    <app-modal-alert
        [alert]="modalAlert"
        (close)="hideModalAlert()">
    </app-modal-alert>

    <form [formGroup]="fineForm" (ngSubmit)="saveFine()" style="font-family: Arial, sans-serif;">
        <div class="grid grid-cols-1 gap-4 p-5">

            <!-- Usuario -->
            <div class="relative col-span-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    formControlName="usuario_id"
                    [options]="usuarios"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Selecciona una opción"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true"
                    filterPlaceholder="Buscar usuarios...">
                    <ng-template pTemplate="selectedItem" let-usuario>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                            </svg>
                            <span>{{ usuario.nombre }}</span>
                            <span class="text-gray-500 ml-2">({{ usuario.email }})</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-usuario>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                            </svg>
                            <div class="flex flex-col">
                                <span class="font-medium">{{ usuario.nombre }}</span>
                                <span class="text-sm text-gray-500">{{ usuario.email }}</span>
                            </div>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron usuarios</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Usuario <span class="text-red-500">*</span></label>
            </div>

            <!-- Orden préstamo -->
            <div class="relative col-span-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9.18C9.6 1.84 10.7 1 12 1C13.3 1 14.4 1.84 14.82 3H19ZM12 3C11.7348 3 11.4804 3.10536 11.2929 3.29289C11.1054 3.48043 11 3.73478 11 4C11 4.26522 11.1054 4.51957 11.2929 4.70711C11.4804 4.89464 11.7348 5 12 5C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM7 7V5H5V19H19V5H17V7H7ZM12 9C12.5304 9 13.0391 9.21071 13.4142 9.58579C13.7893 9.96086 14 10.4696 14 11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11C10 10.4696 10.2107 9.96086 10.5858 9.58579C10.9609 9.21071 11.4696 9 12 9ZM8 17V16C8 14.9 9.79 14 12 14C14.21 14 16 14.9 16 16V17H8Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    formControlName="orden_id"
                    [options]="ordenes"
                    optionLabel="folio"
                    optionValue="id"
                    placeholder="Selecciona una opción"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true"
                    filterPlaceholder="Buscar órdenes...">
                    <ng-template pTemplate="selectedItem" let-orden>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9.18C9.6 1.84 10.7 1 12 1C13.3 1 14.4 1.84 14.82 3H19ZM12 3C11.7348 3 11.4804 3.10536 11.2929 3.29289C11.1054 3.48043 11 3.73478 11 4C11 4.26522 11.1054 4.51957 11.2929 4.70711C11.4804 4.89464 11.7348 5 12 5C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM7 7V5H5V19H19V5H17V7H7ZM12 9C12.5304 9 13.0391 9.21071 13.4142 9.58579C13.7893 9.96086 14 10.4696 14 11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11C10 10.4696 10.2107 9.96086 10.5858 9.58579C10.9609 9.21071 11.4696 9 12 9ZM8 17V16C8 14.9 9.79 14 12 14C14.21 14 16 14.9 16 16V17H8Z" fill="currentColor"/>
                            </svg>
                            <span>{{ orden.folio }}</span>
                            <span class="text-gray-500 ml-2">({{ orden.usuario_nombre }})</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-orden>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9.18C9.6 1.84 10.7 1 12 1C13.3 1 14.4 1.84 14.82 3H19ZM12 3C11.7348 3 11.4804 3.10536 11.2929 3.29289C11.1054 3.48043 11 3.73478 11 4C11 4.26522 11.1054 4.51957 11.2929 4.70711C11.4804 4.89464 11.7348 5 12 5C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM7 7V5H5V19H19V5H17V7H7ZM12 9C12.5304 9 13.0391 9.21071 13.4142 9.58579C13.7893 9.96086 14 10.4696 14 11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11C10 10.4696 10.2107 9.96086 10.5858 9.58579C10.9609 9.21071 11.4696 9 12 9ZM8 17V16C8 14.9 9.79 14 12 14C14.21 14 16 14.9 16 16V17H8Z" fill="currentColor"/>
                            </svg>
                            <div class="flex flex-col">
                                <span class="font-medium">{{ orden.folio }}</span>
                                <span class="text-sm text-gray-500">{{ orden.usuario_nombre }}</span>
                            </div>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron órdenes</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Orden préstamo <span class="text-red-500">*</span></label>
            </div>

            <!-- Configuración -->
            <div class="relative col-span-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 6.03 15.35 5.84 14.79 5.71L14.23 3.26C14.18 3.03 13.96 2.88 13.72 2.88H10.28C10.04 2.88 9.82 3.03 9.77 3.26L9.21 5.71C8.65 5.84 8.12 6.03 7.62 6.29L5.23 5.33C5.01 5.26 4.76 5.33 4.64 5.55L2.72 8.87C2.61 9.07 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 17.97 8.65 18.16 9.21 18.29L9.77 20.74C9.82 20.97 10.04 21.12 10.28 21.12H13.72C13.96 21.12 14.18 20.97 14.23 20.74L14.79 18.29C15.35 18.16 15.88 17.97 16.38 17.71L18.77 18.67C18.99 18.74 19.24 18.67 19.36 18.45L21.28 15.13C21.39 14.93 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    formControlName="configuracion_multa_id"
                    [options]="configuraciones"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Selecciona una opción"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true"
                    filterPlaceholder="Buscar configuraciones...">
                    <ng-template pTemplate="selectedItem" let-config>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 6.03 15.35 5.84 14.79 5.71L14.23 3.26C14.18 3.03 13.96 2.88 13.72 2.88H10.28C10.04 2.88 9.82 3.03 9.77 3.26L9.21 5.71C8.65 5.84 8.12 6.03 7.62 6.29L5.23 5.33C5.01 5.26 4.76 5.33 4.64 5.55L2.72 8.87C2.61 9.07 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 17.97 8.65 18.16 9.21 18.29L9.77 20.74C9.82 20.97 10.04 21.12 10.28 21.12H13.72C13.96 21.12 14.18 20.97 14.23 20.74L14.79 18.29C15.35 18.16 15.88 17.97 16.38 17.71L18.77 18.67C18.99 18.74 19.24 18.67 19.36 18.45L21.28 15.13C21.39 14.93 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
                            </svg>
                            <span>{{ config.nombre }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-config>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.67 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 6.03 15.35 5.84 14.79 5.71L14.23 3.26C14.18 3.03 13.96 2.88 13.72 2.88H10.28C10.04 2.88 9.82 3.03 9.77 3.26L9.21 5.71C8.65 5.84 8.12 6.03 7.62 6.29L5.23 5.33C5.01 5.26 4.76 5.33 4.64 5.55L2.72 8.87C2.61 9.07 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.36 4.8 11.67 4.8 12C4.8 12.33 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 17.97 8.65 18.16 9.21 18.29L9.77 20.74C9.82 20.97 10.04 21.12 10.28 21.12H13.72C13.96 21.12 14.18 20.97 14.23 20.74L14.79 18.29C15.35 18.16 15.88 17.97 16.38 17.71L18.77 18.67C18.99 18.74 19.24 18.67 19.36 18.45L21.28 15.13C21.39 14.93 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
                            </svg>
                            <span>{{ config.nombre }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron configuraciones</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Configuración <span class="text-red-500">*</span></label>
            </div>

            <!-- Monto -->
            <div class="relative col-span-1">
            <label for="monto_total" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Monto total  <span class="text-red-500">*</span></label>

                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-10">payments</span>
                <p-inputnumber
                    formControlName="monto_total"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    [min]="0"
                    [max]="999999.99"
                    placeholder=" $0.00 MXN"
                    class="w-full"
                    [showButtons]="false"
                    [useGrouping]="true"
                    [locale]="'es-MX'"
                    styleClass="custom-inputnumber">
                </p-inputnumber>
            </div>

            <!-- Estado -->
            <div class="relative col-span-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.4 6L14 4H5V21H7V14H12.6L13 16H20V6H14.4Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    formControlName="estado"
                    [options]="estados"
                    placeholder="Selecciona una opción"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true"
                    filterPlaceholder="Buscar estados...">
                    <ng-template pTemplate="selectedItem" let-estado>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.4 6L14 4H5V21H7V14H12.6L13 16H20V6H14.4Z" fill="currentColor"/>
                            </svg>
                            <span>{{ estado.label }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-estado>
                        <div class="flex items-center justify-start h-full w-full">
                            <svg class="w-5 h-5 text-gray-500 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.4 6L14 4H5V21H7V14H12.6L13 16H20V6H14.4Z" fill="currentColor"/>
                            </svg>
                            <span>{{ estado.label }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron estados</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Estado <span class="text-red-500">*</span></label>
            </div>

            <!-- Fecha Vencimiento -->
            <div class="relative col-span-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Vencimiento <span class="text-red-500">*</span></label>
                <app-custom-date-picker
                    formControlName="fecha_vencimiento"
                    placeholder="Seleccionar fecha de vencimiento">
                </app-custom-date-picker>
            </div>

            <!-- Comentarios -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_note</span>
                <textarea
                    id="comentarios"
                    formControlName="comentarios"
                    rows="3"
                    class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Comentarios"></textarea>
                <label for="comentarios" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Comentarios...</label>
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="submit" class="p-button w-full sm:w-24" [disabled]="fineForm.invalid">Guardar</button>
        </div>
    </form>
  </ng-template>
</p-dialog>


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
        }

        /* Estilos personalizados para p-inputnumber */
        :host ::ng-deep .custom-inputnumber {
            width: 100% !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext {
            height: 48px !important;
            padding-left: 40px !important;
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
            font-size: 14px !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext:focus {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        /* Estilos para el componente de fecha personalizado */
        :host ::ng-deep app-custom-date-picker {
            width: 100% !important;
        }

        :host ::ng-deep app-custom-date-picker .date-input-container {
            height: 48px !important;
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
        }

        :host ::ng-deep app-custom-date-picker .date-input-container:focus-within {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep app-custom-date-picker .date-input {
            height: 48px !important;
            font-size: 14px !important;
        }

        /* Estilos responsive para la tabla */
        :host ::ng-deep .p-table {
            font-size: 0.875rem !important;
        }

        @media (max-width: 640px) {
            :host ::ng-deep .p-table {
                font-size: 0.75rem !important;
            }
        }

        /* Mejorar la responsividad de los botones de acción */
        :host ::ng-deep .custom-flat-icon-button {
            min-width: 40px !important;
            height: 40px !important;
            padding: 0 !important;
        }

        @media (max-width: 640px) {
            :host ::ng-deep .custom-flat-icon-button {
                min-width: 36px !important;
                height: 36px !important;
            }
        }

        /* Asegurar que la tabla sea scrollable en móviles */
        :host ::ng-deep .p-table-wrapper {
            overflow-x: auto !important;
        }

        /* Mejorar el espaciado en móviles */
        @media (max-width: 640px) {
            :host ::ng-deep .p-table .p-table-thead > tr > th,
            :host ::ng-deep .p-table .p-table-tbody > tr > td {
                padding: 0.5rem 0.25rem !important;
            }
        }

        /* Estilos para badges de fechas */
        .badge {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            font-weight: 500;
            line-height: 1;
            text-align: center;
            white-space: nowrap;
            vertical-align: baseline;
            border-radius: 0.375rem;
            transition: all 0.2s ease-in-out;
        }

        .badge-primary {
            background-color: rgba(3, 52, 110, 0.1);
            color: var(--primary-color);
            border: 1px solid rgba(3, 52, 110, 0.2);
        }

        .badge-secondary {
            background-color: rgba(108, 117, 125, 0.1);
            color: #6c757d;
            border: 1px solid rgba(108, 117, 125, 0.2);
        }

        .badge-success {
            background-color: rgba(76, 217, 100, 0.1);
            color: #0d5a0d;
            border: 1px solid rgba(76, 217, 100, 0.2);
        }

        .badge-danger {
            background-color: rgba(244, 67, 54, 0.1);
            color: var(--color-danger);
            border: 1px solid rgba(244, 67, 54, 0.2);
        }

        .badge-warning {
            background-color: rgba(255, 193, 7, 0.1);
            color: #b8860b;
            border: 1px solid rgba(255, 193, 7, 0.2);
        }

        .badge-info {
            background-color: rgba(110, 172, 218, 0.1);
            color: var(--secundary-color);
            border: 1px solid rgba(110, 172, 218, 0.2);
        }`
    ]
})
export class RecentFinesCrudComponent implements OnInit, OnDestroy {
    fines: Fine[] = [];
    selectedFines: Fine[] | null = null;
    @ViewChild('dt') dt!: Table;

    // Detección de dispositivo móvil
    isMobile = false;

    showDetailModal = false;
    selectedFine: Fine | null = null;
    loading = false;
    loadingDetails = false;

    // Propiedades para diálogo de confirmación personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;
    confirmIcon: string = 'warning';

    // Nuevas propiedades para CRUD completo
    fineDialog: boolean = false;
    isEditMode: boolean = false;
    saving: boolean = false;
    fineForm!: FormGroup;

    // Datos para formularios
    usuarios: any[] = [];
    ordenes: any[] = [];
    configuraciones: any[] = [];
    estados = [
        { label: 'Pendiente', value: 'pendiente' },
        { label: 'Pagado', value: 'pagado' },
        { label: 'Exonerada', value: 'exonerada' }
    ];

    private destroy$ = new Subject<void>();
    modalAlert: ModalAlert = { show: false, type: 'error', title: '', message: '' };

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private finesService: FinesService,
        public paginationUtils: PaginationUtils,
        private communicationService: CommunicationService,
        private fb: FormBuilder,
        private modalAlertService: ModalAlertService
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadFines();
        this.loadFormData();
        this.setupMobileDetection();
        this.setupCommunicationListeners();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
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

    private setupCommunicationListeners() {
        // Escuchar actualizaciones de multas
        this.communicationService.finesUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                if (event) {
                    // Recargar multas cuando se actualicen
                    this.loadFines();
                }
            });

        // Escuchar actualizaciones de tipos de daño para actualizar los selects
        this.communicationService.damageTypesUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                if (event) {
                    // Recargar configuraciones cuando cambien los tipos de daño
                    // ya que las configuraciones pueden depender de los tipos de daño
                    this.loadFormData();

                    // Mostrar mensaje de actualización
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Datos actualizados',
                        detail: 'Los datos del formulario se han actualizado automáticamente',
                        life: 2000
                    });
                }
            });

        // Escuchar actualizaciones de configuraciones de multas para actualizar los selects
        this.communicationService.finesConfigUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                if (event) {
                    // Recargar configuraciones en los selects
                    this.loadFormData();

                    // Mostrar mensaje de actualización
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Datos actualizados',
                        detail: 'Las configuraciones de multas se han actualizado automáticamente',
                        life: 2000
                    });
                }
            });
    }

    private setupMobileDetection() {
        // Suscribirse a los cambios de detección móvil
        this.paginationUtils.isMobile$.subscribe((isMobile: boolean) => {
            this.isMobile = isMobile;
        });
    }

    loadFines() {
        this.loading = true;
        this.finesService.getFines()
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (fines) => {
                    this.fines = fines;
                    if (fines.length > 0) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Se cargaron ${fines.length} multas`
                        });
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Información',
                            detail: 'No se encontraron multas. Esto puede ser normal si no hay multas registradas.'
                        });
                    }
                },
                error: (error) => {
                    console.error('Error al cargar multas:', error);
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Advertencia',
                        detail: 'No se pudieron cargar las multas. Verificando conexión con el servidor...'
                    });
                    // Establecer array vacío para evitar errores en el template
                    this.fines = [];
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
        // Convertir monto_total a número si es string
        const monto = typeof fine.monto_total === 'string' ? parseFloat(fine.monto_total) : fine.monto_total;
        const montoFormateado = isNaN(monto) ? '0.00' : monto.toFixed(2);

        this.confirmIcon = 'pay';
        this.confirmMessage = `¿Estás seguro de que deseas marcar como pagada la multa por un monto de <span class='text-primary'>$${montoFormateado} MXN</span>?`;
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

    // Métodos para el modal personalizado
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

    // Métodos para CRUD completo
    private initForm() {
        this.fineForm = this.fb.group({
            usuario_id: ['', Validators.required],
            orden_id: ['', Validators.required],
            configuracion_multa_id: ['', Validators.required],
            monto_total: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
            estado: ['pendiente', Validators.required],
            fecha_vencimiento: ['', Validators.required],
            comentarios: ['']
        });
    }

    private loadFormData() {
        // Cargar usuarios
        this.finesService.getUsuarios().subscribe({
            next: (usuarios) => {
                this.usuarios = usuarios;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los usuarios. Usando ruta: /api/multas/usuarios'
                });
            }
        });

        // Cargar órdenes
        this.finesService.getOrdenes().subscribe({
            next: (ordenes) => {
                this.ordenes = ordenes;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las órdenes. Usando ruta: /api/loan-orders'
                });
            }
        });

        // Cargar configuraciones (temporalmente vacío)
        this.finesService.getConfiguraciones().subscribe({
            next: (configuraciones) => {
                this.configuraciones = configuraciones;
                if (configuraciones.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Información',
                        detail: 'No hay configuraciones disponibles. Se implementará cuando se cree el CRUD específico.'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Información',
                    detail: 'Configuraciones no disponibles temporalmente.'
                });
            }
        });
    }

    openNew() {
        this.isEditMode = false;
        this.selectedFine = null;
        this.fineForm.reset();
        this.fineForm.patchValue({
            estado: 'pendiente',
            fecha_vencimiento: new Date()
        });
        this.fineDialog = true;
    }

    editFine(fine: Fine) {
        this.isEditMode = true;
        this.selectedFine = fine;
        this.fineForm.patchValue({
            usuario_id: fine.usuario_id,
            orden_id: fine.orden_id,
            configuracion_multa_id: fine.configuracion_multa_id,
            monto_total: fine.monto_total,
            estado: fine.estado,
            fecha_vencimiento: new Date(fine.fecha_vencimiento),
            comentarios: fine.comentarios || ''
        });
        this.fineDialog = true;
    }

    async saveFine() {
        if (this.fineForm.valid) {
            this.saving = true;
            try {
                const formData = this.fineForm.value;

                if (this.isEditMode && this.selectedFine) {
                    const updateData: FineUpdateRequest = {
                        usuario_id: formData.usuario_id,
                        orden_id: formData.orden_id,
                        configuracion_multa_id: formData.configuracion_multa_id,
                        monto_total: formData.monto_total,
                        estado: formData.estado,
                        fecha_vencimiento: formData.fecha_vencimiento,
                        comentarios: formData.comentarios
                    };

                    await this.finesService.updateFine(this.selectedFine.id, updateData).toPromise();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Multa actualizada exitosamente'
                    });
                } else {
                    const createData: FineCreateRequest = {
                        usuario_id: formData.usuario_id,
                        orden_id: formData.orden_id,
                        configuracion_multa_id: formData.configuracion_multa_id,
                        monto_total: formData.monto_total,
                        comentarios: formData.comentarios,
                        fecha_vencimiento: formData.fecha_vencimiento
                    };

                    await this.finesService.createFine(createData).toPromise();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Multa creada exitosamente'
                    });
                }

                this.hideDialog();
                this.loadFines();

            } catch (error: any) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al guardar la multa'
                });
            } finally {
                this.saving = false;
            }
        }
    }

    deleteFine(fine: Fine) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la multa #${fine.id}? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.finesService.deleteFine(fine.id)
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Multa eliminada exitosamente'
                        });
                        this.loadFines();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al eliminar la multa'
                        });
                    }
                });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.fineDialog = false;
        this.fineForm.reset();
    }

    getEstadoClass(estado: string): string {
        const estadoLower = estado?.toLowerCase();
        switch (estadoLower) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded';
            case 'pagado':
                return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded';
            case 'exonerada':
                return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
            case 'vencida':
                return 'bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded';
            default:
                return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
        }
    }

    getFechaVencimientoClass(fechaVencimiento: string): string {
        if (!fechaVencimiento) return 'text-gray-400';

        const fechaVenc = new Date(fechaVencimiento);
        const hoy = new Date();

        // Si la fecha de vencimiento ya pasó
        if (fechaVenc < hoy) {
            return 'text-red-600 font-semibold';
        }

        // Si vence en los próximos 7 días
        const sieteDias = new Date();
        sieteDias.setDate(hoy.getDate() + 7);
        if (fechaVenc <= sieteDias) {
            return 'text-orange-600 font-medium';
        }

        // Si vence en más de 7 días
        return 'text-green-600';
    }

    getFechaVencimientoBadgeClass(fechaVencimiento: string): string {
        if (!fechaVencimiento) return 'badge-secondary';

        const fechaVenc = new Date(fechaVencimiento);
        const hoy = new Date();

        // Si la fecha de vencimiento ya pasó
        if (fechaVenc < hoy) {
            return 'badge-danger';
        }

        // Si vence en los próximos 7 días
        const sieteDias = new Date();
        sieteDias.setDate(hoy.getDate() + 7);
        if (fechaVenc <= sieteDias) {
            return 'badge-warning';
        }

        // Si vence en más de 7 días
        return 'badge-success';
    }

        isMultaVencida(fine: Fine): boolean {
        if (!fine.fecha_vencimiento || fine.estado?.toLowerCase() === 'pagado') {
            return false;
        }

        const fechaVenc = new Date(fine.fecha_vencimiento);
        const hoy = new Date();

        return fechaVenc < hoy;
    }

    getEstadoDisplay(fine: Fine): string {
        const estado = fine.estado?.toLowerCase();

        // Si está pagado, mostrar "Pagado" sin importar la fecha
        if (estado === 'pagado') {
            return 'Pagado';
        }

        // Si está exonerada, mostrar "Exonerada"
        if (estado === 'exonerada') {
            return 'Exonerada';
        }

        // Si está pendiente y vencida, mostrar "Vencida"
        if (estado === 'pendiente' && this.isMultaVencida(fine)) {
            return 'Vencida';
        }

        // Si está pendiente y no vencida, mostrar "Pendiente"
        if (estado === 'pendiente') {
            return 'Pendiente';
        }

        // Estado por defecto
        return estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : 'Desconocido';
    }
}
