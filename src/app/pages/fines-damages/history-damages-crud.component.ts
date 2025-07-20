import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
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
        DialogModule,
        ConfirmDialogModule,
        InputIconModule,
        IconFieldModule,
        DropdownModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <p-table
        #dt
        [value]="damageHistory"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['tool', 'order', 'damageType', 'description']"
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
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Historial de daños de herramientas</h5>
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
                <th>ID</th>
                <th>Herramienta</th>
                <th>Orden</th>
                <th>Tipo Daño</th>
                <th>Descripción</th>
                <th>Costo Rep.</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-history>
            <tr>
                <td>{{ history.id }}</td>
                <td>{{ history.tool }}</td>
                <td>{{ history.order }}</td>
                <td>{{ history.damageType }}</td>
                <td>{{ history.description }}</td>
                <td>{{ history.repairCost | currency: 'USD' }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full text-white" [ngStyle]="{ 'background': history.status === 'Pendiente' ? '#FEE8B9' : '#AAEACA', 'color': '#333' }">
                        {{ history.status }}
                    </span>
                </td>
                <td>
                    <p-button (click)="editDamageHistory(history)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteDamageHistory(history)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>
<p-dialog
  [(visible)]="damageHistoryDialog"
  [style]="{ width: '600px' }"
  [modal]="true"
  [draggable]="false"
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
                    [options]="herramientas"
                    [(ngModel)]="damageHistoryItem.tool"
                    placeholder="Herramienta dañada..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false">
                    <ng-template pTemplate="selectedItem" let-herramienta>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ herramienta }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-herramienta>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ herramienta }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>

            <!-- Préstamo asociado -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9.18C9.6 1.84 10.7 1 12 1C13.3 1 14.4 1.84 14.82 3H19ZM12 3C11.7348 3 11.4804 3.10536 11.2929 3.29289C11.1054 3.48043 11 3.73478 11 4C11 4.26522 11.1054 4.51957 11.2929 4.70711C11.4804 4.89464 11.7348 5 12 5C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM7 7V5H5V19H19V5H17V7H7ZM12 9C12.5304 9 13.0391 9.21071 13.4142 9.58579C13.7893 9.96086 14 10.4696 14 11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11C10 10.4696 10.2107 9.96086 10.5858 9.58579C10.9609 9.21071 11.4696 9 12 9ZM8 17V16C8 14.9 9.79 14 12 14C14.21 14 16 14.9 16 16V17H8Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="prestamos"
                    [(ngModel)]="damageHistoryItem.order"
                    placeholder="Préstamo asociado..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false">
                    <ng-template pTemplate="selectedItem" let-prestamo>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ prestamo }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-prestamo>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ prestamo }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>

                        <!-- Categoría -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21H4V10H6V19H18V10H20V21ZM3 3H21V9H3V3ZM9.5 11H14.5C14.78 11 15 11.22 15 11.5V13H9V11.5C9 11.22 9.22 11 9.5 11ZM5 5V7H19V5H5Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="categories"
                    [(ngModel)]="damageHistoryItem.category"
                    [filter]="true"
                    placeholder="Categoría..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'">
                    <ng-template pTemplate="selectedItem" let-category>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ category }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-category>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ category }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>

            <!-- Subcategorías -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21H4V10H6V19H18V10H20V21ZM3 3H21V9H3V3ZM9.5 11H14.5C14.78 11 15 11.22 15 11.5V13H9V11.5C9 11.22 9.22 11 9.5 11ZM5 5V7H19V5H5Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="subcategories"
                    [(ngModel)]="damageHistoryItem.subcategory"
                    [filter]="true"
                    placeholder="Subcategoría..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'">
                    <ng-template pTemplate="selectedItem" let-subcategory>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ subcategory }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-subcategory>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ subcategory }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>

            <!-- Tipo de Daño -->
            <div>
                <label class="text-sm font-medium text-gray-700 mb-2 block">Tipo de Daño</label>
                <div class="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        <button type="button"
                                *ngFor="let damageType of damageTypes"
                                [style.background-color]="damageHistoryItem.damageType === damageType.name ? damageType.bgColor : 'transparent'"
                                [style.color]="damageHistoryItem.damageType === damageType.name ? damageType.color : '#374151'"
                                [style.border-color]="damageHistoryItem.damageType === damageType.name ? damageType.color : '#D1D5DB'"
                                [style.hover-background-color]="damageHistoryItem.damageType !== damageType.name ? damageType.hoverColor : 'transparent'"
                                class="px-3 py-2 rounded-full border text-xs sm:text-sm transition-colors duration-200 truncate"
                                (click)="damageHistoryItem.damageType = damageType.name"
                                [title]="damageType.name">
                            {{ damageType.name }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Descripción detallada -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">edit_document</span>
                <textarea id="description" name="description" rows="3" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder="Descripción detallada" [(ngModel)]="damageHistoryItem.description"></textarea>
            </div>

            <!-- Costo estimado de reparación -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">payments</span>
                <input type="number" id="repairCost" name="repairCost" class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder="Costo estimado de reparación" [(ngModel)]="damageHistoryItem.repairCost" />
            </div>

                        <!-- Tipo de multa -->
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
                    [styleClass]="'h-12 px-10'">
                    <ng-template pTemplate="selectedItem" let-fineType>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ fineType }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-fineType>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ fineType }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>
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
        }

        :host ::ng-deep .p-dialog .p-dialog-header {
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 1px solid #e5e7eb !important;
            background: #fff !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
            background: #fff !important;
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
export class HistoryDamagesCrudComponent implements OnInit {
    damageHistory: DamageHistory[] = [];
    damageHistoryDialog: boolean = false;
    damageHistoryItem: DamageHistory = this.emptyDamageHistory();
    selectedDamageHistory: DamageHistory[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // Arrays para opciones escalables
    categories: string[] = [
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

    subcategories: string[] = [
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

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.damageHistory = [
            {
                id: '1',
                tool: 'Taladro eléctrico',
                order: 'ORD-1254',
                damageType: 'Grave',
                description: 'Motor quemado',
                repairCost: 200,
                status: 'Pendiente',
                category: 'Eléctrico',
                subcategory: 'No tiene',
                fineType: 'Multa por daño'
            },
            {
                id: '2',
                tool: 'Martillo',
                order: 'ORD-1255',
                damageType: 'Leve',
                description: 'Mango rajado',
                repairCost: 25,
                status: 'Reparado',
                category: 'Mecánico',
                subcategory: 'No tiene',
                fineType: 'Multa por daño'
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.damageHistoryItem = this.emptyDamageHistory();
        this.isEditMode = false;
        this.damageHistoryDialog = true;
    }

    editDamageHistory(history: DamageHistory) {
        this.damageHistoryItem = { ...history };
        this.isEditMode = true;
        this.damageHistoryDialog = true;
    }

    deleteDamageHistory(history: DamageHistory) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar el reporte de daño de <span class='text-primary'>${history.tool}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.damageHistory = this.damageHistory.filter(t => t.id !== history.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Reporte eliminado',
                life: 3000
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
        if (this.damageHistoryItem.tool?.trim()) {
            if (this.damageHistoryItem.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el reporte de daño de <span class='text-primary'>${this.damageHistoryItem.tool}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.damageHistory.findIndex(t => t.id === this.damageHistoryItem.id);
                    if (idx > -1) this.damageHistory[idx] = { ...this.damageHistoryItem };
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Reporte actualizado',
                        life: 3000
                    });
                    this.damageHistoryDialog = false;
                    this.isEditMode = false;
                    this.damageHistoryItem = this.emptyDamageHistory();
                };
                this.showCustomConfirm = true;
            } else {
                this.damageHistoryItem.id = this.createId();
                this.damageHistory.push({ ...this.damageHistoryItem });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Reporte creado',
                    life: 3000
                });
                this.damageHistoryDialog = false;
                this.isEditMode = false;
                this.damageHistoryItem = this.emptyDamageHistory();
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El nombre de la herramienta es requerido',
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

    emptyDamageHistory(): DamageHistory {
        return {
            id: '',
            tool: '',
            order: '',
            damageType: '',
            description: '',
            repairCost: 0,
            status: 'Pendiente',
            category: '',
            subcategory: '',
            fineType: ''
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.damageHistoryDialog) {
            this.hideDialog();
        }
    }
}

