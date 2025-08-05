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
import { RoleService, Role, RoleCreateRequest, RoleUpdateRequest } from '../service/role.service';

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
        [globalFilterFields]="['nombre', 'descripcion']"
        [scrollable]="false"
        styleClass="p-datatable-gridlines"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
        [showCurrentPageReport]="true"
    >
        <ng-template pTemplate="caption">
            <div class="space-y-4">
                <!-- Header siempre visible -->
                <div class="flex items-center justify-between">
                    <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Roles</h5>
                </div>
                <div class="flex items-center justify-between gap-4 mt-2">
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar roles..." class="w-80" />
                    </p-iconfield>
                    <div class="flex gap-2">
                        <p-button 
                            [label]="showActiveOnly ? 'Mostrar Todos' : 'Solo Activos'" 
                            [icon]="showActiveOnly ? 'pi pi-eye' : 'pi pi-eye-slash'"
                            severity="secondary"
                            [outlined]="true"
                            (onClick)="toggleActiveFilter()"
                            pTooltip="Filtrar roles por estado"
                            tooltipPosition="top">
                        </p-button>
                        <p-button label="Crear Rol" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                    </div>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr>
                <th pSortableColumn="nombre" style="min-width:15rem">
                    <div class="flex justify-content-center align-items-center">
                        Nombre
                    </div>
                </th>
                <th pSortableColumn="descripcion" style="min-width:20rem">
                    <div class="flex justify-content-center align-items-center">
                        Descripción
                    </div>
                </th>
                <th pSortableColumn="is_active" style="min-width:8rem">
                    <div class="flex justify-content-center align-items-center">
                        Estado
                    </div>
                </th>
                <th style="min-width:10rem">Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-role>
            <tr>
                <td>
                    <span class="font-bold">{{ role.nombre }}</span>
                </td>
                <td>
                    <span class="font-medium">{{ role.descripcion }}</span>
                </td>
                <td class="text-center">
                    <input 
                        type="checkbox" 
                        class="custom-toggle" 
                        [checked]="role.is_active" 
                        (click)="onToggleClick(role, $event)"
                        [disabled]="role.id === 1" />
                </td>
                <td>
                    <div class="flex gap-2 justify-center">
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
                        <span *ngIf="role.id === 1" class="text-gray-400 text-sm">
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
                        <span class="text-gray-500">No se encontraron roles</span>
                        <p-button 
                            label="Crear primer rol" 
                            icon="pi pi-plus" 
                            size="small"
                            (onClick)="openNew()">
                        </p-button>
                    </div>
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
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">person</span>
                <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="role.nombre" />
                <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_document</span>
                <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="role.descripcion"></textarea>
                <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
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

    private escListener: any;

    constructor(
        private messageService: MessageService,
        private roleService: RoleService
    ) {}

    ngOnInit() {
        this.loadRoles();
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

    loadRoles() {
        console.log('🔄 Iniciando carga de roles desde la API...');
        this.roleService.getRoles().subscribe({
            next: (roles) => {
                console.log('✅ Roles recibidos de la API:', roles);
                this.allRoles = roles; // Guardar todos los roles
                this.applyActiveFilter(); // Aplicar filtro actual
                console.log('📊 Roles después de aplicar filtro:', this.roles);
            },
            error: (error) => {
                console.error('❌ Error cargando roles desde API:', error);
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
        console.log('⚠️ Cargando datos de demostración...');
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
        console.log('📋 Datos de demostración cargados:', this.allRoles);
        
        this.messageService.add({
            severity: 'info',
            summary: 'Modo demostración',
            detail: 'Usando datos locales. Verifique la conexión al servidor.',
            life: 5000
        });
    }

    applyActiveFilter() {
        console.log(`🔍 Aplicando filtro: ${this.showActiveOnly ? 'Solo Activos' : 'Todos'}`);
        console.log('📋 Todos los roles disponibles:', this.allRoles);
        
        if (this.showActiveOnly) {
            this.roles = this.allRoles.filter(role => role.is_active);
        } else {
            this.roles = [...this.allRoles];
        }
        
        console.log('✅ Roles después del filtro:', this.roles);
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

    onToggleClick(role: Role, event: Event) {
        // Prevenir el comportamiento por defecto del checkbox
        event.preventDefault();
        
        // Capturar el estado ACTUAL antes del cambio
        const currentStatus = role.is_active;
        const newStatus = !currentStatus;
        
        console.log(`🎯 Click en toggle del rol "${role.nombre}": ${currentStatus} → ${newStatus}`);
        
        // Actualizar inmediatamente en la vista para dar feedback visual
        role.is_active = newStatus;
        
        // Llamar al método de toggle con el nuevo estado
        this.toggleRoleStatus(role);
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
        console.log(`🔄 Cambiando estado del rol "${role.nombre}" (ID: ${role.id}) a: ${newStatus ? 'ACTIVO' : 'INACTIVO'}`);
        
        this.roleService.toggleRoleStatus(role.id!, newStatus).subscribe({
            next: (updatedRole) => {
                console.log('✅ Respuesta del servidor:', updatedRole);
                
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
                console.error('❌ Error al cambiar estado del rol:', error);
                
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
    }

    editRole(role: Role) {
        // No permitir editar el rol de administrador (ID = 1)
        if (role.id === 1) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Acción no permitida',
                detail: 'No se puede editar el rol de Administrador por seguridad',
                life: 3000
            });
            return;
        }
        
        this.role = { ...role };
        this.isEditMode = true;
        this.roleDialog = true;
    }

    hideDialog() {
        this.roleDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
    }

    saveRole() {
        if (this.role.nombre?.trim()) {
            if (this.role.id && this.isEditMode) {
                // Modo edición - actualizar rol existente
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el rol <span class='text-primary'>${this.role.nombre}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const updateData: RoleUpdateRequest = {
                        nombre: this.role.nombre,
                        descripcion: this.role.descripcion,
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
                        },
                        error: (error) => {
                            console.error('Error al actualizar rol:', error);
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
                    nombre: this.role.nombre,
                    descripcion: this.role.descripcion,
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
                    },
                    error: (error) => {
                        console.error('Error al crear rol:', error);
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
