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
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <i class="material-symbols-outlined text-6xl text-gray-300">database</i>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay configuraciones de multas</h3>
                            <p class="text-gray-500">Aún no se han registrado configuraciones de multas. Utiliza el botón "Nueva Configuración" para agregar la primera configuración.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>
<p-dialog
  [(visible)]="fineConfigDialog"
  [style]="{ width: '95vw', maxWidth: '600px' }"
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
            <!-- Nombre de la configuración -->
            <div class="relative col-span-1 py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">edit</span>
                <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Nombre"
                    [class.border-red-500]="isFieldInvalid('nombre')"
                    [class.border-gray-300]="!isFieldInvalid('nombre')" />
                <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
                <div *ngIf="isFieldInvalid('nombre')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('nombre') }}</div>
            </div>

            <!-- Categoría -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">inventory_2</span>
                <p-dropdown
                    [options]="categories"
                    formControlName="aplica_a_categoria_id"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar categoría (opcional)"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="true"
                    [class.border-red-500]="isFieldInvalid('aplica_a_categoria_id')"
                    [class.border-gray-300]="!isFieldInvalid('aplica_a_categoria_id')">
                </p-dropdown>
                <div *ngIf="isFieldInvalid('aplica_a_categoria_id')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('aplica_a_categoria_id') }}</div>
            </div>

            <!-- Valor base -->
            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-10">payments</span>
                <p-inputnumber
                    formControlName="valor_base"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    [min]="0"
                    [max]="999999.99"
                    placeholder="$0.00 MXN"
                    class="w-full"
                    [showButtons]="false"
                    [useGrouping]="true"
                    [locale]="'es-MX'"
                    styleClass="custom-inputnumber">
                </p-inputnumber>
                <div *ngIf="isFieldInvalid('valor_base')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('valor_base') }}</div>
            </div>

            <!-- Estado activo -->
            <div class="flex flex-col items-center justify-center col-span-1">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" formControlName="is_active" />
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="submit" class="p-button w-full sm:w-24" [disabled]="fineConfigForm.invalid || saving">
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
        }

        /* Centrar el placeholder también */
        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }

        /* Asegurar que el placeholder esté centrado */
        :host ::ng-deep .p-dropdown .p-dropdown-label:not(.p-inputtext) {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
        }

        /* Centrado específico para placeholder */
        :host ::ng-deep .p-dropdown .p-dropdown-label {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
            min-height: 48px !important;
        }

        /* Forzar centrado del placeholder */
        :host ::ng-deep .p-dropdown .p-dropdown-label.p-placeholder,
        :host ::ng-deep .p-dropdown .p-dropdown-label:empty {
            display: flex !important;
            align-items: center !important;
            height: 100% !important;
            padding-left: 2.5rem !important;
            line-height: 1 !important;
            min-height: 48px !important;
        }

        /* Centrado específico para placeholder */
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

        /* Estilos personalizados para p-inputnumber */
        :host ::ng-deep .custom-inputnumber {
            width: 100% !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext {
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

        :host ::ng-deep .custom-inputnumber .p-inputtext:focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext::placeholder {
            color: #9ca3af !important;
            font-size: 0.875rem !important;
            font-weight: 400 !important;
        }

        :host ::ng-deep .custom-inputnumber .p-inputtext:hover {
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

    onCategoryChange(event: any) {
        this.fineConfigForm.patchValue({
            aplica_a_categoria_id: event.value
        });
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
            // Modo edición - mostrar confirmación
            this.confirmIcon = 'warning';
            this.confirmMessage = `¿Estás seguro que deseas actualizar la configuración de multa <span class='text-primary'>${formValue.nombre}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
            this.confirmAction = () => {
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
            };
            this.showCustomConfirm = true;
        } else {
            // Modo creación
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
