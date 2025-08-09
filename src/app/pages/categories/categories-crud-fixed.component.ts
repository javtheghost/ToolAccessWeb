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
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryService } from '../service/category.service';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../interfaces';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-categories-crud',
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
        TextareaModule,
        DialogModule,
        InputSwitchModule,
        IconFieldModule,
        InputIconModule,
        SkeletonModule,
        ProgressSpinnerModule,
        TooltipModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
        <!-- Loading State -->
    <div *ngIf="loading()" class="space-y-4">
        <!-- Header siempre visible -->
        <div class="flex items-center justify-between">
            <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Categorías</h5>
            <p-button label="Crear Categoría" icon="pi pi-plus" (onClick)="openNew()" [disabled]="true"></p-button>
        </div>
        <div class="flex items-center justify-between gap-4 mt-2">
            <p-iconfield class="flex-1">
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" placeholder="Buscar categorías..." disabled />
            </p-iconfield>
        </div>

        <!-- Skeleton para toda la tabla (headers + datos) -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <!-- Header skeleton -->
            <div class="bg-[#6ea1cc] text-white p-3">
                <div class="flex items-center space-x-4">
                    <p-skeleton height="1.5rem" width="60px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="150px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                </div>
            </div>
            <!-- Filas skeleton -->
            <div class="p-4 space-y-3">
                <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <p-skeleton height="1rem" width="60px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="200px"></p-skeleton>
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
            [value]="categories()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['id', 'nombre', 'descripcion', 'is_active']"
            [tableStyle]="{ 'min-width': '100%' }"
            [(selection)]="selectedCategories"
            [rowHover]="true"
            dataKey="id"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
            [rowsPerPageOptions]="[5, 10, 20]"
            class="shadow-md rounded-lg responsive-table"
        >
        <ng-template #caption>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Administrar Categorías</h5>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar categorías..." />
                </p-iconfield>
                <p-button
                    label="Crear Categoría"
                    icon="pi pi-plus"
                    (onClick)="openNew()"
                    styleClass="w-full sm:w-auto">
                </p-button>
                <p-button
                    [label]="showOnlyActive ? 'Ver Todas' : 'Solo Activas'"
                    [icon]="showOnlyActive ? 'pi pi-eye' : 'pi pi-eye-slash'"
                    (onClick)="toggleActiveView()"
                    styleClass="w-full sm:w-auto p-button-outlined">
                </p-button>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th pSortableColumn="id" class="text-center p-3">
                    <div class="flex justify-content-center align-items-center">
                        ID
                        <p-sortIcon field="id"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="nombre" class="text-left p-3">
                    <div class="flex justify-content-center align-items-center">
                        Nombre
                        <p-sortIcon field="nombre"></p-sortIcon>
                    </div>
                </th>
                <th class="hidden sm:table-cell text-left p-3">Descripción</th>
                <th pSortableColumn="is_active" class="hidden sm:table-cell text-center p-3">
                    <div class="flex justify-content-center align-items-center">
                        Estado
                        <p-sortIcon field="is_active"></p-sortIcon>
                    </div>
                </th>
                <th class="text-center p-3">Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
            <tr class="hover:bg-gray-50" [ngClass]="{'opacity-60 bg-gray-100': !category.is_active}">
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600">{{ category.id }}</span>
                </td>
                <td class="p-3">
                    <div class="font-medium" [ngClass]="{'text-gray-500': !category.is_active}">{{ category.nombre }}</div>
                    <span *ngIf="category.is_active" class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Activa</span>
                    <span *ngIf="!category.is_active" class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Inactiva</span>
                    <div class="text-sm text-gray-500 sm:hidden">
                        <span *ngIf="category.descripcion && category.descripcion.trim()">{{ category.descripcion }}</span>
                        <span *ngIf="!category.descripcion || !category.descripcion.trim()" class="text-gray-400 italic">Sin descripción</span>
                    </div>
                </td>
                <td class="hidden sm:table-cell p-3">
                    <span *ngIf="category.descripcion && category.descripcion.trim()">{{ category.descripcion }}</span>
                    <span *ngIf="!category.descripcion || !category.descripcion.trim()" class="text-gray-400 ">Sin descripción</span>
                </td>
                <td class="hidden sm:table-cell text-center p-3">
                    <p-inputswitch
                        [(ngModel)]="category.is_active"
                        (onChange)="toggleCategoryStatus(category)"
                        [disabled]="loading()"
                        pTooltip="Cambiar estado de la categoría"
                        tooltipPosition="top">
                    </p-inputswitch>
                </td>
                <td class="text-center p-3">
                    <div class="flex justify-center gap-2">
                        <p-button
                            (click)="editCategory(category)"
                            styleClass="custom-flat-icon-button custom-flat-icon-button-edit"
                            pTooltip="Editar categoría"
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
                <td colspan="5" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <i class="material-symbols-outlined text-6xl text-gray-300">database</i>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay categorías</h3>
                            <p class="text-gray-500">Aún no se han creado categorías. Utiliza el botón "Crear Categoría" para agregar la primera.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>

