import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
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
import { CalendarModule } from 'primeng/calendar';

import { CardModule } from 'primeng/card';
import { FinesService, Fine, FineCreateRequest, FineUpdateRequest } from '../service/fines.service';
import { PaginationUtils } from '../utils/pagination.utils';
import { finalize } from 'rxjs/operators';

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
        CalendarModule,
        CardModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
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
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Multas Recientes</h5>
                <div class="flex gap-2">
                    <p-button
                        label="Nueva Multa"
                        icon="pi pi-plus"
                        (onClick)="openNew()"
                        pTooltip="Crear nueva multa"
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
            <tr class="bg-[#6ea1cc] text-white">
                <th>ID</th>
                <th>Usuario</th>
                <th>Orden</th>
                <th>Configuración</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha Aplicación</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-fine>
            <tr>
                <td>{{ fine.id }}</td>
                <td>
                    <div class="flex flex-col">
                        <span class="font-semibold text-gray-900">{{ fine.usuario_nombre || 'Usuario #' + fine.usuario_id }}</span>
                        <span class="text-xs text-gray-500">{{ fine.usuario_email || 'Sin email' }}</span>
                    </div>
                </td>
                <td>
                    <div class="flex flex-col">
                        <span class="font-semibold text-blue-600">{{ fine.orden_folio || 'Orden #' + fine.orden_id }}</span>
                        <span class="text-xs text-gray-500">ID: {{ fine.orden_id }}</span>
                    </div>
                </td>
                <td>
                    <div class="flex flex-col">
                        <span class="font-semibold text-gray-900">{{ fine.configuracion_nombre || 'Config #' + fine.configuracion_multa_id }}</span>
                        <span class="text-xs text-gray-500">ID: {{ fine.configuracion_multa_id }}</span>
                    </div>
                </td>
                <td class="font-semibold">{{ fine.monto_total | currency:'MXN' }}</td>
                <td>
                    <span [class]="getEstadoClass(fine.estado)">
                        {{ fine.estado | titlecase }}
                    </span>
                </td>
                <td>{{ fine.fecha_aplicacion | date:'dd/MM/yyyy' }}</td>
                <td>
                    <div class="flex gap-1">
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
                            *ngIf="fine.estado === 'pendiente'"
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
                        <span class="font-medium text-gray-700">Orden:</span>
                        <div class="text-right">
                            <div class="font-semibold text-blue-600">{{ selectedFine.orden_folio || 'Orden #' + selectedFine.orden_id }}</div>
                            <div class="text-sm text-gray-500">ID: {{ selectedFine.orden_id }}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium text-gray-700">Configuración:</span>
                        <div class="text-right">
                            <div class="font-semibold text-gray-900">{{ selectedFine.configuracion_nombre || 'Config #' + selectedFine.configuracion_multa_id }}</div>
                            <div class="text-sm text-gray-500">ID: {{ selectedFine.configuracion_multa_id }}</div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg" *ngIf="selectedFine.dano_id">
                        <span class="font-medium text-gray-700">Daño:</span>
                        <div class="text-right">
                            <div class="font-semibold text-red-600">{{ selectedFine.dano_descripcion || 'Daño #' + selectedFine.dano_id }}</div>
                            <div class="text-sm text-gray-500">ID: {{ selectedFine.dano_id }}</div>
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
                            {{ selectedFine.estado | titlecase }}
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
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true">
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
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Usuario *</label>
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
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true">
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
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Orden préstamo *</label>
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
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true">
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
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Configuración *</label>
            </div>

            <!-- Monto -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-10">payments</span>
                <p-inputnumber
                    formControlName="monto_total"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    [min]="0"
                    [max]="999999.99"
                    placeholder="$0.00 MXN"
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
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [filter]="true">
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
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Estado *</label>
            </div>

            <!-- Fecha Vencimiento -->
            <div class="relative col-span-1">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3.01 3.9 3.01 5L3 19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19ZM7 10H12V15H7V10Z" fill="var(--primary-color)"/>
                </svg>
                <p-calendar
                    formControlName="fecha_vencimiento"
                    [showIcon]="false"
                    dateFormat="dd/mm/yy"
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'">
                </p-calendar>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Fecha Vencimiento *</label>
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
        }`
    ]
})
export class RecentFinesCrudComponent implements OnInit {
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

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private finesService: FinesService,
        public paginationUtils: PaginationUtils,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadFines();
        this.loadFormData();
        this.setupMobileDetection();
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
                console.log('Usuarios cargados:', usuarios.length);
            },
            error: (error) => {
                console.error('Error al cargar usuarios:', error);
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
                console.log('Órdenes cargadas:', ordenes.length);
            },
            error: (error) => {
                console.error('Error al cargar órdenes:', error);
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
                console.log('Configuraciones cargadas:', configuraciones.length);
                if (configuraciones.length === 0) {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Información',
                        detail: 'No hay configuraciones disponibles. Se implementará cuando se cree el CRUD específico.'
                    });
                }
            },
            error: (error) => {
                console.error('Error al cargar configuraciones:', error);
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
        switch (estado) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded';
            case 'pagado':
                return 'bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded';
            case 'exonerada':
                return 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded';
            default:
                return 'bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded';
        }
    }
}
