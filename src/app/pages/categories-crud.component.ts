import { Component, OnInit, signal, ViewChild } from '@angular/core';
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

interface Category {
    id?: string;
    name?: string;
    description?: string;
    active?: boolean;
}

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
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <p-table
        #dt
        [value]="categories()"
        [rows]="10"
        [columns]="cols"
        [paginator]="true"
        [globalFilterFields]="['name', 'description', 'active']"
        [tableStyle]="{ 'min-width': '50rem' }"
        [(selection)]="selectedCategories"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Categorías</h5>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end">
                    <p-button label="Crear Categoría" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Activo</th>
                <th>Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-category>
            <tr>
                <td>{{ category.name }}</td>
                <td>{{ category.description }}</td>
                <td>
                    <p-inputSwitch [ngModel]="category.active !== false" [disabled]="true"></p-inputSwitch>
                </td>
                <td>
                    <p-button (click)="editCategory(category)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteCategory(category)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>
<p-dialog [(visible)]="categoryDialog" [style]="{ width: '500px' }" [header]="isEditMode ? 'Editar Categoría' : 'Nueva Categoría'" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="grid grid-cols-2 gap-4">
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="category.name" />
                <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">description</span>
                <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="category.description"></textarea>
                <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>
            <div class="flex flex-col items-center justify-center col-span-2">
                <label class="mb-2">Activo</label>
                <p-inputSwitch [(ngModel)]="category.active"></p-inputSwitch>
            </div>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="p-button-outlined" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button" (click)="saveCategory()">Guardar</button>
        </div>
    </ng-template>
</p-dialog>
<p-confirmDialog [style]="{ width: '350px' }" [draggable]="false">
    <ng-template pTemplate="footer" let-accept let-reject>
        <div class="flex justify-center gap-3">
            <button pButton type="button" label="Cancelar" class="p-button-outlined" (click)="reject()"></button>
            <button
                pButton
                type="button"
                label="Aceptar"
                (click)="saveCategory()"
            ></button>
        </div>
    </ng-template>
</p-confirmDialog>
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
export class CategoriesCrudComponent implements OnInit {
    categoryDialog: boolean = false;
    categories = signal<Category[]>([]);
    category: Category = {};
    selectedCategories: Category[] | null = null;
    submitted: boolean = false;
    cols: Column[] = [];
    isEditMode: boolean = false;

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadCategories();
        this.cols = [
            { field: 'name', header: 'Nombre' },
            { field: 'description', header: 'Descripción' },
            { field: 'active', header: 'Activo' }
        ];
    }

    loadCategories() {
        // Simulación de datos
        this.categories.set([
            { id: '1', name: 'Eléctrica', description: 'Herramientas eléctricas', active: true },
            { id: '2', name: 'Manual', description: 'Herramientas manuales', active: true }
        ]);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.category = {};
        this.submitted = false;
        this.isEditMode = false;
        this.categoryDialog = true;
    }

    editCategory(category: Category) {
        this.category = { ...category };
        this.isEditMode = true;
        this.categoryDialog = true;
    }

    deleteCategory(category: Category) {
        this.confirmationService.confirm({
            message: `
              <div style="display: flex; justify-content: center; align-items: center; width: 100%; min-height: 80px; margin-bottom: 16px;">
                <i class="material-symbols-outlined text-red-600 text-6xl" style="display: block;">delete</i>
              </div>
              <div style="text-align: center;">
                <strong>¿Estás seguro de eliminar ${category.name}?</strong>
                <p style="margin-top: 8px;">Una vez que aceptes, no podrás revertir los cambios.</p>
              </div>
            `,
            accept: () => {
                this.categories.set(this.categories().filter((val) => val.id !== category.id));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Categoría eliminada',
                    life: 3000
                });
            },
            rejectLabel: 'Cancelar',
            acceptLabel: 'Aceptar',
            rejectButtonStyleClass: 'p-button-outlined p-button-secondary',
            acceptButtonStyleClass: 'p-button p-button-danger'
        });
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.categories().length; i++) {
            if (this.categories()[i].id === id) {
                index = i;
                break;
            }
        }
        return index;
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
        this.submitted = true;
        let _categories = this.categories();

        if (this.category.name?.trim()) {
            if (this.category.id) {
                _categories[this.findIndexById(this.category.id!)] = this.category;
                this.categories.set([..._categories]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `¡${this.category.name} actualizada correctamente!`,
                    life: 3000
                });
                this.categoryDialog = false;
                this.category = {};
            } else {
                this.category.id = this.createId();
                this.categories.set([..._categories, this.category]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `¡${this.category.name} creada correctamente!`,
                    life: 3000
                });
                this.categoryDialog = false;
                this.category = {};
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
}
