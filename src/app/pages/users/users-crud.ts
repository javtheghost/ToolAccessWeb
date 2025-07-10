import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Product, ProductService } from '../service/product.service';
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

interface User {
    id: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    rol: string;
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
        InputSwitchModule
    ],
    template: `
        <div class="p-6">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2">
                    <span class="pi pi-search text-xl text-gray-500"></span>
                    <input pInputText type="text" [(ngModel)]="globalFilter" (input)="onGlobalFilter($event)" placeholder="Buscar" class="w-72" />
                </div>
                <button pButton type="button" class="bg-[#002e6d] text-white px-6 py-2 rounded-lg flex items-center gap-2" (click)="openNew()">
                    <span class="pi pi-plus"></span> Crear usuario
                </button>
            </div>
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
                            <p-inputSwitch [ngModel]="user.activo" [disabled]="true"></p-inputSwitch>
                        </td>
                        <td>
                            <button pButton type="button" icon="pi pi-pencil" class="p-0 mr-2 text-[#002e6d]" (click)="editUser(user)"></button>
                            <button pButton type="button" icon="pi pi-trash" class="p-0 text-red-600" (click)="deleteUser(user)"></button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
            <div class="flex justify-center mt-6">
                <!-- La paginación de PrimeNG ya está centrada por defecto si la tabla está centrada -->
            </div>
        </div>
        <!-- Diálogo para crear/editar usuario -->
        <p-dialog [(visible)]="userDialog" [style]="{ width: '450px' }" header="Nuevo Usuario" [modal]="true">
            <ng-template pTemplate="content">
                <div class="flex flex-col gap-6">
                    <div class="relative">
                        <label class="block mb-1">Nombres</label>
                        <input pInputText type="text" [(ngModel)]="user.nombres" class="w-full" placeholder="Nombres" />
                    </div>
                    <div class="relative">
                        <label class="block mb-1">Apellido Paterno</label>
                        <input pInputText type="text" [(ngModel)]="user.apellidoPaterno" class="w-full" placeholder="Apellido Paterno" />
                    </div>
                    <div class="relative">
                        <label class="block mb-1">Apellido Materno</label>
                        <input pInputText type="text" [(ngModel)]="user.apellidoMaterno" class="w-full" placeholder="Apellido Materno" />
                    </div>
                    <div class="relative">
                        <label class="block mb-1">Correo</label>
                        <input pInputText type="email" [(ngModel)]="user.correo" class="w-full" placeholder="Correo" />
                    </div>
                    <div class="relative">
                        <label class="block mb-1">Rol</label>
                        <input pInputText type="text" [(ngModel)]="user.rol" class="w-full" placeholder="Rol" />
                    </div>
                    <div class="relative flex items-center gap-2">
                        <label class="mb-0">Activo</label>
                        <p-inputSwitch [ngModel]="user.activo" [disabled]="true"></p-inputSwitch>
                    </div>
                </div>
            </ng-template>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-text" (click)="hideDialog()"></button>
                <button pButton type="button" label="Guardar" icon="pi pi-check" (click)="saveUser()"></button>
            </ng-template>
        </p-dialog>
        <p-confirmDialog [style]="{ width: '350px' }" [draggable]="false"></p-confirmDialog>
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
export class UserCrudComponent implements OnInit {
    users: User[] = [];
    userDialog: boolean = false;
    user: User = this.emptyUser();
    selectedUsers?: User[] | null;
    globalFilter: string = '';

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

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
                activo: true
            },
            {
                id: '2',
                nombres: 'Ana María',
                apellidoPaterno: 'López',
                apellidoMaterno: 'García',
                correo: 'ana@gmail.com',
                rol: 'Administrador',
                activo: false
            }
        ];
    }

    onGlobalFilter(event: Event) {
        // El filtro global se maneja automáticamente por PrimeNG si se enlaza [(ngModel)]="globalFilter" y [globalFilterFields]
    }

    openNew() {
        this.user = this.emptyUser();
        this.userDialog = true;
    }

    editUser(user: User) {
        this.user = { ...user };
        this.userDialog = true;
    }

    deleteUser(user: User) {
        this.confirmationService.confirm({
            message: `¿Estás seguro de eliminar a ${user.nombres}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.users = this.users.filter(u => u.id !== user.id);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Eliminado',
                    detail: 'Usuario eliminado',
                    life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.userDialog = false;
    }

    saveUser() {
        if (this.user.id) {
            // Editar
            const idx = this.users.findIndex(u => u.id === this.user.id);
            if (idx > -1) this.users[idx] = { ...this.user };
            this.messageService.add({
                severity: 'success',
                summary: 'Actualizado',
                detail: 'Usuario actualizado',
                life: 3000
            });
        } else {
            // Nuevo
            this.user.id = this.createId();
            this.users.push({ ...this.user });
            this.messageService.add({
                severity: 'success',
                summary: 'Creado',
                detail: 'Usuario creado',
                life: 3000
            });
        }
        this.userDialog = false;
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
            activo: true
        };
    }
}
