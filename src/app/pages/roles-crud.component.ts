import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

interface Role {
    id?: string;
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
        TextareaModule,
        DialogModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        InputSwitchModule
    ],
    template: `
        <p-toast></p-toast>

        <div class="p-6">
            <p-table
                #dt
                [value]="roles()"
                [rows]="10"
                [columns]="cols"
                [paginator]="true"
                [globalFilterFields]="['name', 'description', 'active']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedRoles"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
                [showCurrentPageReport]="true"
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
                            <p-inputSwitch [ngModel]="role.active" [disabled]="true"></p-inputSwitch>
                        </td>
                        <td>
                            <p-button (click)="editRole(role)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">edit</i>
                                </ng-template>
                            </p-button>
                            <p-button (click)="deleteRole(role)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">delete</i>
                                </ng-template>
                            </p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
            <div class="flex justify-center mt-6">
                <!-- La paginación de PrimeNG ya está centrada por defecto si la tabla está centrada -->
            </div>
        </div>

        <!-- Diálogo para crear/editar rol -->
        <p-dialog [(visible)]="roleDialog" [style]="{ width: '500px' }" [header]="isEditMode ? 'Editar Rol' : 'Nuevo Rol'" [modal]="true" [draggable]="false">
            <ng-template pTemplate="content">
                <div class="grid grid-cols-2 gap-4">
                    <div class="relative col-span-2">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">badge</span>
                        <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="role.name" />
                        <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
                    </div>
                    <div class="relative col-span-2">
                        <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">description</span>
                        <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="role.description"></textarea>
                        <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
                    </div>
                    <div class="flex flex-col items-center justify-center col-span-2">
                        <label class="mb-2">Activo</label>
                        <p-inputSwitch [(ngModel)]="role.active"></p-inputSwitch>
                    </div>
                </div>
                <div class="flex justify-end gap-4 mt-6">
                    <button pButton type="button" class="p-button-outlined" (click)="hideDialog()">Cancelar</button>
                    <button pButton type="button" class="p-button" (click)="saveRole()">Guardar</button>
                </div>
            </ng-template>
        </p-dialog>
        <p-confirmDialog [style]="{ width: '350px' }" [draggable]="false">
            <ng-template pTemplate="message" let-message>
                <div class="flex flex-col items-start">
                    <i class="material-symbols-outlined text-red-600 text-6xl mb-4">delete</i>
                    <div class="text-left">
                        <div [innerHTML]="message.message"></div>
                    </div>
                </div>
            </ng-template>
            <ng-template pTemplate="footer" let-accept="accept" let-reject="reject">
    <div class="flex justify-center gap-3">
        <button pButton type="button" label="Cancelar" class="p-button-outlined" (click)="reject()"></button>
        <button
            pButton
            type="button"
            label="Aceptar"
            [ngClass]="{
                'custom-confirm-button-delete': confirmIcon === 'delete',
                'custom-confirm-button-warning': confirmIcon === 'warning'
            }"
            (click)="accept()"
        ></button>
    </div>
</ng-template>

        </p-confirmDialog>
    `,
    providers: [MessageService, ConfirmationService],
    styles: [`
        .p-dialog .p-dialog-header {
            background: #002e6d;
            color: white;
        }
        .p-dialog .p-dialog-content {
            background: #f8fafc;
        }
    `]
})
export class RolesCrudComponent implements OnInit {
    roleDialog: boolean = false;
    roles = signal<Role[]>([]);
    role: Role = { name: '', description: '', active: true };
    selectedRoles: Role[] | null = null;
    submitted: boolean = false;
    @ViewChild('dt') dt!: Table;
    exportColumns: ExportColumn[] = [];
    cols: Column[] = [];
    isEditMode: boolean = false;

    // Propiedades para el ícono dinámico
    confirmIcon: string = 'delete';
    confirmIconColor: string = '#D9534F';

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadRoles();
    }

    loadRoles() {
        // Datos de ejemplo para roles
        const sampleRoles: Role[] = [
            { id: '1', name: 'Administrador', description: 'Acceso completo al sistema', active: true },
            { id: '3', name: 'Operador', description: 'Acceso básico para préstamos', active: true },
            { id: '4', name: 'Recepcionista', description: 'Accesso limitado, gestionar ordenes, no modificar   ', active: false }
        ];
        this.roles.set(sampleRoles);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.role = { name: '', description: '', active: true };
        this.submitted = false;
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
        this.confirmIconColor = '#D9534F';
        this.confirmationService.confirm({
            message: `
              <div style="text-align: center;">
                <strong>¿Estás seguro de eliminar el rol ${role.name}?</strong>
                <p style="margin-top: 8px;">Una vez que aceptes, no podrás revertir los cambios.</p>
              </div>
            `,
            accept: () => {
                this.roles.set(this.roles().filter((val) => val.id !== role.id));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Rol eliminado',
                    life: 3000
                });
            },
            reject: () => {
                this.hideDialog();
            },
            rejectLabel: 'Cancelar',
            acceptLabel: 'Aceptar',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            acceptButtonStyleClass: 'p-button p-button-danger'
        });
    }

    hideDialog() {
        this.roleDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.roles().length; i++) {
            if (this.roles()[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    saveRole() {
        this.submitted = true;
        let _roles = this.roles();

        if (this.role.name?.trim()) {
            if (this.role.id) {
                this.confirmIcon = 'warning';
                this.confirmIconColor = '#FFA726';

                this.confirmationService.confirm({
                    message: `¿Estás seguro que deseas continuar con esta operación?<br><small>Una vez que aceptes, los cambios reemplazarán la información actual.</small>`,
                    header: 'Confirmar Actualización',
                    acceptButtonStyleClass: 'p-button-warning custom-accept-button',
                    rejectButtonStyleClass: 'p-button-text',
                    acceptLabel: 'Aceptar',
                    rejectLabel: 'Cancelar',
                    accept: () => {
                        _roles[this.findIndexById(this.role.id!)] = this.role;
                        this.roles.set([..._roles]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `¡${this.role.name} actualizado correctamente!`,
                            life: 3000
                        });
                        this.roleDialog = false;
                        this.role = { name: '', description: '', active: true };
                    },
                    reject: () => {
                        this.hideDialog();
                    }
                });
            } else {
                this.role.id = this.createId();
                this.roles.set([..._roles, this.role]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `¡${this.role.name} creado correctamente!`,
                    life: 3000
                });
                this.roleDialog = false;
                this.role = { name: '', description: '', active: true };
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
}
