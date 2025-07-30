import { Component, OnInit, signal, ViewChild, HostListener } from '@angular/core';
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
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
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
        ProgressSpinnerModule
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
                <input pInputText type="text" placeholder="Buscar..." disabled />
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
        <!-- Empty State -->
        <div *ngIf="categories().length === 0" class="text-center py-12 fade-in">
            <div class="max-w-md mx-auto empty-state">
                <div class="mb-6">
                    <i class="material-symbols-outlined text-6xl text-gray-300">category</i>
                </div>
                <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay categorías</h3>
                <p class="text-gray-500 mb-6">Aún no se han creado categorías. Comienza agregando la primera categoría.</p>
                <p-button
                    label="Crear Primera Categoría"
                    icon="pi pi-plus"
                    (onClick)="openNew()"
                    styleClass="p-button-primary">
                </p-button>
            </div>
        </div>

        <!-- Table with data -->
        <p-table
            *ngIf="categories().length > 0"
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
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th class="text-center p-3">ID</th>
                <th class="text-left p-3">Nombre</th>
                <th class="hidden sm:table-cell text-left p-3">Descripción</th>
                <th class="hidden sm:table-cell text-center p-3">Activo</th>
                <th class="text-center p-3">Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
            <tr class="hover:bg-gray-50">
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600">{{ category.id }}</span>
                </td>
                <td class="p-3">
                    <div class="font-medium">{{ category.nombre }}</div>
                    <div class="text-sm text-gray-500 sm:hidden">{{ category.descripcion }}</div>
                </td>
                <td class="hidden sm:table-cell p-3">{{ category.descripcion }}</td>
                <td class="hidden sm:table-cell text-center p-3">
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="category.is_active" disabled />
                </td>
                <td class="text-center p-3">
                    <div class="flex justify-center gap-2">
                        <p-button (click)="editCategory(category)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit">
                            <ng-template pTemplate="icon">
                                <i class="material-symbols-outlined">edit</i>
                            </ng-template>
                        </p-button>
                        <p-button (click)="deleteCategory(category)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                            <ng-template pTemplate="icon">
                                <i class="material-symbols-outlined">delete</i>
                            </ng-template>
                        </p-button>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>
<p-dialog [(visible)]="categoryDialog" [style]="{ width: '90vw', maxWidth: '500px' }" [header]="isEditMode ? 'Editar Categoría' : 'Nueva Categoría'" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
                <div class="grid grid-cols-1 gap-4">
            <div class="relative py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                <input type="text" id="nombre" name="nombre" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="category.nombre" />
                <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">edit_document</span>
                <textarea id="descripcion" name="descripcion" rows="3" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="category.descripcion"></textarea>
                <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>
            <div class="flex flex-col items-center justify-center py-2">
                <label class="mb-2 text-sm font-medium">Activo</label>
                <input type="checkbox" class="custom-toggle" [(ngModel)]="category.is_active" />
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()" [disabled]="saving()">Cancelar</button>
            <button pButton type="button" class="p-button w-full sm:w-24" [label]="saving() ? '' : 'Guardar'" (click)="saveCategory()" [loading]="saving()"></button>
        </div>
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
        }`
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

    // Estados de carga
    loading = signal<boolean>(true);
    saving = signal<boolean>(false);
    deleting = signal<boolean>(false);

    constructor(
        private messageService: MessageService,
        private categoryService: CategoryService
    ) {}

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.loading.set(true);
        this.categoryService.getCategories().subscribe({
            next: (data) => {
                this.categories.set(data);
                this.loading.set(false);
            },
            error: (error) => {
                console.error('Error al cargar categorías:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las categorías',
                    life: 3000
                });
                this.loading.set(false);
            }
        });
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
    }

    editCategory(category: Category) {
        this.category = { ...category };
        this.isEditMode = true;
        this.categoryDialog = true;
    }

    deleteCategory(category: Category) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la categoría <span class='text-primary'>${category.nombre}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            if (category.id) {
                this.deleting.set(true);
                this.categoryService.deleteCategory(category.id).subscribe({
                    next: () => {
                        this.categories.set(this.categories().filter((val) => val.id !== category.id));
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Categoría "${category.nombre}" eliminada exitosamente`,
                            life: 3000
                        });
                        this.deleting.set(false);
                    },
                    error: (error) => {
                        console.error('Error al eliminar categoría:', error);
                        const errorData = error as any;
                        this.messageService.add({
                            severity: errorData.severity || 'error',
                            summary: errorData.severity === 'warn' ? 'Advertencia' : 'Error',
                            detail: errorData.message || `Error al eliminar la categoría "${category.nombre}"`,
                            life: 5000
                        });
                        this.deleting.set(false);
                    }
                });
            }
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
        if (this.category.nombre?.trim()) {
            if (this.category.id) {
                // Actualizar categoría existente
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar la categoría <span class='text-primary'>${this.category.nombre}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    if (this.category.id) {
                        const updateData: CategoryUpdateRequest = {
                            name: this.category.nombre,
                            description: this.category.descripcion,
                            active: this.category.is_active
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
                                    detail: `Categoría "${this.category.nombre}" actualizada exitosamente`,
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
                                    detail: errorData.message || `Error al actualizar la categoría "${this.category.nombre}"`,
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
                    name: this.category.nombre!,
                    description: this.category.descripcion,
                    active: this.category.is_active
                };
                this.saving.set(true);
                this.categoryService.createCategory(createData).subscribe({
                    next: (newCategory) => {
                        this.categories.set([...this.categories(), newCategory]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Categoría "${this.category.nombre}" creada exitosamente`,
                            life: 3000
                        });
                        this.categoryDialog = false;
                        this.isEditMode = false;
                        this.category = {};
                        this.saving.set(false);
                    },
                    error: (error) => {
                        console.error('Error al crear categoría:', error);
                        const errorData = error as any;
                        this.messageService.add({
                            severity: errorData.severity || 'error',
                            summary: errorData.severity === 'warn' ? 'Advertencia' : 'Error',
                            detail: errorData.message || `Error al crear la categoría "${this.category.nombre}"`,
                            life: 5000
                        });
                        this.saving.set(false);
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

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.categoryDialog) {
            this.hideDialog();
        }
    }
}