<!-- Modal de formulario -->
<p-dialog [(visible)]="categoryDialog" [style]="{ width: '90vw', maxWidth: '500px' }" [header]="isEditMode ? 'Editar Categoría' : 'Nueva Categoría'" [modal]="true" [draggable]="false" [resizable]="false">
    <ng-template pTemplate="content">
        <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <div class="grid grid-cols-1 gap-4">
                <!-- Campo Nombre -->
                <div class="relative py-2 mt-2">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">edit</span>
                    <input
                        type="text"
                        id="nombre"
                        formControlName="nombre"
                        class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:border-[var(--primary-color)]"
                        [class.border-gray-300]="!categoryForm.get('nombre')?.invalid || !categoryForm.get('nombre')?.touched"
                        [class.border-red-500]="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched"
                        [class.focus:ring-red-500]="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched"
                        [class.focus:border-red-500]="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched"
                        [class.focus:ring-[var(--primary-color)]="categoryForm.get('nombre')?.valid || !categoryForm.get('nombre')?.touched"
                        placeholder=" "
                        aria-label="Nombre"
                        maxlength="255"
                        autocomplete="off"
                        spellcheck="false"
                        (input)="onNombreInput($event)"
                        (paste)="onNombrePaste($event)" />
                    <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 bg-white px-1"
                        [class.text-gray-600]="!categoryForm.get('nombre')?.invalid || !categoryForm.get('nombre')?.touched"
                        [class.text-red-500]="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched"
                        [class.peer-focus:text-[var(--primary-color)]="categoryForm.get('nombre')?.valid || !categoryForm.get('nombre')?.touched"
                        [class.peer-focus:text-red-500]="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched">
                        Nombre *
                    </label>
                    <!-- Mensajes de error para nombre -->
                    <div *ngIf="categoryForm.get('nombre')?.invalid && categoryForm.get('nombre')?.touched" class="mt-1 text-sm text-red-600">
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['required']">El nombre es requerido</div>
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['minlength']">El nombre debe tener al menos 3 caracteres</div>
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['maxlength']">El nombre no puede exceder 255 caracteres</div>
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['pattern']">El nombre solo puede contener letras, números, espacios, guiones y caracteres básicos</div>
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['onlySpaces']">El nombre no puede contener solo espacios en blanco</div>
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['maliciousContent']">El nombre contiene contenido no permitido por seguridad</div>
                        <div *ngIf="categoryForm.get('nombre')?.errors?.['sqlInjection']">El nombre contiene caracteres que podrían ser peligrosos</div>
                    </div>
                </div>

                <!-- Campo Descripción -->
                <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_document</span>
                    <textarea
                        id="descripcion"
                        formControlName="descripcion"
                        rows="3"
                        class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:border-[var(--primary-color)]"
                        [class.border-gray-300]="!categoryForm.get('descripcion')?.invalid || !categoryForm.get('descripcion')?.touched"
                        [class.border-red-500]="categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched"
                        [class.focus:ring-red-500]="categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched"
                        [class.focus:border-red-500]="categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched"
                        [class.focus:ring-[var(--primary-color)]="categoryForm.get('descripcion')?.valid || !categoryForm.get('descripcion')?.touched"
                        placeholder=" "
                        aria-label="Descripción"
                        maxlength="5000"
                        autocomplete="off"
                        spellcheck="true"
                        (input)="onDescripcionInput($event)"
                        (paste)="onDescripcionPaste($event)"></textarea>
                    <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 bg-white px-1"
                         [class.text-gray-600]="!categoryForm.get('descripcion')?.invalid || !categoryForm.get('descripcion')?.touched"
                         [class.text-red-500]="categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched"
                         [class.peer-focus:text-[var(--primary-color)]="categoryForm.get('descripcion')?.valid || !categoryForm.get('descripcion')?.touched"
                         [class.peer-focus:text-red-500]="categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched">
                         Descripción (Opcional)
                     </label>
                    <!-- Mensajes de error para descripción -->
                    <div *ngIf="categoryForm.get('descripcion')?.invalid && categoryForm.get('descripcion')?.touched" class="mt-1 text-sm text-red-600">
                        <div *ngIf="categoryForm.get('descripcion')?.errors?.['minlength']">La descripción debe tener al menos 3 caracteres si se proporciona</div>
                        <div *ngIf="categoryForm.get('descripcion')?.errors?.['maxlength']">La descripción no puede exceder 5000 caracteres</div>
                        <div *ngIf="categoryForm.get('descripcion')?.errors?.['pattern']">La descripción contiene caracteres no permitidos</div>
                        <div *ngIf="categoryForm.get('descripcion')?.errors?.['onlySpaces']">La descripción no puede contener solo espacios en blanco</div>
                        <div *ngIf="categoryForm.get('descripcion')?.errors?.['maliciousContent']">La descripción contiene contenido no permitido por seguridad</div>
                        <div *ngIf="categoryForm.get('descripcion')?.errors?.['sqlInjection']">La descripción contiene caracteres que podrían ser peligrosos</div>
                    </div>
                </div>

                <!-- Campo Activo -->
                <div class="flex flex-col items-center justify-center py-2">
                    <label class="mb-2 text-sm font-medium">Estado Activo *</label>
                    <input type="checkbox" class="custom-toggle" formControlName="is_active" />
                </div>
            </div>

            <!-- Botones -->
             <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                 <button type="button" pButton class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()" [disabled]="saving()">Cancelar</button>
                 <button type="submit" pButton class="p-button w-full sm:w-24" [loading]="saving()" [disabled]="categoryForm.invalid || saving()">Guardar</button>
             </div>
        </form>
    </ng-template>
</p-dialog>

<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
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
          [disabled]="deleting()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning'"
          class="px-4 py-2 rounded font-semibold w-24 text-center"
          (click)="onCustomConfirmAccept()"
          [disabled]="deleting()"
        >
          <span *ngIf="!deleting()">Aceptar</span>
          <span *ngIf="deleting()" class="confirm-button-loading">
            <i class="pi pi-spin pi-spinner"></i>
            Eliminando...
          </span>
        </button>
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

        /* Estilos del switch removidos - usar estilos por defecto de PrimeNG */`
    ]
})
export class CategoriesCrudComponent implements OnInit {
    categoryDialog: boolean = false;
    categories = signal<Category[]>([]);
    category: Category = {};
    selectedCategories: Category[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    // Loading states
    loading = signal<boolean>(true);
    saving = signal<boolean>(false);
    deleting = signal<boolean>(false);

    // Control de vista de categorías
    showOnlyActive: boolean = true;

    // Form
    categoryForm!: FormGroup;

    // Hacer Math disponible en el template
    Math = Math;

    constructor(
        private messageService: MessageService,
        private categoryService: CategoryService,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadCategories();
    }

    // ✅ VALIDADORES PERSONALIZADOS PARA COINCIDIR EXACTAMENTE CON BD

    /**
     * Validador personalizado: No permite solo espacios en blanco (campo requerido)
     */
    private noOnlySpacesValidator(control: any) {
        if (!control.value) return { required: true };

        const value = control.value.toString().trim();
        if (value.length === 0) {
            return { onlySpaces: true };
        }
        return null;
    }

    /**
     * Validador personalizado: No permite solo espacios en blanco (campo opcional)
     */
    private noOnlySpacesValidatorOptional(control: any) {
        if (!control.value) return null; // Campo opcional, null/undefined es válido

        const value = control.value.toString().trim();
        if (control.value.length > 0 && value.length === 0) {
            return { onlySpaces: true };
        }
        return null;
    }

    /**
     * Validador personalizado: XSS y caracteres peligrosos
     */
    private noMaliciousContentValidator(control: any) {
        if (!control.value) return null;

        const value = control.value.toString();

        // Detectar posibles inyecciones XSS básicas
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /vbscript:/gi,
            /expression\s*\(/gi
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(value)) {
                return { maliciousContent: true };
            }
        }

        return null;
    }

    /**
     * Validador personalizado: SQL Injection básico
     */
    private noSQLInjectionValidator(control: any) {
        if (!control.value) return null;

        const value = control.value.toString().toLowerCase();

        // Patrones básicos de SQL injection
        const sqlPatterns = [
            /(\b(select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
            /(\bunion\s+(all\s+)?select\b)/gi,
            /(;|\s)--/gi,
            /\/\*.*\*\//gi,
            /(\bor\b.*=.*\bor\b)/gi,
            /(\band\b.*=.*\band\b)/gi
        ];

        for (const pattern of sqlPatterns) {
            if (pattern.test(value)) {
                return { sqlInjection: true };
            }
        }

        return null;
    }

    /**
     * Sanitizar entrada de texto avanzado
     */
    private sanitizeInput(value: string): string {
        if (!value) return '';

        return value
            .trim() // Eliminar espacios al inicio y final
            .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
            .replace(/[<>'"`;]/g, '') // Eliminar caracteres potencialmente peligrosos
            .replace(/\x00|\x08|\x09|\x1a|\n|\r/g, '') // Eliminar caracteres de control
            .slice(0, 1000); // Cortar a longitud máxima por seguridad
    }

    /**
     * Validar datos antes de enviar al servidor (capa adicional de seguridad)
     */
    private validateFormData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validar nombre (coincide exactamente con BD varchar(255) y backend constraints)
        if (!data.nombre || typeof data.nombre !== 'string') {
            errors.push('El nombre es requerido');
        } else {
            const nombre = data.nombre.trim();
            if (nombre.length < 3) {
                errors.push('El nombre debe tener al menos 3 caracteres');
            } else if (nombre.length > 255) { // BD: varchar(255)
                errors.push('El nombre no puede exceder 255 caracteres');
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()&]+$/.test(nombre)) {
                errors.push('El nombre contiene caracteres no permitidos');
            }
        }

        // Validar descripción (coincide con BD - campo text, prácticamente ilimitado pero con límite práctico)
        if (data.descripcion !== undefined && data.descripcion !== null) {
            if (typeof data.descripcion !== 'string') {
                errors.push('La descripción debe ser un texto');
            } else if (data.descripcion.length > 5000) { // Límite práctico para texto
                errors.push('La descripción no puede exceder 5000 caracteres');
            }
        }

        // Validar is_active (coincide con BD - boolean default true)
        if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
            errors.push('El estado activo debe ser verdadero o falso');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Inicializar el formulario reactivo con validaciones que coinciden exactamente con la BD
     */
    private initForm() {
        this.categoryForm = this.fb.group({
            // Campo nombre: varchar(255) en BD, requerido
            nombre: ['', [
                Validators.required,
                Validators.minLength(3),  // Mínimo 3 caracteres (estándar UX)
                Validators.maxLength(255), // Coincide exactamente con BD varchar(255)
                // Patrón que permite letras (con acentos), números, espacios, guiones y algunos caracteres especiales comunes
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()&]+$/),
                // Validadores de seguridad
                this.noOnlySpacesValidator,
                this.noMaliciousContentValidator,
                this.noSQLInjectionValidator
            ]],
            // Campo descripcion: text en BD (prácticamente ilimitado), opcional
            descripcion: ['', [
                // Solo validar si hay contenido (campo opcional)
                Validators.maxLength(5000), // Límite práctico para campo text
                // Patrón permisivo para descripción: solo excluir caracteres peligrosos para seguridad
                Validators.pattern(/^[^<>'"`;\\]*$/), // Permite números, letras, espacios y caracteres especiales excepto los peligrosos
                // Validadores de seguridad
                this.noOnlySpacesValidatorOptional,
                this.noMaliciousContentValidator,
                this.noSQLInjectionValidator
            ]],
            // Campo is_active: boolean con default true en BD
            is_active: [true, [
                Validators.required // Siempre debe tener un valor boolean
            ]]
        });
    }

    /**
     * Resetear el formulario
     */
    private resetForm() {
        this.categoryForm.reset({
            nombre: '',
            descripcion: '',
            is_active: true
        });
    }

    loadCategories() {
        this.loading.set(true);
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                // Filtrar categorías según showOnlyActive
                const filteredCategories = this.showOnlyActive
                    ? categories.filter(cat => cat.is_active)
                    : categories;
                this.categories.set(filteredCategories);
                this.loading.set(false);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar categorías',
                    life: 3000
                });
                this.loading.set(false);
            }
        });
    }

    toggleActiveView() {
        this.showOnlyActive = !this.showOnlyActive;
        this.loadCategories();
        this.messageService.add({
            severity: 'info',
            summary: 'Vista cambiada',
            detail: this.showOnlyActive ? 'Mostrando solo categorías activas' : 'Mostrando todas las categorías',
            life: 2000
        });
    }

    // Método para cambiar el estado de la categoría directamente
    toggleCategoryStatus(category: Category) {
        const newStatus = category.is_active;

        if (newStatus) {
            // Activar categoría
            this.categoryService.reactivateCategory(category.id!).subscribe({
                next: (updatedCategory) => {
                    const idx = this.categories().findIndex(c => c.id === category.id);
                    if (idx > -1) {
                        this.categories.update(cats => {
                            const updatedCats = [...cats];
                            updatedCats[idx] = updatedCategory;
                            return updatedCats;
                        });
                    }
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Categoría activada',
                        life: 3000
                    });
                },
                error: (error) => {
                    // Revertir el switch si hay error
                    category.is_active = !newStatus;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al activar categoría',
                        life: 3000
                    });
                }
            });
        } else {
            // Desactivar categoría (eliminar)
            this.categoryService.deleteCategory(category.id!).subscribe({
                next: () => {
                    // Actualizar el estado local
                    category.is_active = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Categoría desactivada',
                        life: 3000
                    });
                },
                error: (error) => {
                    // Revertir el switch si hay error
                    category.is_active = !newStatus;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al desactivar categoría',
                        life: 3000
                    });
                }
            });
        }
    }

    getActiveCategoriesCount(): number {
        return this.categories().filter(cat => cat.is_active).length;
    }

    getTotalCategoriesCount(): number {
        return this.categories().length;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.category = {
            is_active: true // Establecer por defecto como activo, igual que en la BD
        };
        this.isEditMode = false;
        this.categoryDialog = true;
        this.resetForm();
    }

    editCategory(category: Category) {
        this.category = { ...category };
        this.isEditMode = true;
        this.categoryDialog = true;

        // Cargar datos en el formulario
        this.categoryForm.patchValue({
            nombre: category.nombre || '',
            descripcion: category.descripcion || '',
            is_active: category.is_active !== undefined ? category.is_active : true
        });
    }

    deleteCategory(category: Category) {
        // Validar que la categoría esté activa antes de intentar eliminarla
        if (!category.is_active) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No puedes eliminar una categoría que ya está inactiva. Usa el botón de reactivar si deseas volver a activarla.',
                life: 5000
            });
            return;
        }

        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la categoría <span class='text-primary'>${category.nombre}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.deleting.set(true);
            this.categoryService.deleteCategory(category.id!).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Categoría eliminada exitosamente',
                        life: 3000
                    });
                    this.loadCategories();
                    this.deleting.set(false);
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al eliminar la categoría',
                        life: 3000
                    });
                    this.deleting.set(false);
                }
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.categoryDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
        // Resetear el objeto category con valores por defecto
        this.category = {
            is_active: true
        };
        this.resetForm();
    }

    createId(): string {
        let id = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    saveCategory() {
        if (this.categoryForm.invalid) {
            // Marcar todos los campos como touched para mostrar errores
            Object.keys(this.categoryForm.controls).forEach(key => {
                const control = this.categoryForm.get(key);
                control?.markAsTouched();
            });

            // Mostrar mensaje específico sobre errores de validación
            this.messageService.add({
                severity: 'warn',
                summary: 'Errores de validación',
                detail: 'Por favor, corrige los errores en el formulario antes de continuar',
                life: 4000
            });
            return;
        }

        // Obtener y sanitizar datos del formulario
        const formValue = this.categoryForm.value;
        const sanitizedData = {
            nombre: this.sanitizeInput(formValue.nombre),
            descripcion: this.sanitizeInput(formValue.descripcion || ''),
            is_active: formValue.is_active
        };

        // Validación adicional en el frontend (capa de seguridad extra)
        const validation = this.validateFormData(sanitizedData);
        if (!validation.isValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Datos inválidos',
                detail: validation.errors.join('. '),
                life: 5000
            });
            return;
        }

        if (this.category.id) {
            // Actualizar categoría existente
            this.confirmIcon = 'warning';
            this.confirmMessage = `¿Estás seguro que deseas actualizar la categoría <span class='text-primary'>${sanitizedData.nombre}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
            this.confirmAction = () => {
                if (this.category.id) {
                    const updateData: CategoryUpdateRequest = {
                        name: sanitizedData.nombre,
                        description: sanitizedData.descripcion,
                        active: sanitizedData.is_active
                    };
                    this.saving.set(true);
                    this.categoryService.updateCategory(this.category.id, updateData).subscribe({
                        next: (updatedCategory) => {
                            const idx = this.categories().findIndex(c => c.id === this.category.id);
                            if (idx > -1) this.categories().splice(idx, 1, updatedCategory);
                            this.categories.set([...this.categories()]);
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: `Categoría "${sanitizedData.nombre}" actualizada exitosamente`,
                                life: 3000
                            });
                            this.categoryDialog = false;
                            this.isEditMode = false;
                            this.category = {};
                            this.saving.set(false);
                        },
                        error: (error) => {
                            console.error('Error al actualizar categoría:', error);
                            const errorData = error as any;
                            this.messageService.add({
                                severity: errorData.severity || 'error',
                                summary: errorData.severity === 'warn' ? 'Advertencia' : 'Error',
                                detail: errorData.message || `Error al actualizar la categoría "${sanitizedData.nombre}"`,
                                life: 5000
                            });
                            this.saving.set(false);
                        }
                    });
                }
            };
            this.showCustomConfirm = true;
        } else {
            // Crear nueva categoría
            const createData: CategoryCreateRequest = {
                name: sanitizedData.nombre,
                description: sanitizedData.descripcion,
                active: sanitizedData.is_active
            };
            this.saving.set(true);
            this.categoryService.createCategory(createData).subscribe({
                next: (newCategory) => {
                    this.categories.set([...this.categories(), newCategory]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Categoría "${sanitizedData.nombre}" creada exitosamente`,
                        life: 3000
                    });
                    this.categoryDialog = false;
                    this.isEditMode = false;
                    this.category = {};
                    this.saving.set(false);

                    // Limpiar formulario después de creación exitosa
                    this.resetForm();
                },
                error: (error) => {
                    console.error('Error al crear categoría:', error);
                    const errorData = error as any;
                    this.messageService.add({
                        severity: errorData.severity || 'error',
                        summary: errorData.severity === 'warn' ? 'Advertencia' : 'Error',
                        detail: errorData.message || `Error al crear la categoría "${sanitizedData.nombre}"`,
                        life: 5000
                    });
                    this.saving.set(false);
                }
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

    // ✅ MÉTODOS DE VALIDACIÓN EN TIEMPO REAL Y CONTROL DE ENTRADA

    /**
     * Manejar entrada de texto en tiempo real para el campo nombre
     */
    onNombreInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = input.value;

        // Aplicar filtro de caracteres en tiempo real
        const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()&]/g, '');

        if (filteredValue !== value) {
            input.value = filteredValue;
            this.categoryForm.get('nombre')?.setValue(filteredValue);
        }
    }

    /**
     * Manejar pegado en el campo nombre
     */
    onNombrePaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedData = event.clipboardData?.getData('text') || '';

        // Limpiar y filtrar el texto pegado
        const cleanedData = this.sanitizeInput(pastedData)
            .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()&]/g, '')
            .slice(0, 255); // Respetar límite de BD

        this.categoryForm.get('nombre')?.setValue(cleanedData);
    }

    /**
     * Manejar entrada de texto en tiempo real para el campo descripción
     */
    onDescripcionInput(event: Event) {
        const input = event.target as HTMLTextAreaElement;
        const value = input.value;

        // Aplicar filtro más permisivo para descripción pero manteniendo seguridad
        const filteredValue = value.replace(/[<>'"`;]/g, ''); // Eliminar caracteres peligrosos

        if (filteredValue !== value) {
            input.value = filteredValue;
            this.categoryForm.get('descripcion')?.setValue(filteredValue);
        }
    }

    /**
     * Manejar pegado en el campo descripción
     */
    onDescripcionPaste(event: ClipboardEvent) {
        event.preventDefault();
        const pastedData = event.clipboardData?.getData('text') || '';

        // Limpiar el texto pegado
        const cleanedData = this.sanitizeInput(pastedData)
            .slice(0, 5000); // Respetar límite práctico

        this.categoryForm.get('descripcion')?.setValue(cleanedData);
    }

    /**
     * Obtener el número de caracteres restantes para el campo nombre
     */
    getNombreCharsRemaining(): number {
        const currentLength = this.categoryForm.get('nombre')?.value?.length || 0;
        return 255 - currentLength;
    }

    /**
     * Obtener el número de caracteres restantes para el campo descripción
     */
    getDescripcionCharsRemaining(): number {
        const currentLength = this.categoryForm.get('descripcion')?.value?.length || 0;
        return 5000 - currentLength;
    }

    onToggleActive(category: Category, event: Event) {
        const checkbox = event.target as HTMLInputElement;
        const newActiveState = checkbox.checked;

        // Revertir el cambio visual inmediatamente
        checkbox.checked = !newActiveState;

        // Mostrar diálogo de confirmación
        this.confirmIcon = newActiveState ? 'check_circle' : 'pause_circle';
        this.confirmMessage = newActiveState
            ? `¿Estás seguro de activar la categoría <span class='text-primary'>${category.nombre}</span>?`
            : `¿Estás seguro de desactivar la categoría <span class='text-primary'>${category.nombre}</span>?`;

        this.confirmAction = () => {
            this.deleting.set(true);
            const updateData: CategoryUpdateRequest = {
                name: category.nombre!,
                description: category.descripcion || '',
                active: newActiveState
            };

            this.categoryService.updateCategory(category.id!, updateData).subscribe({
                next: (updatedCategory) => {
                    // Actualizar el estado visual después de confirmar
                    checkbox.checked = newActiveState;

                    // Actualizar la categoría en la lista
                    const idx = this.categories().findIndex(c => c.id === category.id);
                    if (idx > -1) {
                        this.categories()[idx] = updatedCategory;
                        this.categories.set([...this.categories()]);
                    }

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Categoría "${category.nombre}" ${newActiveState ? 'activada' : 'desactivada'} exitosamente`,
                        life: 3000
                    });
                    this.deleting.set(false);
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || `Error al ${newActiveState ? 'activar' : 'desactivar'} la categoría`,
                        life: 3000
                    });
                    this.deleting.set(false);
                }
            });
        };
        this.showCustomConfirm = true;
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.categoryDialog) {
            this.hideDialog();
        }
    }
}
