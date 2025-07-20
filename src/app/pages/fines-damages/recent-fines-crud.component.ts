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

interface RecentFine {
    id: string;
    loan: string;
    tool: string;
    user: string;
    damage: string;
    totalAmount: number;
    status: 'En reparación' | 'Pagado' | 'Irreparable';
}

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
        DropdownModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <p-table
        #dt
        [value]="recentFines"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['loan', 'tool', 'user', 'damage']"
        [tableStyle]="{ 'min-width': '100%' }"
        [(selection)]="selectedRecentFines"
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
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Multas Recientes</h5>
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
            <tr class="bg-[#6ea1cc] ">
                <th>Préstamo</th>
                <th>Herramienta</th>
                <th>Usuario</th>
                <th>Daño</th>
                <th>Monto Total</th>
                <th>Estado</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-fine>
            <tr>
                <td>{{ fine.loan }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full ">
                        {{ fine.tool }}
                    </span>
                </td>
                <td>{{ fine.user }}</td>
                <td style="color: var(--secundary-color);">{{ fine.damage }}</td>
                <td style="color: var(--secundary-color);">{{ fine.totalAmount | currency: 'MXN' }}</td>
                <td>
                    <span class="px-3 py-1 rounded-full"
                          [ngStyle]="{
                            'background': fine.status === 'En reparación' ? '#fef3c7' :
                                        fine.status === 'Pagado' ? '#d1fae5' : '#fecaca',
                            'color': fine.status === 'En reparación' ? '#92400e' :
                                   fine.status === 'Pagado' ? '#065f46' : '#991b1b'
                          }">
                        {{ fine.status }}
                    </span>
                </td>
                <td>
                    <p-button (click)="editRecentFine(fine)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteRecentFine(fine)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
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
  [(visible)]="recentFineDialog"
  [style]="{ width: '600px' }"
  [modal]="true"
  [draggable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Multa' : 'Nueva Multa' }}
    </span>
  </ng-template>
    <ng-template pTemplate="content">
        <div class="grid grid-cols-2 gap-4">
            <!-- Préstamo -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9.18C9.6 1.84 10.7 1 12 1C13.3 1 14.4 1.84 14.82 3H19ZM12 3C11.7348 3 11.4804 3.10536 11.2929 3.29289C11.1054 3.48043 11 3.73478 11 4C11 4.26522 11.1054 4.51957 11.2929 4.70711C11.4804 4.89464 11.7348 5 12 5C12.2652 5 12.5196 4.89464 12.7071 4.70711C12.8946 4.51957 13 4.26522 13 4C13 3.73478 12.8946 3.48043 12.7071 3.29289C12.5196 3.10536 12.2652 3 12 3ZM7 7V5H5V19H19V5H17V7H7ZM12 9C12.5304 9 13.0391 9.21071 13.4142 9.58579C13.7893 9.96086 14 10.4696 14 11C14 11.5304 13.7893 12.0391 13.4142 12.4142C13.0391 12.7893 12.5304 13 12 13C11.4696 13 10.9609 12.7893 10.5858 12.4142C10.2107 12.0391 10 11.5304 10 11C10 10.4696 10.2107 9.96086 10.5858 9.58579C10.9609 9.21071 11.4696 9 12 9ZM8 17V16C8 14.9 9.79 14 12 14C14.21 14 16 14.9 16 16V17H8Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="prestamos"
                    [(ngModel)]="recentFine.loan"
                    placeholder="Préstamo..."
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

            <!-- Herramienta -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8.33317H17V6.24984C17 5.104 16.1 4.1665 15 4.1665H9C7.9 4.1665 7 5.104 7 6.24984V8.33317H4C2.9 8.33317 2 9.27067 2 10.4165V20.8332H22V10.4165C22 9.27067 21.1 8.33317 20 8.33317ZM9 6.24984H15V8.33317H9V6.24984ZM20 18.7498H4V15.6248H6V16.6665H8V15.6248H16V16.6665H18V15.6248H20V18.7498ZM18 13.5415V12.4998H16V13.5415H8V12.4998H6V13.5415H4V10.4165H20V13.5415H18Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="herramientas"
                    [(ngModel)]="recentFine.tool"
                    [filter]="true"
                    placeholder="Herramienta..."
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

            <!-- Usuario -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">person</span>
                <input type="text" id="user" name="user" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Usuario" [(ngModel)]="recentFine.user" />
                <label for="user" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Usuario</label>
            </div>

            <!-- Daño -->
            <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 8.33317H17V6.24984C17 5.104 16.1 4.1665 15 4.1665H9C7.9 4.1665 7 5.104 7 6.24984V8.33317H4C2.9 8.33317 2 9.27067 2 10.4165V20.8332H22V10.4165C22 9.27067 21.1 8.33317 20 8.33317ZM9 6.24984H15V8.33317H9V6.24984ZM20 18.7498H4V15.6248H6V16.6665H8V15.6248H16V16.6665H18V15.6248H20V18.7498ZM18 13.5415V12.4998H16V13.5415H8V12.4998H6V13.5415H4V10.4165H20V13.5415H18Z" fill="var(--primary-color)"/>
                </svg>
                <input type="text" id="damage" name="damage" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Daño" [(ngModel)]="recentFine.damage" />
                <label for="damage" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Daño</label>
            </div>

            <!-- Monto Total -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">payments</span>
                <input type="number" id="totalAmount" name="totalAmount" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Monto Total" [(ngModel)]="recentFine.totalAmount" />
                <label for="totalAmount" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Monto Total</label>
            </div>

            <!-- Estado -->
            <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 z-20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z" fill="var(--primary-color)"/>
                </svg>
                <p-dropdown
                    [options]="estados"
                    [(ngModel)]="recentFine.status"
                    placeholder="Estado..."
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="false">
                    <ng-template pTemplate="selectedItem" let-estado>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ estado }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-estado>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ estado }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
            </div>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button w-24" (click)="saveRecentFine()">Guardar</button>
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
    `]
})
export class RecentFinesCrudComponent implements OnInit {
    recentFines: RecentFine[] = [];
    recentFineDialog: boolean = false;
    recentFine: RecentFine = this.emptyRecentFine();
    selectedRecentFines: RecentFine[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // Arrays para opciones
    prestamos: string[] = [
        'TAL-202',
        'MAR-115',
        'SOL-042',
        'SIE-301',
        'COM-205',
        'BOM-108'
    ];

    herramientas: string[] = [
        'Taladro Percutor',
        'Martillo de bola',
        'Soldadora Inversora',
        'Sierra circular',
        'Compresor',
        'Bomba hidráulica'
    ];

    estados: string[] = [
        'En reparación',
        'Pagado',
        'Irreparable'
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
        this.recentFines = [
            {
                id: '1',
                loan: 'TAL-202',
                tool: 'Taladro Percutor',
                user: 'Juan Pérez',
                damage: 'Motor quemado',
                totalAmount: 100,
                status: 'En reparación'
            },
            {
                id: '2',
                loan: 'MAR-115',
                tool: 'Martillo de bola',
                user: 'Carlos Rojas',
                damage: 'Mango roto',
                totalAmount: 200,
                status: 'Pagado'
            },
            {
                id: '3',
                loan: 'SOL-042',
                tool: 'Soldadora Inversora',
                user: 'Ana Vargas',
                damage: 'Pantalla LCD rota',
                totalAmount: 200,
                status: 'Irreparable'
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.recentFine = this.emptyRecentFine();
        this.isEditMode = false;
        this.recentFineDialog = true;
    }

    editRecentFine(fine: RecentFine) {
        this.recentFine = { ...fine };
        this.isEditMode = true;
        this.recentFineDialog = true;
    }

    deleteRecentFine(fine: RecentFine) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la multa del préstamo <span class='text-primary'>${fine.loan}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.recentFines = this.recentFines.filter(t => t.id !== fine.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Multa eliminada',
                life: 3000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.recentFineDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
    }

    saveRecentFine() {
        if (this.recentFine.loan?.trim()) {
            if (this.recentFine.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar la multa del préstamo <span class='text-primary'>${this.recentFine.loan}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.recentFines.findIndex(t => t.id === this.recentFine.id);
                    if (idx > -1) this.recentFines[idx] = { ...this.recentFine };
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Multa actualizada',
                        life: 3000
                    });
                    this.recentFineDialog = false;
                    this.isEditMode = false;
                    this.recentFine = this.emptyRecentFine();
                };
                this.showCustomConfirm = true;
            } else {
                this.recentFine.id = this.createId();
                this.recentFines.push({ ...this.recentFine });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Multa creada',
                    life: 3000
                });
                this.recentFineDialog = false;
                this.isEditMode = false;
                this.recentFine = this.emptyRecentFine();
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El préstamo es requerido',
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

    emptyRecentFine(): RecentFine {
        return {
            id: '',
            loan: '',
            tool: '',
            user: '',
            damage: '',
            totalAmount: 0,
            status: 'En reparación'
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.recentFineDialog) {
            this.hideDialog();
        }
    }
}
