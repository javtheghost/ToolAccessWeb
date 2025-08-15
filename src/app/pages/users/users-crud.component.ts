import { Component, OnInit, signal, ViewChild, HostListener } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { UserService } from '../service/user.service';

import { OAuthService } from '../service/oauth.service';
import { User, UserCreateRequest, UserUpdateRequest } from '../interfaces';
import { ModalAlertService, ModalAlert } from '../utils/modal-alert.service';
import { ModalAlertComponent } from '../utils/modal-alert.component';
import { DomSanitizer } from '@angular/platform-browser';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-users-crud',
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
        PasswordModule,
        TextareaModule,
        DialogModule,
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        SkeletonModule,
        ProgressSpinnerModule,
        TooltipModule,
        DropdownModule,
        MultiSelectModule,
        TagModule,
        AvatarModule,
        InputSwitchModule,
        ModalAlertComponent
    ],
    providers: [MessageService, ConfirmationService],
    template: `
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>
<div class="p-4 sm:p-6">
    <!-- Loading State -->
    <div *ngIf="loading()" class="space-y-4">
        <!-- Header siempre visible -->
        <div class="flex items-center justify-between">
            <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Administrar Usuarios</h5>
        </div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
            <p-iconfield class="w-full sm:w-80">
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" placeholder="Buscar usuarios..." disabled class="w-full" />
            </p-iconfield>
            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <p-button label="Crear Usuario" (onClick)="openNew()" [disabled]="true" class="w-full sm:w-auto"></p-button>
                <p-button
                    [label]="showOnlyActive ? 'Ver Todos' : 'Solo Activos'"
                    severity="secondary"
                    size="small"
                    [disabled]="true"
                    class="w-full sm:w-auto">
                </p-button>
            </div>
        </div>

        <!-- Skeleton para toda la tabla -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header skeleton -->
            <div class="bg-[#6ea1cc] text-white p-3">
                <div class="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
                    <p-skeleton height="1.5rem" width="60px" styleClass="bg-white/20 flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20 flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1.5rem" width="150px" styleClass="bg-white/20 flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20 flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20 flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20 flex-shrink-0"></p-skeleton>
                </div>
            </div>
            <!-- Filas skeleton -->
            <div class="p-4 space-y-3">
                <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-2 sm:space-x-4 py-3 border-b border-gray-100 last:border-b-0 overflow-x-auto">
                    <p-skeleton height="2rem" width="2rem" styleClass="rounded-full flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1rem" width="120px" styleClass="flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1rem" width="180px" styleClass="flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1rem" width="100px" styleClass="flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1rem" width="60px" styleClass="flex-shrink-0"></p-skeleton>
                    <p-skeleton height="1rem" width="100px" styleClass="flex-shrink-0"></p-skeleton>
                </div>
            </div>
        </div>
    </div>

    <!-- Content when loaded -->
    <div *ngIf="!loading()">
        <!-- Table with data -->
        <p-table
            #dt
            [value]="filteredUsers()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['id', 'nombre', 'email', 'apellido_paterno', 'apellido_materno', 'rol_nombre']"
            [scrollable]="true"
            [loading]="loading()"
            styleClass="p-datatable-gridlines"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            [showCurrentPageReport]="true"
            [responsive]="true"
            [scrollDirection]="'both'"
            scrollHeight="400px">

            <ng-template pTemplate="caption">
                <div class="space-y-4">
                    <!-- Header siempre visible -->
                    <div class="flex items-center justify-between">
                        <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Administrar Usuarios</h5>
                    </div>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                        <p-iconfield class="w-full sm:w-80">
                            <p-inputicon styleClass="pi pi-search" />
                            <input
                                pInputText
                                type="text"

                                (input)="onGlobalFilter($event)"
                                placeholder="Buscar usuarios..."
                                class="w-full" />
                        </p-iconfield>
                        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <p-button
                                label="Crear Usuario"
                                (onClick)="openNew()"
                                icon= "pi pi-plus"
                                class="w-full sm:w-auto">
                            </p-button>
                            <p-button
                                [label]="showOnlyActive ? 'Ver Todos' : 'Solo Activos'"
                                severity="secondary"
                                (onClick)="toggleActiveView()"
                                [label]="showOnlyActive ? 'Ver Todas' : 'Solo Activas'"
                    [icon]="showOnlyActive ? 'pi pi-eye' : 'pi pi-eye-slash'"
                                styleClass="w-full sm:w-auto p-button-outlined">
                            </p-button>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="nombre" style="min-width:12rem">
                        <div class="flex justify-content-center align-items-center">
                            <span class="hidden sm:inline">Nombre</span>
                            <span class="sm:hidden">Nom.</span>
                            <p-sortIcon field="nombre"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="email" style="min-width:15rem">
                        <div class="flex justify-content-center align-items-center">
                            Email
                            <p-sortIcon field="email"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="rol_nombre" style="min-width:8rem">
                        <div class="flex justify-content-center align-items-center">
                            <span class="hidden sm:inline">Rol</span>
                            <span class="sm:hidden">Rol</span>
                            <p-sortIcon field="rol_nombre"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="is_active" style="min-width:6rem">
                        <div class="flex justify-content-center align-items-center">
                            <span class="hidden sm:inline">Estado</span>
                            <span class="sm:hidden">Est.</span>
                            <p-sortIcon field="is_active"></p-sortIcon>
                        </div>
                    </th>
                    <th style="min-width:8rem">
                        <div class="flex justify-content-center align-items-center">
                            <span class="hidden sm:inline">Acciones</span>
                            <span class="sm:hidden">Acc.</span>
                        </div>
                    </th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
                <tr>
                    <td>
                        <div class="flex flex-col">
                            <span class="font-bold text-sm sm:text-base">{{ getFullName(user) }}</span>
                            <span class="text-xs text-gray-500 sm:hidden">{{ user.email }}</span>
                        </div>
                    </td>
                    <td class="hidden sm:table-cell">
                        <span class="font-medium">{{ user.email }}</span>
                    </td>
                    <td class="text-center">
                        <div class="flex flex-col items-center gap-1">
                            <p-tag
                                [value]="getRoleName(user.rol_id)"
                                [severity]="getRoleSeverity(user.rol_id)"
                                [rounded]="true"
                                styleClass="text-xs sm:text-sm">
                            </p-tag>
                            <!-- Indicador de último admin activo -->
                            <div *ngIf="isLastActiveAdmin(user)" class="mt-1">
                                <span class="text-xs text-orange-600 font-medium">⚠️ Último admin</span>
                            </div>
                        </div>
                    </td>
                    <td class="text-center">
                        <p-inputswitch
                            [(ngModel)]="user.is_active"
                            (onChange)="handleUserStatusToggle(user)"
                            [disabled]="shouldDisableUserToggle(user)"
                            [pTooltip]="getUserToggleTooltip(user)"
                            tooltipPosition="top">
                        </p-inputswitch>
                    </td>
                    <td class="text-center">
                        <div class="flex gap-1 sm:gap-2 justify-center">
                            <p-button
                                (click)="editUser(user)"
                                styleClass="custom-flat-icon-button custom-flat-icon-button-edit"
                                pTooltip="Editar usuario"
                                tooltipPosition="top">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">edit</i>
                                </ng-template>
                            </p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="5" class="text-center p-4">
                        <div class="flex flex-column align-items-center gap-3">
                            <i class="pi pi-users text-4xl text-gray-400"></i>
                            <span class="text-gray-500 text-sm sm:text-base">No se encontraron usuarios</span>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>
</div>

<!-- Modal para crear/editar usuario -->
<p-dialog
    [(visible)]="showDialog"
    [style]="{width: '95vw', maxWidth: '600px'}"
    [header]="isEditMode ? 'Editar Usuario' : 'Crear Usuario'"
    [modal]="true"
    styleClass="p-fluid"
    [dismissableMask]="true"
    [draggable]="false"
    [resizable]="false">

    <ng-template pTemplate="content">
        <!-- Alerta Modal -->
        <app-modal-alert
            [alert]="modalAlert"
            (close)="hideModalAlert()">
        </app-modal-alert>

        <form [formGroup]="userForm" class="grid grid-cols-1 gap-4">
            <!-- Nombre -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">person</span>
                <input
                    id="nombre"
                    type="text"
                    formControlName="nombre"
                    placeholder=" "
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    [class.border-red-500]="userForm.get('nombre')?.invalid && userForm.get('nombre')?.touched"
                    [class.border-gray-300]="!userForm.get('nombre')?.invalid || !userForm.get('nombre')?.touched" />
                <label for="nombre" class="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[var(--primary-color)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-10">Nombre <span class="text-red-500">*</span></label>
                <div *ngIf="userForm.get('nombre')?.invalid && userForm.get('nombre')?.touched" class="text-red-500 text-xs mt-1 ml-10">El nombre es requerido</div>
            </div>

            <!-- Apellido Paterno -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">person</span>
                <input
                    id="apellido_paterno"
                    type="text"
                    formControlName="apellido_paterno"
                    placeholder=" "
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    [class.border-red-500]="userForm.get('apellido_paterno')?.invalid && userForm.get('apellido_paterno')?.touched"
                    [class.border-gray-300]="!userForm.get('apellido_paterno')?.invalid || !userForm.get('apellido_paterno')?.touched" />
                <label for="apellido_paterno" class="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[var(--primary-color)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-10">Apellido Paterno <span class="text-red-500">*</span></label>
                <div *ngIf="userForm.get('apellido_paterno')?.invalid && userForm.get('apellido_paterno')?.touched" class="text-red-500 text-xs mt-1 ml-10">El apellido paterno es requerido</div>
            </div>

            <!-- Apellido Materno -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">person</span>
                <input
                    id="apellido_materno"
                    type="text"
                    formControlName="apellido_materno"
                    placeholder=" "
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    [class.border-gray-300]="true" />
                <label for="apellido_materno" class="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[var(--primary-color)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-10">Apellido Materno <span class="text-gray-400">(opcional)</span></label>
            </div>

            <!-- Email -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">email</span>
                <input
                    id="email"
                    type="email"
                    formControlName="email"
                    placeholder=" "
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    [class.border-red-500]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                    [class.border-gray-300]="!userForm.get('email')?.invalid || !userForm.get('email')?.touched" />
                <label for="email" class="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[var(--primary-color)] peer-focus:scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 start-10">Email <span class="text-red-500">*</span></label>
                <div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched" class="text-red-500 text-xs mt-1 ml-10">Email válido es requerido</div>
            </div>

            <!-- Contraseña (solo para crear) -->
            <div *ngIf="!isEditMode" class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">lock</span>
                <p-password
                    id="password"
                    formControlName="password"
                    placeholder=" "
                    styleClass="w-full"
                    inputStyleClass="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    [class.border-red-500]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                    [class.border-gray-300]="!userForm.get('password')?.invalid || !userForm.get('password')?.touched"
                    [feedback]="true"
                    [toggleMask]="true">
                </p-password>
                <label for="password" class="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[var(--primary-color)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-10">Contraseña <span class="text-red-500">*</span></label>
                <div *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched" class="text-red-500 text-xs mt-1 ml-10">La contraseña es requerida (mínimo 8 caracteres)</div>
            </div>

            <!-- Rol -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">admin_panel_settings</span>
                <p-dropdown
                    id="rol_id"
                    [options]="rolesDb"
                    formControlName="rol_id"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar rol"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 pl-16 pr-4'"
                    [showClear]="false"
                    [filter]="false"
                    [class.border-red-500]="userForm.get('rol_id')?.invalid && userForm.get('rol_id')?.touched"
                    [class.border-gray-300]="!userForm.get('rol_id')?.invalid || !userForm.get('rol_id')?.touched"
                    scrollHeight="150px"
                    [virtualScroll]="false"
                    [appendTo]="'body'"
                    (onShow)="onDropdownOpen($event)"
                    (onHide)="onDropdownClose($event)">
                    <ng-template pTemplate="selectedItem" let-role>
                        <div class="flex items-center justify-start h-full w-full">
                            <span class="font-medium">{{ role.nombre }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-role>
                        <div class="flex items-center justify-start h-full w-full">
                            <span class="font-medium">{{ role.nombre }}</span>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute text-base text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[var(--primary-color)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-9">Rol <span class="text-red-500">*</span></label>
                <div *ngIf="userForm.get('rol_id')?.invalid && userForm.get('rol_id')?.touched" class="text-red-500 text-xs mt-1 ml-16">El rol es requerido</div>
            </div>
        </form>
    </ng-template>

    <ng-template pTemplate="footer">
        <div class="flex flex-col sm:flex-row gap-2 justify-content-end">
            <p-button
                label="Cancelar"
                [text]="true"
                (onClick)="hideDialog()"
                class="w-full sm:w-auto">
            </p-button>
            <p-button
                [label]="isEditMode ? 'Actualizar' : 'Crear'"
                [loading]="saving()"
                [disabled]="userForm.invalid || saving()"
                (onClick)="saveUser()"
                class="w-full sm:w-auto">
            </p-button>
        </div>
    </ng-template>
</p-dialog>

<!-- Modal de confirmación personalizado -->
<p-dialog
    [(visible)]="showCustomConfirm"
    [style]="{width: '95vw', maxWidth: '400px'}"
    header="Confirmar Acción"
    [modal]="true"
    [dismissableMask]="false"
    [resizable]="false">

    <ng-template pTemplate="content">
        <div class="flex align-items-center gap-3 p-4">
            <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
            <span class="text-sm sm:text-base">{{ confirmMessage }}</span>
        </div>
    </ng-template>

    <ng-template pTemplate="footer">
        <div class="flex flex-col sm:flex-row gap-2 justify-content-end">
            <p-button
                label="No"
                severity="danger"
                [outlined]="true"
                (onClick)="showCustomConfirm = false"
                class="w-full sm:w-auto">
            </p-button>
            <p-button
                label="Sí"
                severity="danger"
                (onClick)="executeConfirmAction()"
                class="w-full sm:w-auto">
            </p-button>
        </div>
    </ng-template>
</p-dialog>
    `,
    styleUrls: ['./users-crud.component.scss'],
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
            flex-shrink: 0 !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
            overflow-y: auto !important;
            max-height: calc(90vh - 120px) !important;
            padding: 1.5rem !important;
        }

        /* Estilos para inputs modernos con iconos */
        .peer:focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        .peer:hover {
            border-color: #9ca3af !important;
        }

        /* Estilos para campos con errores */
        .border-red-500 {
            border-color: #ef4444 !important;
        }

        .border-gray-300 {
            border-color: #d1d5db !important;
        }

        /* Estilos para mensajes de error */
        .text-red-500 {
            color: #ef4444 !important;
        }

        .text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
        }

        .mt-1 {
            margin-top: 0.25rem !important;
        }

        .ml-10 {
            margin-left: 2.5rem !important;
        }

        /* Estilos para dropdown de roles */
        :host ::ng-deep .p-dropdown {
            height: 3rem !important;
            border-radius: 0.5rem !important;
            border: 1px solid #d1d5db !important;
            background-color: transparent !important;
            transition: all 0.3s ease !important;
            width: 100% !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            padding-left: 2.5rem !important;
            height: 3rem !important;
            font-size: 0.875rem !important;
            color: #111827 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled):hover {
            border-color: #9ca3af !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled).p-focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-trigger {
            width: 2.5rem !important;
            color: #6b7280 !important;
        }

        /* Estilos para p-password */
        :host ::ng-deep .p-password {
            width: 100% !important;
        }

        :host ::ng-deep .p-password .p-password-input {
            padding-left: 2.5rem !important;
            height: 3rem !important;
            border-radius: 0.5rem !important;
            border: 1px solid #d1d5db !important;
            background-color: transparent !important;
            font-size: 0.875rem !important;
            color: #111827 !important;
            transition: all 0.3s ease !important;
            width: 100% !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        :host ::ng-deep .p-password .p-password-input:focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .p-password .p-password-input:hover {
            border-color: #9ca3af !important;
        }

        /* Prevenir scroll en el modal cuando el dropdown está abierto */
        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open {
            overflow: hidden !important;
            pointer-events: none !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open .p-dropdown {
            pointer-events: auto !important;
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

        /* Estilos mejorados para el dropdown del rol */
        :host ::ng-deep .p-dropdown {
            border-radius: 8px !important;
            border: 1px solid #d1d5db !important;
            transition: all 0.2s ease-in-out !important;
        }

        :host ::ng-deep .p-dropdown:hover {
            border-color: #9ca3af !important;
        }

        :host ::ng-deep .p-dropdown.p-focus {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-trigger {
            color: #6b7280 !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            color: #374151 !important;
            font-weight: 500 !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder {
            color: #9ca3af !important;
            font-weight: 400 !important;
        }

        /* Estilos para el switch personalizado con color verde */
        :host ::ng-deep .p-inputswitch-slider {
            background: #e5e7eb !important;
            border-color: #e5e7eb !important;
        }

        :host ::ng-deep .p-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
            background: #12A883 !important;
            border-color: #12A883 !important;
        }

        :host ::ng-deep .p-inputswitch .p-inputswitch-slider:before {
            background: #ffffff !important;
        }`
    ]
})
export class UsersCrudComponent implements OnInit {
    @ViewChild('dt') table!: Table;

    // Signals para estados reactivos
    loading = signal<boolean>(false);
    saving = signal<boolean>(false);
    users = signal<User[]>([]);
    filteredUsers = signal<User[]>([]);

    // Estados del modal
    showDialog = false;
    showCustomConfirm = false;
    isEditMode = false;

    // Modal de confirmación personalizado
    confirmMessage = '';
    confirmAction: (() => void) | null = null;

    // Formularios
    userForm!: FormGroup;

    // Datos auxiliares
    selectedUser: User | null = null;
    rolesDb: any[] = [
        { id: 1, nombre: 'admin' },
        { id: 2, nombre: 'operador' },
        { id: 3, nombre: 'recepcionista' }
    ];
    currentUserId: number | null = null; // Se obtiene del servicio de autenticación

    // Filtros
    showOnlyActive = true;
    modalAlert: ModalAlert = { show: false, type: 'error', title: '', message: '' };

    // Columnas de la tabla
    cols: Column[] = [
        { field: 'full_name', header: 'Nombre Completo' },
        { field: 'email', header: 'Email' },
        { field: 'rol_id', header: 'Rol' },
        { field: 'is_active', header: 'Estado' }
    ];

    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,

        private oauthService: OAuthService,
        private modalAlertService: ModalAlertService,
        private sanitizer: DomSanitizer
    ) {
        this.initForms();
    }

    ngOnInit() {
        this.loadCurrentUser();
        this.loadUsers();
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

    loadCurrentUser() {
        const currentUser = this.oauthService.getCurrentUser();
        if (currentUser && currentUser.id) {
            this.currentUserId = currentUser.id;
        } else {
            this.currentUserId = null;
        }
    }



    private initForms() {
        // Formulario principal de usuario
        this.userForm = this.fb.group({
            nombre: ['', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras y espacios
            ]],
            apellido_paterno: ['', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/) // Solo letras y espacios
            ]],
            apellido_materno: ['', [
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/) // Solo letras y espacios (opcional)
            ]],
            email: ['', [
                Validators.required,
                Validators.email,
                Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // Email válido
            ]],
            password: ['', [
                Validators.minLength(8),
                Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/) // Contraseña segura
            ]],
            rol_id: [null, [
                Validators.required
            ]],
            is_active: [true]
        });
    }

    // Cargar datos
    loadUsers() {
        this.loading.set(true);

        const filters = this.showOnlyActive ? { is_active: true } : {};

        this.userService.getUsers(filters).subscribe({
            next: (users) => {
                // Sanitizar usuarios recibidos
                const sanitizedUsers = users.map(user => this.sanitizeUser(user));
                this.users.set(sanitizedUsers);
                this.updateFilteredUsers();
                this.loading.set(false);
            },
            error: (error) => {
                this.showModalAlert('error', 'Error de conexión', this.sanitizeMessage('Error al cargar los usuarios: ' + error.message));
                this.loading.set(false);
            }
        });
    }

    // Filtros y búsqueda
    toggleActiveView() {
        this.showOnlyActive = !this.showOnlyActive;
        this.loadUsers();
    }

    updateFilteredUsers() {
        const users = this.users();

        if (this.showOnlyActive) {
            this.filteredUsers.set(users.filter(user => user.is_active));
        } else {
            this.filteredUsers.set(users);
        }
    }

    onGlobalFilter(event: Event) {
        const target = event.target as HTMLInputElement;
        this.table.filterGlobal(target.value, 'contains');
    }

    // ===== VALIDACIONES DE SEGURIDAD =====

    /**
     * Verifica si un usuario es el último administrador activo
     */
    isLastActiveAdmin(user: User): boolean {
        if (user.rol_id !== 1) return false; // Solo verificar administradores

        const activeAdmins = this.users().filter(u =>
            u.rol_id === 1 && u.is_active && u.id !== user.id
        );

        return activeAdmins.length === 0 && (user.is_active ?? false);
    }

    /**
     * Verifica si se debe deshabilitar el toggle de un usuario
     */
    shouldDisableUserToggle(user: User): boolean {
        // 1. No permitir auto-desactivación
        if (this.currentUserId && user.id === this.currentUserId) {
            return true;
        }

        // 2. No permitir desactivar al último admin activo
        if (this.isLastActiveAdmin(user)) {
            return true;
        }

        // 3. No permitir si está cargando
        if (this.loading()) {
            return true;
        }

        return false;
    }

    /**
     * Obtiene el tooltip apropiado para el toggle de usuario
     */
    getUserToggleTooltip(user: User): string {
        if (this.currentUserId && user.id === this.currentUserId) {
            return 'No puedes desactivarte a ti mismo';
        }

        if (this.isLastActiveAdmin(user)) {
            return 'No puedes desactivar al último administrador activo';
        }

        if (this.loading()) {
            return 'Cargando...';
        }

        return user.is_active ?
            'Haz clic para desactivar' :
            'Haz clic para reactivar';
    }

    /**
     * Maneja el toggle de estado del usuario con validaciones
     */
    handleUserStatusToggle(user: User) {
        const newStatus = user.is_active;

        // Validaciones de seguridad
        if (this.currentUserId && user.id === this.currentUserId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No puedes desactivarte a ti mismo',
                life: 3000
            });
            // Revertir el cambio
            user.is_active = !newStatus;
            return;
        }

        // Verificar si es el último admin activo
        if (this.isLastActiveAdmin(user)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No puedes desactivar al último administrador activo',
                life: 3000
            });
            // Revertir el cambio
            user.is_active = !newStatus;
            return;
        }

        // Confirmación para desactivar administradores
        if (user.rol_id === 1 && !newStatus) {
            this.confirmationService.confirm({
                message: '¿Estás seguro de que quieres desactivar a este administrador?',
                header: 'Confirmar desactivación',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sí',
                rejectLabel: 'No',
                acceptButtonStyleClass: 'p-button-warning',
                rejectButtonStyleClass: 'p-button-warning p-button-outlined',
                accept: () => {
                    this.toggleUserStatus(user);
                },
                reject: () => {
                    // Revertir el cambio
                    user.is_active = !newStatus;
                }
            });
            return;
        }

        // Confirmación para desactivar usuarios normales
        if (!newStatus) {
            const sanitizedName = this.sanitizeString(user.nombre);
            this.confirmationService.confirm({
                message: `¿Estás seguro de que quieres desactivar al usuario "${sanitizedName}"?`,
                header: 'Confirmar desactivación',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sí',
                rejectLabel: 'No',
                acceptButtonStyleClass: 'p-button-warning',
                rejectButtonStyleClass: 'p-button-warning p-button-outlined',
                accept: () => {
                    this.toggleUserStatus(user);
                },
                reject: () => {
                    // Revertir el cambio
                    user.is_active = !newStatus;
                }
            });
            return;
        }

        // Si es activación, proceder directamente
        this.toggleUserStatus(user);
    }

    // Toggle user status - Activar/Desactivar usuario
    toggleUserStatus(user: User) {
        // Capturar el estado actual que queremos enviar al backend
        const newStatus = user.is_active;

        this.userService.toggleUserStatus(user.id!, newStatus!).subscribe({
            next: (updatedUser) => {
                // Actualizar el usuario en la lista local
                const users = this.users();
                const index = users.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    users[index] = this.sanitizeUser({ ...users[index], is_active: updatedUser.is_active });
                    this.users.set([...users]);
                    this.updateFilteredUsers();
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `Usuario ${updatedUser.is_active ? 'activado' : 'desactivado'} correctamente`,
                    life: 3000
                });
            },
            error: (error) => {
                // Revertir el cambio en caso de error
                user.is_active = !newStatus;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: this.sanitizeMessage('Error al cambiar el estado del usuario: ' + error.message),
                    life: 3000
                });
            }
        });
    }

    // CRUD Operations
    openNew() {
        this.selectedUser = null;
        this.isEditMode = false;
        this.resetForm();
        this.hideModalAlert(); // Restablecer alertas al abrir modal

        // La contraseña es requerida solo al crear
        this.userForm.get('password')?.setValidators([
            Validators.required,
            Validators.minLength(8)
        ]);
        this.userForm.get('password')?.updateValueAndValidity();

        this.showDialog = true;
    }

    editUser(user: User) {
        this.selectedUser = { ...user };
        this.isEditMode = true;
        this.populateForm(user);
        this.hideModalAlert(); // Restablecer alertas al abrir modal

        // La contraseña no es requerida al editar
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

        this.showDialog = true;
    }

    saveUser() {
        if (this.userForm.invalid) {
            this.markFormGroupTouched(this.userForm);
            return;
        }

        this.saving.set(true);
        const formValue = this.userForm.value;

        // Sanitizar datos antes de enviar
        const sanitizedFormValue = {
            nombre: this.sanitizeString(formValue.nombre),
            apellido_paterno: this.sanitizeString(formValue.apellido_paterno),
            apellido_materno: this.sanitizeString(formValue.apellido_materno),
            email: this.sanitizeEmail(formValue.email),
            password: formValue.password ? this.sanitizeString(formValue.password) : '',
            rol_id: this.sanitizeNumber(formValue.rol_id),
            is_active: Boolean(formValue.is_active)
        };

        if (this.isEditMode && this.selectedUser?.id) {
            // Actualizar usuario existente
            const updateData: UserUpdateRequest = {
                nombre: sanitizedFormValue.nombre,
                apellido_paterno: sanitizedFormValue.apellido_paterno,
                apellido_materno: sanitizedFormValue.apellido_materno,
                email: sanitizedFormValue.email,
                rol_id: sanitizedFormValue.rol_id,
                is_active: sanitizedFormValue.is_active
            };

            this.userService.updateUser(this.selectedUser.id, updateData).subscribe({
                next: (updatedUser) => {
                    this.showModalAlert('success', 'Éxito', 'Usuario actualizado correctamente');
                    this.loadUsers();
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    this.showModalAlert('error', 'Error', this.sanitizeMessage('Error al actualizar el usuario: ' + error.message));
                    this.saving.set(false);
                }
            });
        } else {
            // Crear nuevo usuario
            const createData: UserCreateRequest = {
                nombre: sanitizedFormValue.nombre,
                apellido_paterno: sanitizedFormValue.apellido_paterno,
                apellido_materno: sanitizedFormValue.apellido_materno,
                email: sanitizedFormValue.email,
                password: sanitizedFormValue.password,
                rol_id: sanitizedFormValue.rol_id,
                is_active: sanitizedFormValue.is_active
            };

            this.userService.createUser(createData).subscribe({
                next: (newUser) => {
                    this.showModalAlert('success', 'Éxito', 'Usuario creado correctamente');
                    this.loadUsers();
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    this.showModalAlert('error', 'Error', this.sanitizeMessage('Error al crear el usuario: ' + error.message));
                    this.saving.set(false);
                }
            });
        }
    }

    // Utilidades de formulario
    private resetForm() {
        this.userForm.reset({
            nombre: '',
            apellido_paterno: '',
            apellido_materno: '',
            email: '',
            password: '',
            rol_id: null,
            is_active: true
        });
    }

    private populateForm(user: User) {
        this.userForm.patchValue({
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno,
            email: user.email,
            rol_id: user.rol_id,
            is_active: user.is_active
        });
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            control?.markAsTouched();
        });
    }

    // Utilidades de UI
    hideDialog() {
        this.showDialog = false;
        this.selectedUser = null;
        this.resetForm();
        this.hideModalAlert(); // Restablecer alertas al cerrar modal
    }

    executeConfirmAction() {
        if (this.confirmAction) {
            this.confirmAction();
            this.confirmAction = null;
        }
    }

    getInitials(user: User): string {
        if (!user.nombre && !user.apellido_paterno) {
            return user.email?.charAt(0).toUpperCase() || 'U';
        }
        const first = user.nombre?.charAt(0) || '';
        const last = user.apellido_paterno?.charAt(0) || '';
        return (first + last).toUpperCase();
    }

    formatDate(dateString: string): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Métodos auxiliares para el template
    getFullName(user: User): string {
        return this.userService.getFullName(user);
    }

    getRoleName(rolId: number): string {
        return this.userService.getRoleName(rolId);
    }

    getRoleSeverity(rolId: number): 'success' | 'info' | 'warning' | 'danger' {
        switch (rolId) {
            case 1: return 'danger';   // Administrador - rojo
            case 2: return 'info';     // Operador - azul
            case 3: return 'warning';  // Recepcionista - amarillo
            default: return 'info';
        }
    }

    // Responsive
    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        // Lógica para manejar cambios de tamaño si es necesario
    }

    // MÉTODOS DE SANITIZACIÓN
    private sanitizeUser(user: User): User {
        return {
            ...user,
            nombre: this.sanitizeString(user.nombre),
            apellido_paterno: this.sanitizeString(user.apellido_paterno),
            apellido_materno: this.sanitizeString(user.apellido_materno),
            email: this.sanitizeEmail(user.email),
            rol_nombre: user.rol_nombre ? this.sanitizeString(user.rol_nombre) : ''
        };
    }



    private sanitizeString(value: string | undefined): string {
        if (!value || typeof value !== 'string') return '';

        // Remover caracteres peligrosos y limitar longitud
        return value
            .replace(/[<>]/g, '') // Remover < y >
            .replace(/javascript:/gi, '') // Remover javascript:
            .replace(/on\w+=/gi, '') // Remover event handlers
            .substring(0, 100); // Limitar longitud
    }

    private sanitizeEmail(value: string | undefined): string {
        if (!value || typeof value !== 'string') return '';

        // Validar formato de email y sanitizar
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const sanitized = this.sanitizeString(value);

        return emailRegex.test(sanitized) ? sanitized : '';
    }

    private sanitizeNumber(value: any): number {
        if (value === null || value === undefined) return 0;
        const num = Number(value);
        return isNaN(num) ? 0 : Math.max(0, num);
    }

    private sanitizeMessage(message: string): string {
        return this.sanitizeString(message);
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
