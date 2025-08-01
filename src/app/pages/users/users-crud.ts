import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
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

interface User {
    id: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    rol: string;
    contrasena: string; // Nuevo campo
    activo: boolean;
}

@Component({
    selector: 'app-users-crud',
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
        IconFieldModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <p-table
        #dt
        [value]="users"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['nombres', 'apellidoPaterno', 'apellidoMaterno', 'correo', 'rol']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedUsers"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Usuarios</h5>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end">
                    <p-button label="Crear Usuario" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>Nombres</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Activo</th>
                <th>Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
            <tr>
                <td>{{ user.nombres }}</td>
                <td>{{ user.apellidoPaterno }}</td>
                <td>{{ user.apellidoMaterno }}</td>
                <td>{{ user.correo }}</td>
                <td>{{ user.rol }}</td>
                <td>
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="user.activo" disabled />
                </td>
                <td>
                    <p-button (click)="editUser(user)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteUser(user)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
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
<p-dialog [(visible)]="userDialog" [style]="{ width: '500px' }" [header]="isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="grid grid-cols-2 gap-4">
            <div class="relative col-span-2 py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">person</span>
                <input type="text" id="nombres" name="nombres" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombres" [(ngModel)]="user.nombres" />
                <label for="nombres" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombres</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">badge</span>
                <input type="text" id="apellidoPaterno" name="apellidoPaterno" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Apellido Paterno" [(ngModel)]="user.apellidoPaterno" />
                <label for="apellidoPaterno" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Apellido Paterno</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">badge</span>
                <input type="text" id="apellidoMaterno" name="apellidoMaterno" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Apellido Materno" [(ngModel)]="user.apellidoMaterno" />
                <label for="apellidoMaterno" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Apellido Materno</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">mail</span>
                <input type="email" id="correo" name="correo" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Correo" [(ngModel)]="user.correo" />
                <label for="correo" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Correo</label>
            </div>

            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">lock</span>
                <input [type]="showPassword ? 'text' : 'password'" id="contrasena" name="contrasena" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 pr-14 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Contraseña" [(ngModel)]="user.contrasena" />
                <label for="contrasena" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Contraseña</label>
                <button type="button" (click)="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none">
                    <span class="material-symbols-outlined">{{ showPassword ? 'visibility' : 'visibility_off' }}</span>
                </button>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">supervisor_account</span>
                <input type="text" id="rol" name="rol" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Rol" [(ngModel)]="user.rol" />
                <label for="rol" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Rol</label>
            </div>
            <div class="flex flex-col items-center justify-center col-span-2">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" [(ngModel)]="user.activo" />
            </div>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button w-24" (click)="saveUser()">Guardar</button>
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
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
        }`
    ]
})
export class UsersCrudComponent implements OnInit {
    users: User[] = [];
    userDialog: boolean = false;
    user: User = this.emptyUser();
    selectedUsers: User[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    showPassword: boolean = false; // Para alternar visibilidad
    @ViewChild('dt') dt!: Table;

    // NUEVO: variables para el modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    constructor(
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.users = [
            {
                id: '1',
                nombres: 'Francisco Javier',
                apellidoPaterno: 'Mota',
                apellidoMaterno: 'Ontiveros',
                correo: 'email@gmail.com',
                rol: 'Recepcionista',
                contrasena: 'contrasena123', // Agregar contrasena
                activo: true
            },
            {
                id: '2',
                nombres: 'Ana María',
                apellidoPaterno: 'López',
                apellidoMaterno: 'García',
                correo: 'ana@gmail.com',
                rol: 'Administrador',
                contrasena: 'admin123', // Agregar contrasena
                activo: false
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.user = this.emptyUser();
        this.isEditMode = false;
        this.userDialog = true;
    }

    editUser(user: User) {
        this.user = { ...user };
        this.isEditMode = true;
        this.userDialog = true;
    }

    deleteUser(user: User) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar el usuario <span class='text-primary'>${user.nombres}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.users = this.users.filter(u => u.id !== user.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Usuario eliminado',
                life: 3000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.userDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false; // Cierra también el modal de confirmación personalizada
    }

    saveUser() {
        if (this.user.nombres?.trim()) {
            if (this.user.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el usuario <span class='text-primary'>${this.user.nombres}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.users.findIndex(u => u.id === this.user.id);
                    if (idx > -1) this.users[idx] = { ...this.user };
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Usuario actualizado',
                        life: 3000
                    });
                    this.userDialog = false;
                    this.isEditMode = false;
                    this.user = this.emptyUser();
                };
                this.showCustomConfirm = true;
            } else {
                // Modo creación - guardar directamente
                this.user.id = this.createId();
                this.users.push({ ...this.user });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Usuario creado',
                    life: 3000
                });
                this.userDialog = false;
                this.isEditMode = false;
                this.user = this.emptyUser();
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

    emptyUser(): User {
        return {
            id: '',
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            correo: '',
            rol: '',
            contrasena: '', // Nuevo campo
            activo: true
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.userDialog) {
            this.hideDialog();
        }
    }
}
