import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { RoleService, Role, RoleCreateRequest, RoleUpdateRequest } from '../service/role.service';

@Component({
    selector: 'app-roles-crud',
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
        InputSwitchModule,
        InputIconModule,
        IconFieldModule,
        TooltipModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4 sm:p-6">
    <p-table
        #dt
        [value]="roles"
        [rows]="10"
        [paginator]="true"
                    [globalFilterFields]="['id', 'nombre', 'descripcion']"
        [scrollable]="true"
        styleClass="p-datatable-gridlines"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
        [showCurrentPageReport]="true"
        [responsive]="true"
        [scrollDirection]="'both'"
        scrollHeight="400px"
    >
        <ng-template pTemplate="caption">
            <div class="space-y-4">
                <!-- Header siempre visible -->
                <div class="flex items-center justify-between">
                    <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Administrar Roles</h5>
                </div>
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                    <p-iconfield class="w-full sm:w-80">
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar roles..." class="w-full" />
                    </p-iconfield>
                    <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <p-button
                            [label]="showActiveOnly ? 'Mostrar Todos' : 'Solo Activos'"
                            [icon]="showActiveOnly ? 'pi pi-eye' : 'pi pi-eye-slash'"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="toggleActiveFilter()"
                            pTooltip="Filtrar roles por estado"
                            tooltipPosition="top"
                            class="w-full sm:w-auto">
                        </p-button>
                        <p-button label="Crear Rol" icon="pi pi-plus" (onClick)="openNew()" class="w-full sm:w-auto"></p-button>
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
                    </div>
                </th>
                <th pSortableColumn="descripcion" style="min-width:15rem">
                    <div class="flex justify-content-center align-items-center">
                        <span class="hidden sm:inline">Descripción</span>
                        <span class="sm:hidden">Desc.</span>
                    </div>
                </th>
                <th pSortableColumn="is_active" style="min-width:6rem">
                    <div class="flex justify-content-center align-items-center">
                        <span class="hidden sm:inline">Estado</span>
                        <span class="sm:hidden">Est.</span>
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
        <ng-template pTemplate="body" let-role>
            <tr>
                <td>
                    <div class="flex flex-col">
                        <span class="font-bold text-sm sm:text-base">{{ role.nombre }}</span>
                        <span class="text-xs text-gray-500 sm:hidden">{{ role.descripcion }}</span>
                    </div>
                </td>
                <td class="hidden sm:table-cell">
                    <span class="font-medium">{{ role.descripcion }}</span>
                </td>
                <td class="text-center">
                    <p-inputswitch
                        [(ngModel)]="role.is_active"
                        (onChange)="toggleRoleStatus(role)"
                        [disabled]="role.id === 1"
                        pTooltip="Cambiar estado del rol"
                        tooltipPosition="top">
                    </p-inputswitch>
                </td>
                <td class="text-center">
                    <div class="flex gap-1 sm:gap-2 justify-center">
                        <p-button
                            *ngIf="role.id !== 1"
                            (click)="editRole(role)"
                            styleClass="custom-flat-icon-button custom-flat-icon-button-edit"
                            pTooltip="Editar rol"
                            tooltipPosition="top">
                            <ng-template pTemplate="icon">
                                <i class="material-symbols-outlined">edit</i>
                            </ng-template>
                        </p-button>
                        <span *ngIf="role.id === 1" class="text-gray-400 text-xs sm:text-sm">
                            Protegido
                        </span>
                    </div>
                </td>
            </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="4" class="text-center p-4">
                    <div class="flex flex-column align-items-center gap-3">
                        <i class="pi pi-shield text-4xl text-gray-400"></i>
                        <span class="text-gray-500 text-sm sm:text-base">No se encontraron roles</span>
                        <p-button
                            label="Crear primer rol"
                            icon="pi pi-plus"
                            size="small"
                            (onClick)="openNew()"
                            class="w-full sm:w-auto">
                        </p-button>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>
<p-dialog [(visible)]="roleDialog" [style]="{ width: '95vw', maxWidth: '600px' }" [modal]="true" [draggable]="false" [resizable]="false">
    <ng-template pTemplate="header">
        <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
            {{ isEditMode ? 'Editar Rol' : 'Nuevo Rol' }}
        </span>
    </ng-template>
    <ng-template pTemplate="content">
        <form [formGroup]="roleForm" (ngSubmit)="saveRole()">
            <div class="grid grid-cols-1 gap-4">
                <div class="relative col-span-1">
                    <span class="material-symbols-outlined absolute left-3 top-3 text-[var(--primary-color)] pointer-events-none z-20">person</span>
                    <input
                        type="text"
                        id="nombre"
                        formControlName="nombre"
                        class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder=" "
                        [class.border-red-500]="roleForm.get('nombre')?.invalid && roleForm.get('nombre')?.touched"
                        [class.border-gray-300]="!roleForm.get('nombre')?.invalid || !roleForm.get('nombre')?.touched" />
                    <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre <span class="text-red-500">*</span></label>
                    <div *ngIf="roleForm.get('nombre')?.invalid && roleForm.get('nombre')?.touched" class="text-red-500 text-xs mt-1 ml-10">
                        <span *ngIf="roleForm.get('nombre')?.errors?.['required']">El nombre es requerido</span>
                        <span *ngIf="roleForm.get('nombre')?.errors?.['minlength']">El nombre debe tener al menos 2 caracteres</span>
                        <span *ngIf="roleForm.get('nombre')?.errors?.['maxlength']">El nombre no puede exceder 50 caracteres</span>
                    </div>
                </div>
                <div class="relative col-span-1">
                    <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_document</span>
                    <textarea
                        id="descripcion"
                        formControlName="descripcion"
                        rows="3"
                        class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder=" "
                        [class.border-red-500]="roleForm.get('descripcion')?.invalid && roleForm.get('descripcion')?.touched"
                        [class.border-gray-300]="!roleForm.get('descripcion')?.invalid || !roleForm.get('descripcion')?.touched"
                        aria-label="Descripción"></textarea>
                    <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción <span class="text-gray-400">(opcional)</span></label>
                    <div *ngIf="roleForm.get('descripcion')?.invalid && roleForm.get('descripcion')?.touched" class="text-red-500 text-xs mt-1 ml-10">La descripción no puede exceder 200 caracteres</div>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()">Cancelar</button>
                <button pButton type="submit" class="p-button w-full sm:w-24" [disabled]="roleForm.invalid">Guardar</button>
            </div>
        </form>
    </ng-template>
</p-dialog>
<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-md relative mx-4">
    <!-- Tachita de cerrar -->
    <button type="button" (click)="onCustomConfirmReject()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="flex flex-col items-start">
      <i class="material-symbols-outlined text-4xl sm:text-6xl mb-4"
        [ngClass]="{
          'text-danger': confirmIcon === 'delete',
          'text-warning': confirmIcon === 'warning'
        }"
      >{{ confirmIcon }}</i>
      <div class="text-left mb-6">
        <div [innerHTML]="confirmMessage" class="text-sm sm:text-base"></div>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 self-end w-full sm:w-auto">
        <button type="button"
          class="custom-cancel-btn min-w-[120px] text-center font-semibold w-full sm:w-auto"
          (click)="onCustomConfirmReject()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="(confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning') + ' min-w-[120px] text-center font-semibold rounded w-full sm:w-auto'"
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
export class RolesCrudComponent implements OnInit {
    roles: Role[] = [];
    allRoles: Role[] = []; // Para almacenar todos los roles
    roleDialog: boolean = false;
    role: Role = this.emptyRole();
    selectedRoles: Role[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    showActiveOnly: boolean = false; // Filtro de activos
    @ViewChild('dt') dt!: Table;

    // NUEVO: variables para el modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    // NUEVO: FormGroup para validación
    roleForm!: FormGroup;

    private escListener: any;

    constructor(
        private messageService: MessageService,
        private roleService: RoleService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.initForm();
        this.loadRoles();
        this.setupEscListener();
    }

    // NUEVO: Inicializar formulario con validadores
    private initForm() {
        this.roleForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
            descripcion: ['', [Validators.maxLength(200)]],
        });
    }

    // NUEVO: Resetear formulario
    private resetForm() {
        this.roleForm.reset({
            nombre: '',
            descripcion: '',
        });
        this.roleForm.markAsUntouched();
        this.roleForm.markAsPristine();
        this.roleForm.updateValueAndValidity();
    }

    loadRoles() {
        this.roleService.getRoles().subscribe({
            next: (roles) => {
                this.allRoles = roles; // Guardar todos los roles
                this.applyActiveFilter(); // Aplicar filtro actual
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de conexión',
                    detail: 'No se pudo conectar con el servidor. Usando datos de demostración.',
                    life: 5000
                });
                // Fallback a datos dummy en caso de error
                this.loadDemoData();
            }
        });
    }

    ngOnDestroy() {
        window.removeEventListener('keydown', this.escListener);
    }

    loadDemoData() {
        this.allRoles = [
            {
                id: 1,
                nombre: 'Administrador',
                descripcion: 'Acceso completo al sistema',
                is_active: true
            },
            {
                id: 2,
                nombre: 'Operador',
                descripcion: 'Acceso básico para préstamos',
                is_active: true
            },
            {
                id: 3,
                nombre: 'Recepcionista',
                descripcion: 'Acceso limitado, gestionar ordenes, no modificar',
                is_active: false
            }
        ];
        this.applyActiveFilter();

        this.messageService.add({
            severity: 'info',
            summary: 'Modo demostración',
            detail: 'Usando datos locales. Verifique la conexión al servidor.',
            life: 5000
        });
    }

    applyActiveFilter() {
        if (this.showActiveOnly) {
            this.roles = this.allRoles.filter(role => role.is_active);
        } else {
            this.roles = [...this.allRoles];
        }
    }

    toggleActiveFilter() {
        this.showActiveOnly = !this.showActiveOnly;
        this.applyActiveFilter();

        this.messageService.add({
            severity: 'info',
            summary: 'Filtro actualizado',
            detail: this.showActiveOnly ? 'Mostrando solo roles activos' : 'Mostrando todos los roles',
            life: 2000
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }



    toggleRoleStatus(role: Role) {
        // No permitir cambiar el estado del rol de administrador (ID = 1)
        if (role.id === 1) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No se puede cambiar el estado del rol de Administrador por seguridad',
                life: 3000
            });

            // Encontrar el estado original del rol en nuestras listas
            const originalRoleAll = this.allRoles.find(r => r.id === 1);
            const originalRoleFiltered = this.roles.find(r => r.id === 1);

            // Revertir a su estado original en ambas listas
            if (originalRoleAll) {
                role.is_active = originalRoleAll.is_active;
            }
            if (originalRoleFiltered) {
                originalRoleFiltered.is_active = role.is_active;
            }

            return;
        }

        // Capturar el estado actual que queremos enviar al backend
        const newStatus = role.is_active;

        this.roleService.toggleRoleStatus(role.id!, newStatus).subscribe({
            next: (updatedRole) => {
                // Actualizar el rol en la lista completa
                const indexAll = this.allRoles.findIndex(r => r.id === role.id);
                if (indexAll !== -1) {
                    this.allRoles[indexAll] = { ...updatedRole };
                }

                // Actualizar el rol en la lista filtrada
                const index = this.roles.findIndex(r => r.id === role.id);
                if (index !== -1) {
                    this.roles[index] = { ...updatedRole };
                }

                // Reapliar filtro por si el cambio de estado afecta la visibilidad
                this.applyActiveFilter();

                this.messageService.add({
                    severity: 'success',
                    summary: 'Estado actualizado',
                    detail: `Rol ${updatedRole.is_active ? 'activado' : 'desactivado'} correctamente`,
                    life: 3000
                });
            },
            error: (error) => {
                // Revertir el cambio en caso de error
                role.is_active = !newStatus;

                // También revertir en las listas para mantener consistencia
                const indexAll = this.allRoles.findIndex(r => r.id === role.id);
                if (indexAll !== -1) {
                    this.allRoles[indexAll].is_active = !newStatus;
                }

                const index = this.roles.findIndex(r => r.id === role.id);
                if (index !== -1) {
                    this.roles[index].is_active = !newStatus;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado del rol: ' + error.message,
                    life: 3000
                });
            }
        });
    }

    openNew() {
        this.role = this.emptyRole();
        this.isEditMode = false;
        this.roleDialog = true;
        this.resetForm(); // Resetear el formulario al abrir el modal de nuevo
    }

    editRole(role: Role) {
        this.role = { ...role };
        this.isEditMode = true;
        this.roleDialog = true;
        this.roleForm.patchValue({
            nombre: this.role.nombre,
            descripcion: this.role.descripcion,
        });
        this.roleForm.markAsUntouched();
        this.roleForm.markAsPristine();
    }

    hideDialog() {
        this.roleDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
        this.resetForm(); // Resetear el formulario al cerrar el modal
    }

    saveRole() {
        if (this.roleForm.valid) {
            // Obtener los valores del formulario
            const formValues = this.roleForm.value;
            
            if (this.role.id && this.isEditMode) {
                // Modo edición - actualizar rol existente
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el rol <span class='text-primary'>${formValues.nombre}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const updateData: RoleUpdateRequest = {
                        nombre: formValues.nombre.trim(),
                        descripcion: formValues.descripcion?.trim() || '',
                        is_active: this.role.is_active
                    };

                    this.roleService.updateRole(this.role.id!, updateData).subscribe({
                        next: (updatedRole) => {
                            // Actualizar en la lista completa
                            const idxAll = this.allRoles.findIndex(r => r.id === this.role.id);
                            if (idxAll > -1) this.allRoles[idxAll] = updatedRole;

                            // Actualizar en la lista filtrada
                            const idx = this.roles.findIndex(r => r.id === this.role.id);
                            if (idx > -1) this.roles[idx] = updatedRole;

                            // Reapliar filtro
                            this.applyActiveFilter();

                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Rol actualizado correctamente',
                                life: 3000
                            });
                            this.roleDialog = false;
                            this.isEditMode = false;
                            this.role = this.emptyRole();
                            this.resetForm();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Error al actualizar el rol: ' + error.message,
                                life: 3000
                            });
                        }
                    });
                };
                this.showCustomConfirm = true;
            } else {
                // Modo creación - crear nuevo rol
                const createData: RoleCreateRequest = {
                    nombre: formValues.nombre.trim(),
                    descripcion: formValues.descripcion?.trim() || '',
                    is_active: this.role.is_active
                };

                this.roleService.createRole(createData).subscribe({
                    next: (newRole) => {
                        // Agregar a ambas listas
                        this.allRoles.push(newRole);
                        this.roles.push(newRole);

                        // Reapliar filtro
                        this.applyActiveFilter();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Rol creado correctamente',
                            life: 3000
                        });
                        this.roleDialog = false;
                        this.isEditMode = false;
                        this.role = this.emptyRole();
                        this.resetForm();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al crear el rol: ' + error.message,
                            life: 3000
                        });
                    }
                });
            }
        } else {
            // Marcar todos los campos como touched para mostrar errores
            this.markFormGroupTouched(this.roleForm);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor, complete todos los campos requeridos.',
                life: 3000
            });
        }
    }

    // NUEVO: Marcar todos los campos del formulario como touched
    private markFormGroupTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(key => {
            const control = formGroup.get(key);
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            } else {
                control?.markAsTouched();
            }
        });
    }

    // NUEVO: Configurar listener de tecla Escape
    private setupEscListener() {
        this.escListener = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                let closed = false;
                if (this.roleDialog) {
                    this.roleDialog = false;
                    this.isEditMode = false;
                    this.resetForm();
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

    // Métodos para el modal personalizado
    onCustomConfirmAccept() {
        if (this.confirmAction) this.confirmAction();
        this.showCustomConfirm = false;
    }
    onCustomConfirmReject() {
        this.showCustomConfirm = false;
    }

    createId(): number {
        // Para demo, usar un número aleatorio. En producción esto vendría del backend
        return Math.floor(Math.random() * 10000) + 1000;
    }

    emptyRole(): Role {
        return {
            nombre: '',
            descripcion: '',
            is_active: true
        };
    }
}
