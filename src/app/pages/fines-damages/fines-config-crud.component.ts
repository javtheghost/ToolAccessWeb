import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { FinesConfigService, FinesConfig, FinesConfigCreateRequest, FinesConfigUpdateRequest } from '../service/fines-config.service';
import { CategoryService } from '../service/category.service';
import { Category } from '../interfaces';
import { MobileDetectionService } from '../service/mobile-detection.service';

@Component({
    selector: 'app-fines-config-crud',
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
        InputNumberModule,
        DropdownModule,
        TooltipModule,
        SkeletonModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <p-table
        #dt
        [value]="finesConfig"
        [rows]="isMobile ? 3 : 5"
        [paginator]="true"
        [globalFilterFields]="['nombre', 'categoria_nombre']"
        [tableStyle]="{ 'min-width': '100%' }"
        [(selection)]="selectedFinesConfig"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="isMobile ? [3, 5, 10] : [5, 10, 15, 25]"
        [scrollable]="true"
        scrollHeight="300px"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <div>
                    <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Configuración de Multas</h5>
                    <p class="text-sm text-[var(--primary-color)] mt-1 px-2">
                        Define las configuraciones y valores base para las multas del sistema.
                    </p>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1 w-full sm:w-auto">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end w-full sm:w-auto">
                    <p-button label="Nueva Configuración" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Valor base</th>
                <th>Activo</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-fine>
            <tr class="hover:bg-gray-50" [ngClass]="{'opacity-60 bg-gray-100': !fine.is_active}">
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600" [ngClass]="{'text-gray-400': !fine.is_active}">{{ fine.id }}</span>
                </td>
                <td class="p-3">
                    <div class="font-medium" [ngClass]="{'text-gray-500': !fine.is_active}">{{ fine.nombre }}</div>
                    <div *ngIf="fine.is_active" class="text-xs text-green-600 mt-1">Activo</div>
                    <div *ngIf="!fine.is_active" class="text-xs text-red-500 mt-1">Inactivo</div>
                </td>
                <td class="p-3">
                    <span [ngClass]="{'text-gray-500': !fine.is_active}">{{ fine.categoria_nombre || 'Sin categoría' }}</span>
                </td>
                <td class="text-center p-3" [ngClass]="{'text-gray-500': !fine.is_active}">
                    <span class="font-medium">{{ fine.valor_base | currency: 'MXN' }}</span>
                </td>
                <td class="text-center p-3">
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="fine.is_active" disabled />
                </td>
                <td>
                    <p-button
                        (click)="editFineConfig(fine)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2"
                        pTooltip="Editar configuración"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button
                        (click)="deleteFineConfig(fine)"
                        styleClass="custom-flat-icon-button custom-flat-icon-button-delete"
                        pTooltip="Eliminar configuración"
                        tooltipPosition="top">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="flex flex-col items-center gap-2">
                        <i class="pi pi-database text-4xl text-[var(--primary-color)]"></i>
                        <h6 class="text-[var(--primary-color)] font-medium">No hay configuraciones de multas registradas</h6>
                        <p class="text-gray-500 text-sm">Cuando se registren configuraciones de multas, aparecerán aquí.</p>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>
<p-dialog
  [(visible)]="fineConfigDialog"
  [style]="{ width: '90vw', maxWidth: '500px' }"
  [modal]="true"
  [draggable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Configuración de Multa' : 'Nueva Configuración de Multa' }}
    </span>
  </ng-template>
    <ng-template pTemplate="content">
        <form [formGroup]="fineConfigForm" (ngSubmit)="saveFineConfig()">
            <div class="grid grid-cols-1 gap-4">
                <!-- Campo Nombre (Requerido) -->
                <div class="relative py-2 mt-2">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        formControlName="nombre"
                        class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder=" "
                        aria-label="Nombre"
                        [ngClass]="{'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('nombre')}"
                    />
                    <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-4 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">
                        Nombre <span class="text-red-500">*</span>
                    </label>
                    <div *ngIf="isFieldInvalid('nombre')" class="text-red-500 text-xs mt-1 ml-1">
                        {{ getErrorMessage('nombre') }}
                    </div>
                </div>

                <!-- Campo Categoría (Opcional) -->
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">inventory_2</span>
                    <input
                        type="number"
                        id="aplica_a_categoria_id"
                        name="aplica_a_categoria_id"
                        formControlName="aplica_a_categoria_id"
                        class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder=" "
                        aria-label="ID de Categoría"
                    />
                    <label for="aplica_a_categoria_id" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-4 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">
                        ID de Categoría
                    </label>
                    <div *ngIf="isFieldInvalid('aplica_a_categoria_id')" class="text-red-500 text-xs mt-1 ml-1">
                        {{ getErrorMessage('aplica_a_categoria_id') }}
                    </div>
                </div>

                <!-- Campo Valor Base (Requerido) -->
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">payments</span>
                    <input
                        type="number"
                        id="valor_base"
                        name="valor_base"
                        formControlName="valor_base"
                        class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder=" "
                        aria-label="Valor base"
                        [ngClass]="{'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('valor_base')}"
                    />
                    <label for="valor_base" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-4 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">
                        Valor base <span class="text-red-500">*</span>
                    </label>
                    <div *ngIf="isFieldInvalid('valor_base')" class="text-red-500 text-xs mt-1 ml-1">
                        {{ getErrorMessage('valor_base') }}
                    </div>
                </div>

                <!-- Campo Activo -->
                <div class="flex flex-col items-center justify-center">
                    <label class="mb-2">Estado activo</label>
                    <input type="checkbox" class="custom-toggle" formControlName="is_active" />
                </div>
            </div>

            <!-- Botones -->
            <div class="flex justify-end gap-4 mt-6">
                <button pButton type="button" class="custom-cancel-btn w-24" (click)="hideDialog()">Cancelar</button>
                <button pButton type="submit" class="p-button w-24" [disabled]="fineConfigForm.invalid || saving">
                    <span *ngIf="saving">Guardando...</span>
                    <span *ngIf="!saving">Guardar</span>
                </button>
            </div>
        </form>
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

        /* Estilos para campos requeridos */
        .required-field {
            color: #ef4444;
            font-weight: bold;
        }

        /* Estilos para campos con error */
        .field-error {
            border-color: #ef4444 !important;
        }

        .field-error:focus {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 1px #ef4444 !important;
        }
    `]
})
export class FinesConfigCrudComponent implements OnInit {
    finesConfig: FinesConfig[] = [];
    fineConfigDialog: boolean = false;
    fineConfig: FinesConfig = this.emptyFineConfig();
    selectedFinesConfig: FinesConfig[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // Formulario
    fineConfigForm!: FormGroup;

    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    // Estados
    loading: boolean = false;
    saving: boolean = false;
    showOnlyActive: boolean = true;
    isMobile = false;

    // Categorías
    categories: Category[] = [];

    constructor(
        private messageService: MessageService,
        private finesConfigService: FinesConfigService,
        private categoryService: CategoryService,
        private mobileDetectionService: MobileDetectionService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadFinesConfigs();
        this.loadCategories();
        this.setupMobileDetection();
    }

    private setupMobileDetection() {
        // Suscribirse a los cambios de detección móvil
        this.mobileDetectionService.isMobile$.subscribe(isMobile => {
            this.isMobile = isMobile;
        });
    }

    initForm() {
        this.fineConfigForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            valor_base: [0, [Validators.required, Validators.min(0), Validators.max(999999.99)]],
            aplica_a_categoria_id: [null],
            is_active: [true]
        });
    }

    // Getters para validación
    get nombre() { return this.fineConfigForm.get('nombre'); }
    get valor_base() { return this.fineConfigForm.get('valor_base'); }
    get aplica_a_categoria_id() { return this.fineConfigForm.get('aplica_a_categoria_id'); }
    get is_active() { return this.fineConfigForm.get('is_active'); }

    getErrorMessage(controlName: string): string {
        const control = this.fineConfigForm.get(controlName);
        if (control?.errors) {
            if (control.errors['required']) {
                return 'Este campo es obligatorio';
            }
            if (control.errors['minlength']) {
                return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
            }
            if (control.errors['maxlength']) {
                return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
            }
            if (control.errors['min']) {
                return `Valor mínimo: ${control.errors['min'].min}`;
            }
            if (control.errors['max']) {
                return `Valor máximo: ${control.errors['max'].max}`;
            }
            if (control.errors['pattern']) {
                return 'Formato inválido';
            }
        }
        return '';
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.fineConfigForm.get(controlName);
        return !!(control?.invalid && control?.touched);
    }

    loadFinesConfigs() {
        this.loading = true;
        this.finesConfigService.getFinesConfigs(undefined, this.showOnlyActive).subscribe({
            next: (data) => {
                this.finesConfig = data;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar configuraciones de multas'
                });
                this.loading = false;
            }
        });
    }

    loadCategories() {
        this.categoryService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar categorías'
                });
            }
        });
    }

    toggleActiveView() {
        this.showOnlyActive = !this.showOnlyActive;
        this.loadFinesConfigs();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.fineConfig = this.emptyFineConfig();
        this.isEditMode = false;
        this.fineConfigForm.reset({
            nombre: '',
            valor_base: 0,
            aplica_a_categoria_id: null,
            is_active: true
        });
        this.fineConfigDialog = true;
    }

    editFineConfig(fine: FinesConfig) {
        this.fineConfig = { ...fine };
        this.isEditMode = true;
        this.fineConfigForm.patchValue({
            nombre: fine.nombre,
            valor_base: fine.valor_base,
            aplica_a_categoria_id: fine.aplica_a_categoria_id,
            is_active: fine.is_active
        });
        this.fineConfigDialog = true;
    }

    deleteFineConfig(fine: FinesConfig) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la configuración de multa <span class='text-primary'>${fine.nombre}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.finesConfigService.deleteFinesConfig(fine.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Configuración de multa eliminada correctamente'
                    });
                    this.loadFinesConfigs();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al eliminar configuración de multa'
                    });
                }
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.fineConfigDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
        this.fineConfigForm.reset();
    }

    saveFineConfig() {
        if (this.fineConfigForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.saving = true;
        const formValue = this.fineConfigForm.value;

        if (this.isEditMode) {
            const updateRequest: FinesConfigUpdateRequest = {
                nombre: formValue.nombre,
                valor_base: formValue.valor_base,
                aplica_a_categoria_id: formValue.aplica_a_categoria_id,
                is_active: formValue.is_active
            };

            this.finesConfigService.updateFinesConfig(this.fineConfig.id, updateRequest).subscribe({
                next: (updatedConfig) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Configuración de multa actualizada correctamente'
                    });
                    this.hideDialog();
                    this.loadFinesConfigs();
                    this.saving = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al actualizar configuración de multa'
                    });
                    this.saving = false;
                }
            });
        } else {
            const createRequest: FinesConfigCreateRequest = {
                nombre: formValue.nombre,
                valor_base: formValue.valor_base,
                aplica_a_categoria_id: formValue.aplica_a_categoria_id,
                is_active: formValue.is_active
            };

            this.finesConfigService.createFinesConfig(createRequest).subscribe({
                next: (newConfig) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Configuración de multa creada correctamente'
                    });
                    this.hideDialog();
                    this.loadFinesConfigs();
                    this.saving = false;
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al crear configuración de multa'
                    });
                    this.saving = false;
                }
            });
        }
    }

    markFormGroupTouched() {
        Object.keys(this.fineConfigForm.controls).forEach(key => {
            const control = this.fineConfigForm.get(key);
            control?.markAsTouched();
        });
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

    emptyFineConfig(): FinesConfig {
        return {
            id: 0,
            nombre: '',
            valor_base: 0,
            aplica_a_categoria_id: undefined,
            is_active: true
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.fineConfigDialog) {
            this.hideDialog();
        }
    }
}
