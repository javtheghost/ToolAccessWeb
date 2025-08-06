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
import { RoleService, Role } from '../service/role.service';
import { OAuthService } from '../service/oauth.service';
import { User, UserCreateRequest, UserUpdateRequest, AVAILABLE_ROLES } from '../interfaces';
import { ModalAlertService, ModalAlert } from '../utils/modal-alert.service';
import { ModalAlertComponent } from '../utils/modal-alert.component';

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
<div class="p-6">
    <!-- Loading State -->
    <div *ngIf="loading()" class="space-y-4">
        <!-- Header siempre visible -->
        <div class="flex items-center justify-between">
            <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Usuarios</h5>
        </div>
        <div class="flex items-center justify-between gap-4 mt-2">
            <p-iconfield>
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" placeholder="Buscar usuarios..." disabled class="w-80" />
            </p-iconfield>
            <div class="flex gap-2">
                <p-button label="Crear Usuario" icon="pi pi-plus" (onClick)="openNew()" [disabled]="true"></p-button>
                <p-button
                    [label]="showOnlyActive ? 'Ver Todos' : 'Solo Activos'"
                    [icon]="showOnlyActive ? 'pi pi-eye' : 'pi pi-eye-slash'"
                    severity="secondary"
                    size="small"
                    [disabled]="true">
                </p-button>
            </div>
        </div>

        <!-- Skeleton para toda la tabla -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header skeleton -->
            <div class="bg-[#6ea1cc] text-white p-3">
                <div class="flex items-center space-x-4">
                    <p-skeleton height="1.5rem" width="60px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="150px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                </div>
            </div>
            <!-- Filas skeleton -->
            <div class="p-4 space-y-3">
                <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <p-skeleton height="2rem" width="2rem" styleClass="rounded-full"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="180px"></p-skeleton>
                    <p-skeleton height="1rem" width="100px"></p-skeleton>
                    <p-skeleton height="1rem" width="60px"></p-skeleton>
                    <p-skeleton height="1rem" width="100px"></p-skeleton>
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
            [globalFilterFields]="['nombre', 'email', 'apellido_paterno', 'apellido_materno', 'rol_nombre']"
            [scrollable]="false"
            [loading]="loading()"
            styleClass="p-datatable-gridlines"
            [rowHover]="true"
            dataKey="id"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
            [showCurrentPageReport]="true">

            <ng-template pTemplate="caption">
                <div class="space-y-4">
                    <!-- Header siempre visible -->
                    <div class="flex items-center justify-between">
                        <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Usuarios</h5>
                    </div>
                    <div class="flex items-center justify-between gap-4 mt-2">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input
                                pInputText
                                type="text"
                                (input)="onGlobalFilter($event)"
                                placeholder="Buscar usuarios..."
                                class="w-80" />
                        </p-iconfield>
                        <div class="flex gap-2">
                            <p-button
                                label="Crear Usuario"
                                icon="pi pi-plus"
                                (onClick)="openNew()">
                            </p-button>
                            <p-button
                                [label]="showOnlyActive ? 'Ver Todos' : 'Solo Activos'"
                                [icon]="showOnlyActive ? 'pi pi-eye' : 'pi pi-eye-slash'"
                                severity="secondary"
                                size="small"
                                (onClick)="toggleActiveView()"
                                pTooltip="Alternar vista de usuarios activos/todos">
                            </p-button>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="nombre" style="min-width:15rem">
                        <div class="flex justify-content-center align-items-center">
                            Nombre
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
                            Rol
                            <p-sortIcon field="rol_nombre"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="is_active" style="min-width:8rem">
                        <div class="flex justify-content-center align-items-center">
                            Estado
                            <p-sortIcon field="is_active"></p-sortIcon>
                        </div>
                    </th>
                    <th style="min-width:12rem">Acciones</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
                <tr>
                    <td>
                        <span class="font-bold">{{ getFullName(user) }}</span>
                    </td>
                    <td>
                        <span class="font-medium">{{ user.email }}</span>
                    </td>
                    <td class="text-center">
                        <p-tag
                            [value]="getRoleName(user.rol_id)"
                            [severity]="getRoleSeverity(user.rol_id)"
                            [rounded]="true">
                        </p-tag>
                        <!-- Indicador de último admin activo -->
                        <div *ngIf="isLastActiveAdmin(user)" class="mt-1">
                            <span class="text-xs text-orange-600 font-medium">⚠️ Último admin activo</span>
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
                    <td>
                        <div class="flex gap-2">
                            <p-button
                                (click)="editUser(user)"
                                styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
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
                            <span class="text-gray-500">No se encontraron usuarios</span>
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
    [style]="{width: '600px'}"
    [header]="isEditMode ? 'Editar Usuario' : 'Crear Usuario'"
    [modal]="true"
    styleClass="p-fluid"
    [dismissableMask]="true"
    [draggable]="false">

    <ng-template pTemplate="content">
        <!-- Alerta Modal -->
        <app-modal-alert 
            [alert]="modalAlert" 
            (close)="hideModalAlert()">
        </app-modal-alert>
        
        <form [formGroup]="userForm" class="grid formgrid p-4">
            <!-- Nombre -->
            <div class="field col-12 md:col-6">
                <label for="nombre" class="font-semibold">Nombre *</label>
                <input
                    id="nombre"
                    type="text"
                    pInputText
                    formControlName="nombre"
                    placeholder="Ingrese nombre"
                    [class.ng-invalid]="userForm.get('nombre')?.invalid && userForm.get('nombre')?.touched"
                    class="w-full" />
                <small
                    *ngIf="userForm.get('nombre')?.invalid && userForm.get('nombre')?.touched"
                    class="p-error">
                    El nombre es requerido
                </small>
            </div>

            <!-- Apellido Paterno -->
            <div class="field col-12 md:col-6">
                <label for="apellido_paterno" class="font-semibold">Apellido Paterno *</label>
                <input
                    id="apellido_paterno"
                    type="text"
                    pInputText
                    formControlName="apellido_paterno"
                    placeholder="Ingrese apellido paterno"
                    [class.ng-invalid]="userForm.get('apellido_paterno')?.invalid && userForm.get('apellido_paterno')?.touched"
                    class="w-full" />
                <small
                    *ngIf="userForm.get('apellido_paterno')?.invalid && userForm.get('apellido_paterno')?.touched"
                    class="p-error">
                    El apellido paterno es requerido
                </small>
            </div>

            <!-- Apellido Materno -->
            <div class="field col-12 md:col-6">
                <label for="apellido_materno" class="font-semibold">Apellido Materno</label>
                <input
                    id="apellido_materno"
                    type="text"
                    pInputText
                    formControlName="apellido_materno"
                    placeholder="Ingrese apellido materno (opcional)"
                    class="w-full" />
            </div>

            <!-- Email -->
            <div class="field col-12 md:col-6">
                <label for="email" class="font-semibold">Email *</label>
                <input
                    id="email"
                    type="email"
                    pInputText
                    formControlName="email"
                    placeholder="usuario@ejemplo.com"
                    [class.ng-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                    class="w-full" />
                <small
                    *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched"
                    class="p-error">
                    Email válido es requerido
                </small>
            </div>

            <!-- Contraseña (solo para crear) -->
            <div *ngIf="!isEditMode" class="field col-12 md:col-6">
                <label for="password" class="font-semibold">Contraseña *</label>
                <p-password
                    id="password"
                    formControlName="password"
                    placeholder="Ingrese contraseña"
                    [class.ng-invalid]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                    [feedback]="true"
                    [toggleMask]="true">
                </p-password>
                <small
                    *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched"
                    class="p-error">
                    La contraseña es requerida (mínimo 8 caracteres)
                </small>
            </div>

            <!-- Rol -->
            <div class="field col-12 md:col-6">
                <label for="rol_id" class="font-semibold">Rol *</label>
                <p-dropdown
                    id="rol_id"
                    [options]="rolesDb"
                    formControlName="rol_id"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar rol"
                    [class.ng-invalid]="userForm.get('rol_id')?.invalid && userForm.get('rol_id')?.touched"
                    styleClass="w-full"
                    scrollHeight="150px"
                    [virtualScroll]="false"
                    [appendTo]="'body'">
                </p-dropdown>
                <small
                    *ngIf="userForm.get('rol_id')?.invalid && userForm.get('rol_id')?.touched"
                    class="p-error">
                    El rol es requerido
                </small>
            </div>

            <!-- Estado Activo eliminado del modal -->
        </form>
    </ng-template>

    <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-content-end">
            <p-button
                label="Cancelar"
                icon="pi pi-times"
                [text]="true"
                (onClick)="hideDialog()">
            </p-button>
            <p-button
                [label]="isEditMode ? 'Actualizar' : 'Crear'"
                [icon]="isEditMode ? 'pi pi-check' : 'pi pi-plus'"
                [loading]="saving()"
                [disabled]="userForm.invalid || saving()"
                (onClick)="saveUser()">
            </p-button>
        </div>
    </ng-template>
</p-dialog>

<!-- Modal de confirmación personalizado -->
<p-dialog
    [(visible)]="showCustomConfirm"
    [style]="{width: '400px'}"
    header="Confirmar Acción"
    [modal]="true"
    [dismissableMask]="false">

    <ng-template pTemplate="content">
        <div class="flex align-items-center gap-3 p-4">
            <i class="pi pi-exclamation-triangle text-orange-500 text-2xl"></i>
            <span>{{ confirmMessage }}</span>
        </div>
    </ng-template>

    <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-content-end">
            <p-button
                label="No"
                icon="pi pi-times"
                severity="danger"
                [outlined]="true"
                (onClick)="showCustomConfirm = false">
            </p-button>
            <p-button
                label="Sí"
                icon="pi pi-check"
                severity="danger"
                (onClick)="executeConfirmAction()">
            </p-button>
        </div>
    </ng-template>
</p-dialog>
    `,
    styleUrls: ['./users-crud.component.scss'],
    styles: [
        `/* Estilos para el switch personalizado con color verde */
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
    rolesDb: Role[] = [];
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
        private roleService: RoleService,
        private oauthService: OAuthService,
        private modalAlertService: ModalAlertService
    ) {
        this.initForms();
    }

    ngOnInit() {
        this.loadCurrentUser();
        this.loadUsers();
        this.loadRolesDb();
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
            console.log('👤 Usuario actual cargado:', currentUser.nombre, 'ID:', currentUser.id);
        } else {
            console.warn('⚠️ No se pudo obtener el usuario actual');
            this.currentUserId = null;
        }
    }

    loadRolesDb() {
        this.roleService.getRoles().subscribe({
            next: (roles) => {
                this.rolesDb = roles.filter(r => r.is_active);
            },
            error: (err) => {
                this.rolesDb = [];
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los roles de la base de datos',
                    life: 3000
                });
            }
        });
    }

    private initForms() {
        // Formulario principal de usuario
        this.userForm = this.fb.group({
            nombre: ['', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50)
            ]],
            apellido_paterno: ['', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50)
            ]],
            apellido_materno: ['', [
                Validators.maxLength(50)
            ]],
            email: ['', [
                Validators.required,
                Validators.email
            ]],
            password: ['', [
                Validators.minLength(8)
            ]],
            rol_id: [null, [
                Validators.required
            ]],
            is_active: [true]
        });
    }

    // Cargar datos
    loadUsers() {
        console.log('🔄 Iniciando carga de usuarios desde la API...');
        this.loading.set(true);

        const filters = this.showOnlyActive ? { is_active: true } : {};
        console.log('🔍 Filtros aplicados:', filters);

        this.userService.getUsers(filters).subscribe({
            next: (users) => {
                console.log('✅ Usuarios recibidos de la API:', users);
                this.users.set(users);
                this.updateFilteredUsers();
                this.loading.set(false);
                console.log('📊 Estado final de usuarios:', this.users());
            },
            error: (error) => {
                console.error('❌ Error cargando usuarios desde API:', error);
                this.showModalAlert('error', 'Error de conexión', 'Error al cargar los usuarios: ' + error.message);
                this.loading.set(false);
            }
        });
    }

    // Filtros y búsqueda
    toggleActiveView() {
        this.showOnlyActive = !this.showOnlyActive;
        console.log(`🔍 Cambiando filtro de usuarios a: ${this.showOnlyActive ? 'Solo Activos' : 'Todos'}`);
        this.loadUsers();
    }

    updateFilteredUsers() {
        const users = this.users();
        console.log('📋 Usuarios antes del filtrado:', users);

        if (this.showOnlyActive) {
            this.filteredUsers.set(users.filter(user => user.is_active));
        } else {
            this.filteredUsers.set(users);
        }

        console.log('✅ Usuarios después del filtrado:', this.filteredUsers());
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
        console.log(`🔄 Intentando cambiar estado del usuario "${user.nombre}" (ID: ${user.id}) a: ${newStatus ? 'ACTIVO' : 'INACTIVO'}`);

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
            this.confirmationService.confirm({
                message: `¿Estás seguro de que quieres desactivar al usuario "${user.nombre}"?`,
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
        console.log(`🔄 Cambiando estado del usuario "${user.nombre}" (ID: ${user.id}) a: ${newStatus ? 'ACTIVO' : 'INACTIVO'}`);

        this.userService.toggleUserStatus(user.id!, newStatus!).subscribe({
            next: (updatedUser) => {
                console.log('✅ Respuesta del servidor para usuario:', updatedUser);

                // Actualizar el usuario en la lista local
                const users = this.users();
                const index = users.findIndex(u => u.id === user.id);
                if (index !== -1) {
                    users[index] = { ...users[index], is_active: updatedUser.is_active };
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
                console.error('❌ Error al cambiar estado del usuario:', error);

                // Revertir el cambio en caso de error
                user.is_active = !newStatus;

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado del usuario: ' + error.message,
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

        if (this.isEditMode && this.selectedUser?.id) {
            // Actualizar usuario existente
            const updateData: UserUpdateRequest = {
                nombre: formValue.nombre,
                apellido_paterno: formValue.apellido_paterno,
                apellido_materno: formValue.apellido_materno,
                email: formValue.email,
                rol_id: formValue.rol_id,
                is_active: formValue.is_active
            };

            this.userService.updateUser(this.selectedUser.id, updateData).subscribe({
                next: (updatedUser) => {
                    this.showModalAlert('success', 'Éxito', 'Usuario actualizado correctamente');
                    this.loadUsers();
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    this.showModalAlert('error', 'Error', 'Error al actualizar el usuario: ' + error.message);
                    this.saving.set(false);
                }
            });
        } else {
            // Crear nuevo usuario
            const createData: UserCreateRequest = {
                nombre: formValue.nombre,
                apellido_paterno: formValue.apellido_paterno,
                apellido_materno: formValue.apellido_materno,
                email: formValue.email,
                password: formValue.password,
                rol_id: formValue.rol_id,
                is_active: formValue.is_active
            };

            this.userService.createUser(createData).subscribe({
                next: (newUser) => {
                    this.showModalAlert('success', 'Éxito', 'Usuario creado correctamente');
                    this.loadUsers();
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    this.showModalAlert('error', 'Error', 'Error al crear el usuario: ' + error.message);
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
}
