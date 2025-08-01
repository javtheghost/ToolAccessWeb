import { Component, OnInit, signal, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { SubcategoryService, Subcategory, SubcategoryDisplay, SubcategoryCreateRequest, SubcategoryUpdateRequest } from '../service/subcategory.service';
import { CategoryService } from '../service/category.service';
import { Category } from '../interfaces';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-subcategorias-crud',
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
        DropdownModule,
        SkeletonModule,
        ProgressSpinnerModule,
        TooltipModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <!-- Loading State -->
    <div *ngIf="loading()" class="space-y-4">
        <div class="flex items-center justify-between">
            <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Subcategorías</h5>
            <p-button label="Crear Subcategoría" icon="pi pi-plus" (onClick)="openNew()" [disabled]="true"></p-button>
        </div>
        <div class="flex items-center justify-between gap-4 mt-2">
            <p-iconfield class="flex-1">
                <p-inputicon styleClass="pi pi-search" />
                <input pInputText type="text" placeholder="Buscar..." disabled />
            </p-iconfield>
        </div>
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-[#6ea1cc] text-white p-3">
                <div class="flex items-center space-x-4">
                    <p-skeleton height="1.5rem" width="100px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="150px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                </div>
            </div>
            <div class="p-4 space-y-3">
                <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="200px"></p-skeleton>
                    <p-skeleton height="1rem" width="150px"></p-skeleton>
                    <p-skeleton height="1rem" width="60px"></p-skeleton>
                    <p-skeleton height="1rem" width="100px"></p-skeleton>
                </div>
            </div>
        </div>
    </div>

    <!-- Content when loaded -->
    <div *ngIf="!loading()">
        <p-table
            #dt
            [value]="subcategories()"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['nombre', 'descripcion', 'categoria_nombre', 'is_active']"
            [tableStyle]="{ 'min-width': '100%' }"
            [(selection)]="selectedSubcategories"
            [rowHover]="true"
            dataKey="id"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} subcategorías"
            [rowsPerPageOptions]="[5, 10, 20]"
            class="shadow-md rounded-lg responsive-table"
        >
            <ng-template pTemplate="caption">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Administrar Subcategorías</h5>
                </div>
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
                    <p-iconfield class="flex-1">
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar subcategorías..." />
                    </p-iconfield>
                    <p-button
                        label="Crear Subcategoría"
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
                    <th class="hidden sm:table-cell text-left p-3">Categoría</th>
                    <th class="hidden sm:table-cell text-center p-3">Activo</th>
                    <th class="text-center p-3">Acción</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-subcategory>
                <tr class="hover:bg-gray-50">
                    <td class="text-center p-3">
                        <span class="font-mono text-sm text-gray-600">{{ subcategory.id }}</span>
                    </td>
                    <td class="p-3">
                        <div class="font-medium">{{ subcategory.nombre }}</div>
                        <div class="text-sm text-gray-500 sm:hidden">
                            <span *ngIf="subcategory.descripcion && subcategory.descripcion.trim()">{{ subcategory.descripcion }}</span>
                            <span *ngIf="!subcategory.descripcion || !subcategory.descripcion.trim()" class="text-gray-400 italic">Sin descripción</span>
                        </div>
                    </td>
                    <td class="hidden sm:table-cell p-3">
                        <span *ngIf="subcategory.descripcion && subcategory.descripcion.trim()">{{ subcategory.descripcion }}</span>
                        <span *ngIf="!subcategory.descripcion || !subcategory.descripcion.trim()" class="text-gray-400">Sin descripción</span>
                    </td>
                    <td class="hidden sm:table-cell p-3">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ subcategory.categoria_nombre }}
                        </span>
                    </td>
                    <td class="hidden sm:table-cell text-center p-3">
                        <input type="checkbox" class="custom-toggle" [(ngModel)]="subcategory.is_active" disabled />
                    </td>
                    <td class="text-center p-3">
                        <div class="flex justify-center gap-2">
                            <p-button
                                (click)="editSubcategory(subcategory)"
                                styleClass="custom-flat-icon-button custom-flat-icon-button-edit"
                                pTooltip="Editar subcategoría"
                                tooltipPosition="top">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">edit</i>
                                </ng-template>
                            </p-button>
                            <p-button
                                (click)="deleteSubcategory(subcategory)"
                                styleClass="custom-flat-icon-button custom-flat-icon-button-delete"
                                pTooltip="Eliminar subcategoría"
                                tooltipPosition="top">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">delete</i>
                                </ng-template>
                            </p-button>
                        </div>
                    </td>
                </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="6" class="text-center py-8">
                        <div class="flex flex-col items-center justify-center space-y-4">
                            <i class="material-symbols-outlined text-6xl text-gray-300">database</i>
                            <div class="text-center">
                                <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay subcategorías</h3>
                                <p class="text-gray-500">Aún no se han creado subcategorías. Utiliza el botón "Crear Subcategoría" para agregar la primera.</p>
                            </div>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
        <div class="flex justify-center mt-6"></div>
    </div>
</div>

