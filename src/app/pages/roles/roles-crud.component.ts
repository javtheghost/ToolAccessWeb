import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';

interface Role {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

@Component({
    selector: 'app-roles-crud',
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
        InputSwitchModule,
        InputIconModule,
        IconFieldModule,
        TooltipModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <p-table
        #dt
        [value]="roles"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'description']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedRoles"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Roles</h5>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end">
                    <p-button label="Crear Rol" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Activo</th>
                <th>Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-role>
            <tr>
                <td>{{ role.name }}</td>
                <td>{{ role.description }}</td>
                <td>
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="role.active" disabled />
                </td>
                <td>
                    <p-button
                        (click)="editRole(role)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                        pTooltip="Editar rol"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button
                        (click)="deleteRole(role)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-delete"
                        pTooltip="Eliminar rol"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>
<p-dialog [(visible)]="roleDialog" [style]="{ width: '500px' }" [header]="isEditMode ? 'Editar Rol' : 'Nuevo Rol'" [modal]="true" [draggable]="false" headerStyleClass="!text-[var(--primary-color)]">
    <ng-template pTemplate="content">
        <div class="grid grid-cols-2 gap-4 ">
            <div class="relative col-span-2 py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">person</span>
                <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="role.name" />
                <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">edit_document</span>
                <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="role.description"></textarea>
                <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>
            <div class="flex flex-col items-center justify-center col-span-2">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" [(ngModel)]="role.active" />
            </div>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="custom-cancel-btn min-w-[120px] text-center" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button min-w-[120px] text-center font-semibold" (click)="saveRole()">Guardar</button>
        </div>
    </ng-template>
</p-dialog>
<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
    <!-- Tachita de cerrar -->
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
          class="custom-cancel-btn min-w-[120px] text-center font-semibold"
          (click)="onCustomConfirmReject()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="(confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning') + ' min-w-[120px] text-center font-semibold rounded'"
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
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
        }`
    ]
})
export class RolesCrudComponent implements OnInit {
    roles: Role[] = [];
    roleDialog: boolean = false;
    role: Role = this.emptyRole();
    selectedRoles: Role[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // NUEVO: variables para el modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    private escListener: any;

    constructor(
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadDemoData();
        this.escListener = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                let closed = false;
                if (this.roleDialog) {
                    this.roleDialog = false;
                    this.isEditMode = false;
                    closed = true;
                }
                if (this.showCustomConfirm) {
                    this.showCustomConfirm = false;
                    closed = true;
                }
                if (closed) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };
        window.addEventListener('keydown', this.escListener);
    }

    ngOnDestroy() {
        window.removeEventListener('keydown', this.escListener);
    }

    loadDemoData() {
        this.roles = [
            {
                id: '1',
                name: 'Administrador',
                description: 'Acceso completo al sistema',
                active: true
            },
            {
                id: '2',
                name: 'Operador',
                description: 'Acceso básico para préstamos',
                active: true
            },
            {
                id: '3',
                name: 'Recepcionista',
                description: 'Acceso limitado, gestionar ordenes, no modificar',
                active: false
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.role = this.emptyRole();
        this.isEditMode = false;
        this.roleDialog = true;
    }

    editRole(role: Role) {
        this.role = { ...role };
        this.isEditMode = true;
        this.roleDialog = true;
    }

    deleteRole(role: Role) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar el rol <span class='text-primary'>${role.name}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.roles = this.roles.filter(r => r.id !== role.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Rol eliminado',
                life: 3000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.roleDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
    }

    saveRole() {
        if (this.role.name?.trim()) {
            if (this.role.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el rol <span class='text-primary'>${this.role.name}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.roles.findIndex(r => r.id === this.role.id);
                    if (idx > -1) this.roles[idx] = { ...this.role };
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Rol actualizado',
                        life: 3000
                    });
                    this.roleDialog = false;
                    this.isEditMode = false;
                    this.role = this.emptyRole();
                };
                this.showCustomConfirm = true;
            } else {
                // Modo creación - guardar directamente
                this.role.id = this.createId();
                this.roles.push({ ...this.role });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Rol creado',
                    life: 3000
                });
                this.roleDialog = false;
                this.isEditMode = false;
                this.role = this.emptyRole();
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'El nombre es requerido',
                life: 3000
            });
        }
    }

    // Métodos para el modal personalizado
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

    emptyRole(): Role {
        return {
            id: '',
            name: '',
            description: '',
            active: true
        };
    }
}
