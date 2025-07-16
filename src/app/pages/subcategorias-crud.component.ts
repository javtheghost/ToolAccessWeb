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

interface Subcategory {
    id?: string;
    name?: string;
    description?: string;
    category?: string;
    active?: boolean;
}

interface Column {
    field: string;
    header: string;
}

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
        InputIconModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <p-table
        #dt
        [value]="subcategories()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'description', 'category', 'active']"
        [tableStyle]="{ 'min-width': '50rem' }"
        [(selection)]="selectedSubcategories"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Subcategorías</h5>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end">
                    <p-button label="Crear Subcategoría" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Activo</th>
                <th>Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-subcategory>
            <tr>
                <td>{{ subcategory.name }}</td>
                <td>{{ subcategory.description }}</td>
                <td>{{ subcategory.category }}</td>
                <td>
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="subcategory.active" disabled />
                </td>
                <td>
                    <p-button (click)="editSubcategory(subcategory)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteSubcategory(subcategory)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
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
<p-dialog [(visible)]="subcategoryDialog" [style]="{ width: '500px' }" [header]="isEditMode ? 'Editar Subcategoría' : 'Nueva Subcategoría'" [modal]="true" [draggable]="false">
    <ng-template pTemplate="content">
        <div class="grid grid-cols-2 gap-4">
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="subcategory.name" />
                <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">description</span>
                <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="subcategory.description"></textarea>
                <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">category</span>
                <input type="text" id="category" name="category" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Categoría" [(ngModel)]="subcategory.category" />
                <label for="category" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Categoría</label>
            </div>
            <div class="flex flex-col items-center justify-center col-span-2">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" [(ngModel)]="subcategory.active" />
            </div>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="custom-cancel-btn" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button" (click)="saveSubcategory()">Guardar</button>
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
          class="custom-cancel-btn px-4 py-2 font-semibold"
          (click)="onCustomConfirmReject()"
        >Cancelar</button>
        <button type="button"
          [ngClass]="confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning'"
          class="px-4 py-2 rounded font-semibold"
          (click)="onCustomConfirmAccept()"
        >Aceptar</button>
      </div>
    </div>
  </div>
</div>
    `,
    providers: [MessageService],
    styles: []
})
export class SubcategoriasCrudComponent implements OnInit {
    subcategoryDialog: boolean = false;
    subcategories = signal<Subcategory[]>([]);
    subcategory: Subcategory = {};
    selectedSubcategories: Subcategory[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    constructor(
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadSubcategories();
    }

    loadSubcategories() {
        this.subcategories.set([
            { id: '1', name: 'Taladros', description: 'Herramientas de perforación', category: 'Eléctrica', active: true },
            { id: '2', name: 'Sierras', description: 'Herramientas de corte', category: 'Manual', active: true },
            { id: '3', name: 'Destornilladores', description: 'Herramientas de ajuste', category: 'Manual', active: false }
        ]);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.subcategory = {};
        this.isEditMode = false;
        this.subcategoryDialog = true;
    }

    editSubcategory(subcategory: Subcategory) {
        this.subcategory = { ...subcategory };
        this.isEditMode = true;
        this.subcategoryDialog = true;
    }

    deleteSubcategory(subcategory: Subcategory) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la subcategoría <span class='text-primary'>${subcategory.name}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.subcategories.set(this.subcategories().filter((val) => val.id !== subcategory.id));
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Subcategoría eliminada',
                life: 3000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.subcategoryDialog = false;
        this.isEditMode = false;
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

    saveSubcategory() {
        if (this.subcategory.name?.trim()) {
            if (this.subcategory.id) {
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar la subcategoría <span class='text-primary'>${this.subcategory.name}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.subcategories().findIndex(s => s.id === this.subcategory.id);
                    if (idx > -1) this.subcategories().splice(idx, 1, { ...this.subcategory });
                    this.subcategories.set([...this.subcategories()]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Subcategoría actualizada',
                        life: 3000
                    });
                    this.subcategoryDialog = false;
                    this.isEditMode = false;
                    this.subcategory = {};
                };
                this.showCustomConfirm = true;
            } else {
                this.subcategory.id = this.createId();
                this.subcategories.set([...this.subcategories(), { ...this.subcategory }]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Subcategoría creada',
                    life: 3000
                });
                this.subcategoryDialog = false;
                this.isEditMode = false;
                this.subcategory = {};
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
} 