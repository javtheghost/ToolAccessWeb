import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DamagesService, Damage, DamageCreateRequest, DamageUpdateRequest } from '../service/damages.service';
import { ToolsService, Tool } from '../service/tools.service';
import { LoansService, Loan } from '../service/loans.service';
import { CategoryService } from '../service/category.service';
import { SubcategoryService } from '../service/subcategory.service';
import { DamageTypesService, DamageType } from '../service/damage-types.service';
import { OAuthService } from '../service/oauth.service';
import { CommunicationService } from '../service/communication.service';
import { Subject, takeUntil } from 'rxjs';

interface DamageHistory {
    id: string;
    tool: string;
    order: string;
    damageType: string;
    description: string;
    repairCost: number;
    status: 'Pendiente' | 'Reparado';
    category: string;
    subcategory: string;
    fineType: string;
}

@Component({
    selector: 'app-history-damages-crud',
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
        InputNumberModule,
        DialogModule,
        ConfirmDialogModule,
        InputIconModule,
        IconFieldModule,
        DropdownModule,
        TooltipModule,
        SkeletonModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <!-- Skeleton para toda la tabla (headers + datos) -->
    <div *ngIf="loading" class="bg-white rounded-lg shadow-md overflow-hidden">
        <!-- Header skeleton -->
        <div class="bg-[#6ea1cc] text-white p-3">
            <div class="flex items-center space-x-4">
                <p-skeleton height="1.5rem" width="60px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="140px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="200px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
            </div>
        </div>
        <!-- Filas skeleton -->
        <div class="p-4 space-y-3">
            <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                <p-skeleton height="1rem" width="60px"></p-skeleton>
                <p-skeleton height="1rem" width="120px"></p-skeleton>
                <p-skeleton height="1rem" width="100px"></p-skeleton>
                <p-skeleton height="1rem" width="140px"></p-skeleton>
                <p-skeleton height="1rem" width="200px"></p-skeleton>
                <p-skeleton height="1rem" width="120px"></p-skeleton>
                <p-skeleton height="1rem" width="100px"></p-skeleton>
                <p-skeleton height="1rem" width="120px"></p-skeleton>
                <p-skeleton height="1rem" width="120px"></p-skeleton>
                <p-skeleton height="1rem" width="100px"></p-skeleton>
                <p-skeleton height="1rem" width="80px"></p-skeleton>
            </div>
        </div>
    </div>

    <!-- Content when loaded -->
    <div *ngIf="!loading">
        <p-table
            #dt
            [value]="damageHistory"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['id', 'tool', 'order', 'damageType', 'description']"
            [tableStyle]="{ 'min-width': '100%' }"
            [(selection)]="selectedDamageHistory"
            [rowHover]="true"
            dataKey="id"
            [showCurrentPageReport]="false"
            [rowsPerPageOptions]="[5, 10, 15]"
            [scrollable]="true"
            scrollHeight="300px"
            class="shadow-md rounded-lg"
        >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <div>
                    <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Registro de Daños a Herramientas</h5>
                    <p class="text-sm text-[var(--primary-color)] mt-1 px-2">
                        Gestiona y da seguimiento a todos los reportes de daños ocurridos en las herramientas del sistema.
                    </p>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1 w-full sm:w-auto">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end w-full sm:w-auto">
                    <p-button label="Reportar Daño" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th pSortableColumn="id">
                    <div class="flex justify-content-center align-items-center">
                        ID
                        <p-sortIcon field="id"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="herramienta_id">
                    <div class="flex justify-content-center align-items-center">
                        Herramienta
                        <p-sortIcon field="herramienta_id"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="orden_prestamo_id">
                    <div class="flex justify-content-center align-items-center">
                        Orden
                        <p-sortIcon field="orden_prestamo_id"></p-sortIcon>
                    </div>
                </th>
                <!-- COMENTADO TEMPORALMENTE - Tipo de daño
                <th pSortableColumn="tipo_dano_id">
                    <div class="flex justify-content-center align-items-center">
                        Tipo Daño
                        <p-sortIcon field="tipo_dano_id"></p-sortIcon>
                    </div>
                </th>
                -->
                <th>Descripción</th>
                <th pSortableColumn="costo_reparacion">
                    <div class="flex justify-content-center align-items-center">
                        Costo Rep.
                        <p-sortIcon field="costo_reparacion"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="status">
                    <div class="flex justify-content-center align-items-center">
                        Estado
                        <p-sortIcon field="status"></p-sortIcon>
                    </div>
                </th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-history>
            <tr>
                <td>{{ history.id }}</td>
                <td>{{ getToolName(history.herramienta_id) }}</td>
                <td>{{ getLoanFolio(history.orden_prestamo_id) }}</td>
                <!-- COMENTADO TEMPORALMENTE - Tipo de daño
                <td>{{ getDamageTypeDisplay(history.tipo_dano_id) }}</td>
                -->
                <td>{{ history.descripcion }}</td>
                <td>{{ history.costo_reparacion | currency: 'USD' }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full text-white" [ngStyle]="{ 'background': history.status === 'reportado' ? '#FEE8B9' : '#AAEACA', 'color': '#333' }">
                        {{ getStatusDisplay(history.status) }}
                    </span>
                </td>
                <td>
                    <p-button
                        (click)="editDamageHistory(history)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                        pTooltip="Editar historial de daño"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button
                        (click)="deleteDamageHistory(history)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-delete"
                        pTooltip="Eliminar historial de daño"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="7" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <i class="material-symbols-outlined text-6xl text-gray-300">database</i>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay reportes de daños</h3>
                            <p class="text-gray-500">Aún no se han registrado reportes de daños a herramientas. Utiliza el botón "Reportar Daño" para agregar el primer reporte.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
    </div>
</div>
<p-dialog
  [(visible)]="damageHistoryDialog"
  [style]="{ width: '600px' }"
  [modal]="true"
  [draggable]="false"
  [resizable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      Reportar Daño a Herramienta
    </span>
  </ng-template>
    <ng-template pTemplate="content">
        <div class="grid grid-cols-1 gap-4">
            <!-- Herramienta dañada -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8.33317H17V6.24984C17 5.104 16.1 4.1665 15 4.1665H9C7.9 4.1665 7 5.104 7 6.24984V8.33317H4C2.9 8.33317 2 9.27067 2 10.4165V20.8332H22V10.4165C22 9.27067 21.1 8.33317 20 8.33317ZM9 6.24984H15V8.33317H9V6.24984ZM20 18.7498H4V15.6248H6V16.6665H8V15.6248H16V16.6665H18V15.6248H20V18.7498ZM18 13.5415V12.4998H16V13.5415H8V12.4998H6V13.5415H4V10.4165H20V13.5415H18Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="tools"
                    [(ngModel)]="damageHistoryItem.herramienta_id"
                    optionLabel="nombre"
                    optionValue="id"
                    [filter]="true"
                    filterPlaceholder="Buscar herramientas..."
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    [required]="true"
                    (onShow)="onDropdownOpen($event)"
                    (onHide)="onDropdownClose($event)">
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron herramientas</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Herramienta dañada <span class="text-red-500">*</span></label>
            </div>

            <!-- Préstamo asociado -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9.18C9.6 1.84 10.7 1 12 1C13.3 1 14.4 1.84 14.82 3H19ZM12 3C11.7348 3 11.4804 3.10536 11.2929 3.29289C11.1054 3.48043 11 3.73478 11 4C11 4.26522 11.1054 4.51957 11.2929 4.70711C11.4804 4.89464 11.7348 5 12 5C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM7 7V5H5V19H19V5H17V7H7ZM12 9C12.5304 9 13.0391 9.21071 13.4142 9.58579C13.7893 9.96086 14 10.4696 14 11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11C10 10.4696 10.2107 9.96086 10.5858 9.58579C10.9609 9.21071 11.4696 9 12 9ZM8 17V16C8 14.9 9.79 14 12 14C14.21 14 16 14.9 16 16V17H8Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="loans"
                    [(ngModel)]="damageHistoryItem.orden_prestamo_id"
                    optionLabel="folio"
                    optionValue="id"
                    [filter]="true"
                    filterPlaceholder="Buscar préstamos..."
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    (onShow)="onDropdownOpen($event)"
                    (onHide)="onDropdownClose($event)">
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron préstamos</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Préstamo asociado <span class="text-red-500">*</span></label>
            </div>

            <!-- Categoría -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21H4V10H6V19H18V10H20V21ZM3 3H21V9H3V3ZM9.5 11H14.5C14.78 11 15 11.22 15 11.5V13H9V11.5C9 11.22 9.22 11 9.5 11ZM5 5V7H19V5H5Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="categories"
                    [(ngModel)]="damageHistoryItem.category"
                    optionLabel="nombre"
                    optionValue="id"
                    [filter]="true"
                    filterPlaceholder="Buscar categorías..."
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    (onShow)="onDropdownOpen($event)"
                    (onHide)="onDropdownClose($event)">
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron categorías</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Categoría <span class="text-red-500">*</span></label>
            </div>

            <!-- Subcategorías -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21H4V10H6V19H18V10H20V21ZM3 3H21V9H3V3ZM9.5 11H14.5C14.78 11 15 11.22 15 11.5V13H9V11.5C9 11.22 9.22 11 9.5 11ZM5 5V7H19V5H5Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="subcategories"
                    [(ngModel)]="damageHistoryItem.subcategory"
                    optionLabel="nombre"
                    optionValue="id"
                    [filter]="true"
                    filterPlaceholder="Buscar subcategorías..."
                    placeholder=" "
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false"
                    (onShow)="onDropdownOpen($event)"
                    (onHide)="onDropdownClose($event)">
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron subcategorías</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Subcategoría <span class="text-red-500">*</span></label>
            </div>

            <!-- COMENTADO TEMPORALMENTE - Tipo de Daño
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">warning</span>
                <p-dropdown
                    [options]="damageTypesFromService"
                    [(ngModel)]="damageHistoryItem.tipo_dano_id"
                    optionLabel="nombre"
                    optionValue="id"
                    [filter]="true"
                    filterPlaceholder="Buscar tipos de daño..."
                    placeholder="Tipo de daño..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false">
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron tipos de daño</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <div *ngIf="damageHistoryItem.tipo_dano_id" class="mt-1 text-xs text-gray-500">
                    Tipo de daño seleccionado
                </div>
            </div>
            -->

            <!-- Descripción detallada -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_document</span>
                <textarea id="description" name="description" rows="3" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder="Descripción detallada" [(ngModel)]="damageHistoryItem.descripcion"></textarea>
            </div>

            <!-- Costo de reparación -->
            <div class="relative col-span-1">
            <label for="costo_reparacion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 bg-white px-1">Costo de reparación <span class="text-red-500">*</span></label>

                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-10">payments</span>
                <p-inputnumber
                    [(ngModel)]="damageHistoryItem.costo_reparacion"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    [min]="0"
                    [max]="999999.99"
                    placeholder=" $0.00 MXN"
                    class="w-full"
                    [showButtons]="false"
                    [useGrouping]="true"
                    [locale]="'es-MX'"
                    styleClass="custom-inputnumber"
                    [inputStyle]="{'padding-left': '2.5rem'}">
                </p-inputnumber>
            </div>

            <!-- Tipo de multa - COMENTADO TEMPORALMENTE
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.80031 20.28L12.4003 10.68L11.0003 9.25996L10.2803 9.96996C9.89031 10.36 9.26031 10.36 8.87031 9.96996L8.16031 9.25996C7.77031 8.86996 7.77031 8.23996 8.16031 7.84996L13.8203 2.18996C14.2103 1.79996 14.8403 1.79996 15.2303 2.18996L15.9403 2.89996C16.3303 3.28996 16.3303 3.91996 15.9403 4.30996L15.2303 4.99996L16.6503 6.42996C17.0403 6.03996 17.6703 6.03996 18.0603 6.42996C18.4503 6.81996 18.4503 7.45996 18.0603 7.84996L19.4703 9.25996L20.1803 8.54996C20.5703 8.15996 21.2103 8.15996 21.6003 8.54996L22.3003 9.25996C22.6903 9.64996 22.6903 10.29 22.3003 10.68L16.6503 16.33C16.2603 16.72 15.6203 16.72 15.2303 16.33L14.5303 15.63C14.1303 15.24 14.1303 14.6 14.5303 14.21L15.2303 13.5L13.8203 12.09L4.21031 21.7C3.82031 22.09 3.19031 22.09 2.80031 21.7C2.41031 21.31 2.41031 20.67 2.80031 20.28ZM20.5003 19C21.0307 19 21.5395 19.2107 21.9145 19.5857C22.2896 19.9608 22.5003 20.4695 22.5003 21V22H12.5003V21C12.5003 20.4695 12.711 19.9608 13.0861 19.5857C13.4612 19.2107 13.9699 19 14.5003 19H20.5003Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="fineTypes"
                    [(ngModel)]="damageHistoryItem.fineType"
                    [filter]="true"
                    placeholder="Tipo de multa..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false">
                </p-dropdown>
                <div *ngIf="damageHistoryItem.fineType" class="mt-1 text-xs text-gray-500">
                    Tipo de multa seleccionado
                </div>
            </div>
            -->
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button w-24" (click)="saveDamageHistory()">Guardar</button>
        </div>
    </ng-template>
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
          'text-danger': confirmIcon === 'delete',
          'text-warning': confirmIcon === 'warning'
        }"
      >{{ confirmIcon }}</i>
      <div class="text-left mb-6">
        <div [innerHTML]="confirmMessage"></div>
      </div>
      <div class="flex gap-4 self-end">
        <button type="button"
          class="custom-cancel-btn px-4 py-2 font-semibold w-24 text-center"
          (click)="onCustomConfirmReject()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning'"
          class="px-4 py-2 rounded font-semibold w-24 text-center"
          (click)="onCustomConfirmAccept()"
        >Aceptar</button>
      </div>
    </div>
  </div>
</div>
    `,
    providers: [MessageService],
    styles: [
        `/* Estilos para hacer el modal más suave y sin aspecto cuadrado */
        :host ::ng-deep .p-dialog {
            border-radius: 12px !important;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
            max-height: 90vh !important;
            overflow: hidden !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-header {
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
            background: #fff !important;
            flex-shrink: 0 !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
            background: #fff !important;
            overflow-y: auto !important;
            max-height: calc(90vh - 120px) !important;
            padding: 1.5rem !important;
        }

        /* Prevenir scroll en el modal cuando el dropdown está abierto */
        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open {
            overflow: hidden !important;
        }

        /* Estilos para que los dropdowns se vean como selects */
        :host ::ng-deep .p-dropdown {
            height: 48px !important;
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
            background: transparent !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled):hover {
            border-color: var(--primary-color) !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled).p-focus {
            outline: 0 none !important;
            outline-offset: 0 !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
            border-color: var(--primary-color) !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            padding: 0.75rem 2.5rem 0.75rem 2.5rem !important;
            font-size: 0.875rem !important;
            color: #111827 !important;
            line-height: normal !important;
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-trigger {
            width: 2.5rem !important;
            color: #6b7280 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        :host ::ng-deep .p-dropdown-panel {
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
        }

                :host ::ng-deep .p-dropdown .p-dropdown-label.p-inputtext {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder {
            color: #6b7280 !important;
        }

                /* Asegurar que los iconos SVG se vean igual en todos los dropdowns */
        :host ::ng-deep .p-dropdown {
            position: relative !important;
        }

        /* Configurar el panel del dropdown para evitar conflictos de scroll */
        :host ::ng-deep .p-dropdown-panel {
            z-index: 1000 !important;
            max-height: 200px !important;
            overflow-y: auto !important;
        }

        /* Prevenir que el scroll del modal interfiera con el dropdown */
        :host ::ng-deep .p-dropdown-panel .p-dropdown-items-wrapper {
            max-height: 180px !important;
            overflow-y: auto !important;
        }

        /* Asegurar que el dropdown se muestre por encima del modal */
        :host ::ng-deep .p-dropdown-panel.p-component {
            position: fixed !important;
            z-index: 1001 !important;
        }

        /* Mejorar la experiencia de scroll en el dropdown */
        :host ::ng-deep .p-dropdown-panel .p-dropdown-items {
            max-height: 200px !important;
            overflow-y: auto !important;
            scrollbar-width: thin !important;
            scrollbar-color: #cbd5e0 #f7fafc !important;
        }

        /* Estilos para el scrollbar del dropdown en WebKit */
        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar {
            width: 6px !important;
        }

        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar-track {
            background: #f7fafc !important;
            border-radius: 3px !important;
        }

        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar-thumb {
            background: #cbd5e0 !important;
            border-radius: 3px !important;
        }

        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar-thumb:hover {
            background: #a0aec0 !important;
        }

        /* Prevenir que el scroll del modal interfiera cuando el dropdown está abierto */
        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open {
            overflow: hidden !important;
            pointer-events: none !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open .p-dropdown {
            pointer-events: auto !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            padding-left: 2.5rem !important;
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
        }

        /* Centrar verticalmente el texto en los dropdowns */
        :host ::ng-deep .p-dropdown .p-dropdown-label.p-inputtext {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }

        /* Asegurar que el texto esté centrado como en la imagen */
        :host ::ng-deep .p-dropdown .p-dropdown-label {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }

        /* Centrar el placeholder también */
        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }

        /* Asegurar que el placeholder esté centrado */
        :host ::ng-deep .p-dropdown .p-dropdown-label:not(.p-inputtext) {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }

        /* Centrar cualquier texto en el dropdown */
        :host ::ng-deep .p-dropdown .p-dropdown-label {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
            min-height: 48px !important;
        }

        /* Forzar centrado del placeholder */
        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder,
        :host ::ng-deep .p-dropdown .p-dropdown-label:empty {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
            min-height: 48px !important;
        }

        /* Centrado específico para placeholder */
        :host ::ng-deep .p-dropdown .p-dropdown-label {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
            min-height: 48px !important;
            vertical-align: middle !important;
        }

        /* Forzar centrado vertical del texto */
        :host ::ng-deep .p-dropdown .p-dropdown-label span,
        :host ::ng-deep .p-dropdown .p-dropdown-label {
            display: inline-flex !important;
            align-items: center !important;
            height: 100% !important;
            line-height: 1 !important;
        }

        /* Centrado específico para placeholder */
        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            height: 48px !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
            vertical-align: middle !important;
        }

        /* Asegurar que el texto esté centrado como en la imagen */
        :host ::ng-deep .p-dropdown {
            display: flex !important;
            align-items: center !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            display: flex !important;
            align-items: center !important;
            height: 48px !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }



        /* Asegurar que los colores de los botones se apliquen correctamente */
        :host ::ng-deep button[style*="background-color: #FEE8B9"] {
            background-color: #FEE8B9 !important;
        }

        :host ::ng-deep button[style*="background-color: #C5DEF0"] {
            background-color: #C5DEF0 !important;
        }

        :host ::ng-deep button[style*="background-color: #FFABAB"] {
            background-color: #FFABAB !important;
        }
    `]
})
export class HistoryDamagesCrudComponent implements OnInit, OnDestroy {
    damageHistory: Damage[] = [];
    damageHistoryDialog: boolean = false;
    damageHistoryItem: Damage = this.emptyDamageHistory();
    selectedDamageHistory: Damage[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // Datos para los dropdowns
    tools: Tool[] = [];
    loans: Loan[] = [];
    categories: any[] = [];
    subcategories: any[] = [];
    damageTypesFromService: DamageType[] = []; // Tipos de daño dinámicos del servicio
    loading: boolean = false;

    // Arrays para opciones escalables
    categoriesOptions: string[] = [
        'Mecánico',
        'Eléctrico',
        'Hidráulico',
        'Neumático',
        'Manual',
        'Automático',
        'Digital',
        'Analógico',
        'Neumático',
        'Hidráulico',
        'Térmico',
        'Óptico',
        'Químico',
        'Biológico',
        'Nuclear'
    ];

    subcategoriesOptions: string[] = [
        'No tiene',
        'Sierra de calar',
        'Sierra circular',
        'Taladro',
        'Martillo',
        'Destornillador',
        'Llave inglesa',
        'Alicate',
        'Soldadora',
        'Compresor',
        'Bomba hidráulica',
        'Válvula',
        'Sensor',
        'Controlador',
        'Interfaz',
        'Cable',
        'Conector',
        'Resistencia',
        'Capacitor',
        'Inductor',
        'Transistor',
        'Microcontrolador',
        'Display',
        'Teclado',
        'Mouse',
        'Monitor'
    ];

    // Array escalable para tipos de daño con colores
    damageTypes: { name: string; color: string; bgColor: string; hoverColor: string }[] = [
        { name: 'Leve', color: '#333333', bgColor: '#FEE8B9', hoverColor: '#FEE8B9' },
        { name: 'Moderado', color: '#333333', bgColor: '#C5DEF0', hoverColor: '#C5DEF0' },
        { name: 'Grave', color: '#333333', bgColor: '#FFABAB', hoverColor: '#FFABAB' },
        { name: 'Crítico', color: '#333333', bgColor: '#FFABAB', hoverColor: '#FFABAB' },
        { name: 'Irreparable', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Cosmético', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Funcional', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Estructural', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Eléctrico', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Mecánico', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Hidráulico', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' },
        { name: 'Térmico', color: '#333333', bgColor: '#F5F5F5', hoverColor: '#F5F5F5' }
    ];

    // Array para tipos de multa
    fineTypes: string[] = [
        'Multa por daño',
        'Multa por retraso',
        'Multa por pérdida',
        'Multa por mal uso',
        'Multa por negligencia',
        'Multa por incumplimiento'
    ];

    // Array para herramientas
    herramientas: string[] = [
        'Taladro eléctrico',
        'Martillo',
        'Sierra circular',
        'Soldadora',
        'Destornillador',
        'Llave inglesa',
        'Cinta métrica',
        'Nivel'
    ];

    // Array para préstamos
    prestamos: string[] = [
        'PREST-001',
        'PREST-002',
        'PREST-003',
        'PREST-004',
        'PREST-005',
        'PREST-006'
    ];

    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;
    private destroy$ = new Subject<void>();

    constructor(
        private messageService: MessageService,
        private damagesService: DamagesService,
        private toolsService: ToolsService,
        private loansService: LoansService,
        private categoryService: CategoryService,
        private subcategoryService: SubcategoryService,
        private damageTypesService: DamageTypesService,
        private oauthService: OAuthService,
        private communicationService: CommunicationService
    ) {}

    ngOnInit() {
        this.loadData();
        this.setupCommunicationListeners();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private setupCommunicationListeners() {
        // COMENTADO TEMPORALMENTE - Escuchar actualizaciones de tipos de daño
        /*
        this.communicationService.damageTypesUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                if (event) {
                    // Recargar tipos de daño cuando se actualicen
                    // this.loadDamageTypesFromService(); // COMENTADO TEMPORALMENTE
                }
            });
        */

        // Escuchar actualizaciones de configuraciones de multas
        this.communicationService.finesConfigUpdates$
            .pipe(takeUntil(this.destroy$))
            .subscribe(event => {
                if (event) {
                    // Recargar configuraciones cuando se actualicen
                    this.loadData();
                }
            });
    }

    // COMENTADO TEMPORALMENTE - Cargar tipos de daño del servicio
    /*
    private loadDamageTypesFromService() {
        this.damageTypesService.getDamageTypes(undefined, true).subscribe({
            next: (data) => {
                this.damageTypesFromService = data;
            },
            error: (error) => {
                console.error('Error al cargar tipos de daño:', error);
            }
        });
    }
    */

    loadData() {
        const token = this.oauthService.getToken();

        this.loading = true;

        // Cargar daños
        this.damagesService.getDamages().subscribe({
            next: (damages: Damage[]) => {
                this.damageHistory = damages;
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error cargando daños:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los daños',
                    life: 3000
                });
                this.loading = false;
            }
        });

        // Cargar herramientas - Solo activas
        this.toolsService.getTools('', true).subscribe({
            next: (tools: Tool[]) => {
                this.tools = tools;
            },
            error: (error: any) => {
                console.error('Error cargando herramientas:', error);
            }
        });

        // Cargar préstamos
        this.loansService.getLoans().subscribe({
            next: (loans: Loan[]) => {
                this.loans = loans;
            },
            error: (error: any) => {
                console.error('Error cargando préstamos:', error);
            }
        });

        // Cargar categorías
        this.categoryService.getCategories().subscribe({
            next: (categories: any[]) => {
                this.categories = categories;
            },
            error: (error: any) => {
                console.error('Error cargando categorías:', error);
            }
        });

        // Cargar subcategorías
        this.subcategoryService.getAllSubcategories().subscribe({
            next: (subcategories: any[]) => {
                this.subcategories = subcategories;
            },
            error: (error: any) => {
                console.error('Error cargando subcategorías:', error);
            }
        });

        // COMENTADO TEMPORALMENTE - Cargar tipos de daño del servicio
        /*
        this.damageTypesService.getDamageTypes(undefined, true).subscribe({
            next: (damageTypes: DamageType[]) => {
                this.damageTypesFromService = damageTypes;
            },
            error: (error: any) => {
                console.error('Error cargando tipos de daño:', error);
            }
        });
        */
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.damageHistoryItem = this.emptyDamageHistory();
        this.isEditMode = false;
        this.damageHistoryDialog = true;
    }

    editDamageHistory(history: Damage) {
        this.damageHistoryItem = { ...history };
        this.isEditMode = true;
        this.damageHistoryDialog = true;
    }

    deleteDamageHistory(history: Damage) {
        this.confirmIcon = 'delete';
        const toolName = this.tools.find(t => t.id === history.herramienta_id)?.nombre || 'Herramienta';
        this.confirmMessage = `¿Estás seguro de eliminar el reporte de daño de <span class='text-primary'>${toolName}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            // La eliminación física de reportes no está disponible en el backend
            // Los reportes se manejan a través de cambios de estado
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'Los reportes de daños no se pueden eliminar, solo cambiar de estado. Use la función de editar para actualizar.',
                life: 4000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.damageHistoryDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
    }

    saveDamageHistory() {
        if (this.damageHistoryItem.herramienta_id && this.damageHistoryItem.descripcion?.trim()) {
            if (this.damageHistoryItem.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                const toolName = this.tools.find(t => t.id === this.damageHistoryItem.herramienta_id)?.nombre || 'Herramienta';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el reporte de daño de <span class='text-primary'>${toolName}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const updateData: DamageUpdateRequest = {
                        herramienta_id: this.damageHistoryItem.herramienta_id,
                        orden_prestamo_id: this.damageHistoryItem.orden_prestamo_id || 1, // Valor por defecto
                        tipo_dano_id: this.mapDamageTypeToId(this.damageHistoryItem.tipo_dano_id?.toString() || 'daño_menor'),
                        descripcion: this.damageHistoryItem.descripcion,
                        costo_reparacion: this.damageHistoryItem.costo_reparacion || this.damageHistoryItem.repairCost
                    };

                    this.damagesService.updateDamage(this.damageHistoryItem.id, updateData).subscribe({
                        next: (updatedDamage: Damage) => {
                            const idx = this.damageHistory.findIndex(t => t.id === this.damageHistoryItem.id);
                            if (idx > -1) this.damageHistory[idx] = updatedDamage;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Reporte actualizado correctamente',
                                life: 3000
                            });
                            this.damageHistoryDialog = false;
                            this.isEditMode = false;
                            this.damageHistoryItem = this.emptyDamageHistory();
                            // Recargar la lista para mostrar los cambios
                            this.loadData();
                        },
                        error: (error: any) => {
                            console.error('Error actualizando daño:', error);
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: error.message || 'Error al actualizar el reporte',
                                life: 3000
                            });
                        }
                    });
                };
                this.showCustomConfirm = true;
            } else {
                // Modo creación
                const createData: DamageCreateRequest = {
                    herramienta_id: this.damageHistoryItem.herramienta_id,
                    orden_prestamo_id: this.damageHistoryItem.orden_prestamo_id || 1, // Valor por defecto
                    tipo_dano_id: this.mapDamageTypeToId(this.damageHistoryItem.tipo_dano_id?.toString() || 'daño_menor'),
                    descripcion: this.damageHistoryItem.descripcion,
                    costo_reparacion: this.damageHistoryItem.costo_reparacion || this.damageHistoryItem.repairCost || 0
                };

                this.damagesService.reportDamage(createData).subscribe({
                    next: (newDamage: Damage) => {
                        this.damageHistory.push(newDamage);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Reporte creado correctamente',
                            life: 3000
                        });
                        this.damageHistoryDialog = false;
                        this.isEditMode = false;
                        this.damageHistoryItem = this.emptyDamageHistory();
                        // Recargar la lista para mostrar el nuevo reporte
                        this.loadData();
                    },
                    error: (error: any) => {
                        console.error('Error creando daño:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al crear el reporte',
                            life: 3000
                        });
                    }
                });
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor completa todos los campos requeridos',
                life: 3000
            });
        }
    }

    onCustomConfirmAccept() {
        if (this.confirmAction) this.confirmAction();
        this.showCustomConfirm = false;
    }
    onCustomConfirmReject() {
        this.showCustomConfirm = false;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    emptyDamageHistory(): Damage {
        return {
            id: 0,
            herramienta_id: 0,
            orden_prestamo_id: 0,
            tipo_dano_id: 0,
            descripcion: '',
            costo_reparacion: 0,
            report_date: '',
            status: 'reportado',
            repair_date: undefined,
            created_at: '',
            updated_at: '',
            herramienta_nombre: undefined,
            herramienta_folio: undefined,
            orden_folio: undefined,
            tipo_dano_nombre: undefined,
            porcentaje_aplicar: undefined,
            category: undefined,
            subcategory: undefined,
            repairCost: 0,
            fineType: undefined
        };
    }

    // Métodos auxiliares para el template
    getToolName(toolId: number): string {
        const tool = this.tools.find(t => t.id === toolId);
        return tool?.nombre || 'N/A';
    }

    getLoanFolio(loanId?: number): string {
        if (!loanId) return 'N/A';
        const loan = this.loans.find(l => l.id === loanId);
        return loan?.folio || 'N/A';
    }

    // COMENTADO TEMPORALMENTE - Método para mostrar tipo de daño
    /*
    getDamageTypeDisplay(damageTypeId: number): string {
        // Mapeo de IDs a nombres de tipos de daño
        const damageTypeMap: { [key: number]: string } = {
            1: 'Leve',
            2: 'Moderado',
            3: 'Grave'
        };
        return damageTypeMap[damageTypeId] || `Tipo ${damageTypeId}`;
    }
    */

    getStatusDisplay(status: string): string {
        const statusMap: { [key: string]: string } = {
            'reportado': 'Pendiente',
            'en_reparacion': 'En Reparación',
            'reparado': 'Reparado',
            'dado_de_baja': 'Dado de Baja'
        };
        return statusMap[status] || status;
    }

    mapDamageTypeToId(damageType: string): number {
        const damageTypeMap: { [key: string]: number } = {
            'daño_menor': 1,
            'daño_mayor': 2,
            'perdida_total': 3
        };
        return damageTypeMap[damageType] || 1;
    }

    mapDamageTypeToEnum(damageTypeName: string): 'daño_menor' | 'daño_mayor' | 'perdida_total' {
        switch (damageTypeName) {
            case 'Leve':
            case 'Cosmético':
            case 'Funcional':
                return 'daño_menor';
            case 'Moderado':
            case 'Estructural':
            case 'Eléctrico':
            case 'Mecánico':
            case 'Hidráulico':
            case 'Térmico':
                return 'daño_mayor';
            case 'Grave':
            case 'Crítico':
            case 'Irreparable':
                return 'perdida_total';
            default:
                return 'daño_menor';
        }
    }

    // COMENTADO TEMPORALMENTE - Método para verificar si un tipo de daño está seleccionado
    /*
    isDamageTypeSelected(damageTypeName: string): boolean {
        // Buscar el tipo de daño por nombre en el servicio
        const damageType = this.damageTypesFromService.find(dt => dt.nombre === damageTypeName);
        return damageType ? this.damageHistoryItem.tipo_dano_id === damageType.id : false;
    }
    */

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.damageHistoryDialog) {
            this.hideDialog();
        }
    }

    // Método para manejar el scroll cuando se abre un dropdown
    onDropdownOpen(event: any) {
        // Prevenir el scroll del modal cuando el dropdown está abierto
        const modalContent = document.querySelector('.p-dialog .p-dialog-content');
        if (modalContent) {
            modalContent.classList.add('p-dropdown-open');
        }
    }

    // Método para restaurar el scroll cuando se cierra un dropdown
    onDropdownClose(event: any) {
        // Restaurar el scroll del modal cuando el dropdown se cierra
        const modalContent = document.querySelector('.p-dialog .p-dialog-content');
        if (modalContent) {
            modalContent.classList.remove('p-dropdown-open');
        }
    }
}