<p-dialog [(visible)]="subcategoryDialog" [style]="{ width: '90vw', maxWidth: '500px' }" [header]="isEditMode ? 'Editar Subcategoría' : 'Nueva Subcategoría'" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="grid grid-cols-1 gap-4">
            <div class="relative py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                <input type="text" id="nombre" name="nombre" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="subcategory.nombre" />
                <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">edit_document</span>
                <textarea id="descripcion" name="descripcion" rows="3" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="subcategory.descripcion"></textarea>
                <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">category</span>
                <p-dropdown
                    [options]="categories()"
                    [(ngModel)]="selectedCategory"
                    optionLabel="nombre"
                    placeholder="Seleccionar categoría"
                    class="w-full"
                    [styleClass]="'peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]'"
                    (onChange)="onCategoryChange($event)">
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Categoría</label>
            </div>
            <div class="flex flex-col items-center justify-center py-2">
                <label class="mb-2 text-sm font-medium">Activo</label>
                <input type="checkbox" class="custom-toggle" [(ngModel)]="subcategory.is_active" />
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()" [disabled]="saving()">Cancelar</button>
            <button pButton type="button" class="p-button w-full sm:w-24" [label]="saving() ? '' : 'Guardar'" (click)="saveSubcategory()" [loading]="saving()"></button>
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
export class SubcategoriasCrudComponent implements OnInit {
    subcategoryDialog: boolean = false;
    subcategories = signal<SubcategoryDisplay[]>([]);
    categories = signal<Category[]>([]);
    subcategory: Subcategory = {
        nombre: '',
        categoria_id: 0,
        is_active: true
    };
    selectedCategory: Category | null = null;
    selectedSubcategories: SubcategoryDisplay[] | null = null;
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
        private subcategoryService: SubcategoryService,
        private categoryService: CategoryService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loadData();
    }

        loadData() {
        this.loading.set(true);

        // Cargar tanto subcategorías como categorías
        forkJoin({
            subcategories: this.subcategoryService.getAllSubcategories(),
            categories: this.categoryService.getCategories()
        }).subscribe({
            next: (data) => {
                this.subcategories.set(data.subcategories);
                this.categories.set(data.categories);
                this.loading.set(false);

                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('❌ Error en loadData():', error);
                this.loading.set(false);
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        // Asegurar que las categorías estén cargadas
        if (this.categories().length === 0) {
            this.categoryService.getCategories().subscribe({
                next: (categories) => {
                    this.categories.set(categories);
                    this.openNewDialog();
                },
                error: (error) => {
                    console.error('Error cargando categorías:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cargar las categorías'
                    });
                }
            });
        } else {
            this.openNewDialog();
        }
    }

    private openNewDialog() {
        this.subcategory = {
            nombre: '',
            categoria_id: 0,
            is_active: true
        };
        this.selectedCategory = null;
        this.isEditMode = false;
        this.subcategoryDialog = true;
    }

    editSubcategory(subcategory: SubcategoryDisplay) {
        // Asegurar que las categorías estén cargadas
        if (this.categories().length === 0) {
            this.categoryService.getCategories().subscribe({
                next: (categories) => {
                    this.categories.set(categories);
                    this.editSubcategoryDialog(subcategory);
                },
                error: (error) => {
                    console.error('Error cargando categorías:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cargar las categorías'
                    });
                }
            });
        } else {
            this.editSubcategoryDialog(subcategory);
        }
    }

    private editSubcategoryDialog(subcategory: SubcategoryDisplay) {
        this.subcategory = {
            id: subcategory.id,
            nombre: subcategory.nombre,
            descripcion: subcategory.descripcion,
            categoria_id: subcategory.categoria_id,
            is_active: subcategory.is_active
        };
        this.selectedCategory = this.categories().find(c => c.id === subcategory.categoria_id) || null;
        this.isEditMode = true;
        this.subcategoryDialog = true;
    }

    onCategoryChange(event: any) {
        if (event.value) {
            this.subcategory.categoria_id = parseInt(event.value.id);
        } else {
            this.subcategory.categoria_id = 0;
        }
    }

    deleteSubcategory(subcategory: SubcategoryDisplay) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la subcategoría <span class='text-primary'>${subcategory.nombre}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.deleting.set(true);
            this.subcategoryService.deleteSubcategory(subcategory.id).subscribe({
                next: () => {
                    // Recargar todos los datos para obtener la información actualizada
                    this.loadData();

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Subcategoría "${subcategory.nombre}" eliminada exitosamente`,
                        life: 3000
                    });
                    this.deleting.set(false);
                },
                error: (error: any) => {
                    console.error('Error al eliminar subcategoría:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Error al eliminar la subcategoría "${subcategory.nombre}"`,
                        life: 3000
                    });
                    this.deleting.set(false);
                }
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.subcategoryDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
        this.subcategory = {
            nombre: '',
            categoria_id: 0,
            is_active: true
        };
        this.selectedCategory = null;
    }

    saveSubcategory() {
        if (!this.subcategory) return;

        if (this.subcategory.id) {
            // Actualizar
            const updateData = {
                nombre: this.subcategory.nombre,
                descripcion: this.subcategory.descripcion,
                categoria_id: parseInt(this.subcategory.categoria_id as any) || 0,
                is_active: this.subcategory.is_active
            };

            this.subcategoryService.updateSubcategory(this.subcategory.id, updateData).subscribe({
                next: (updatedSubcategory: any) => {
                    this.loadData(); // Recargar todos los datos para obtener la información actualizada

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Subcategoría actualizada correctamente'
                    });
                    this.hideDialog();
                },
                error: (error) => {
                    console.error('❌ Error al actualizar subcategoría:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar la subcategoría'
                    });
                }
            });
        } else {
            // Crear
            const createData = {
                nombre: this.subcategory.nombre || '',
                descripcion: this.subcategory.descripcion || '',
                categoria_id: this.subcategory.categoria_id || 0,
                is_active: this.subcategory.is_active || true
            };

            this.subcategoryService.createSubcategory(createData).subscribe({
                next: (newSubcategory: any) => {
                    this.loadData(); // Recargar todos los datos para obtener la información actualizada

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Subcategoría creada correctamente'
                    });
                    this.hideDialog();
                },
                error: (error) => {
                    console.error('❌ Error al crear subcategoría:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al crear la subcategoría'
                    });
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

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.subcategoryDialog) {
            this.hideDialog();
        }
    }


}
