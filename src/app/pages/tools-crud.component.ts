import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MessageService } from 'primeng/api';
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

interface Tool {
    id: string;
    name: string;
    description: string;
    folio: string;
    category: string;
    subcategory: string;
    stock: number;
    reorderValue: number;
    active: boolean;
    image?: string;
}

@Component({
    selector: 'app-tools-crud',
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
        IconFieldModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <p-table
        #dt
        [value]="tools"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'description', 'folio', 'category', 'subcategory']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedTools"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[10, 20, 30]"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Herramientas</h5>
            </div>
            <div class="flex items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end">
                    <p-button label="Crear Herramienta" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Folio</th>
                <th>Categoría</th>
                <th>Subcategoría</th>
                <th>Stock</th>
                <th>Valor Reposición</th>
                <th>Activo</th>
                <th>Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tool>
            <tr>
                <td><img *ngIf="tool.image" [src]="tool.image" alt="Imagen" style="width: 48px" class="rounded" /></td>
                <td>{{ tool.name }}</td>
                <td>{{ tool.description }}</td>
                <td>{{ tool.folio }}</td>
                <td>{{ tool.category }}</td>
                <td>{{ tool.subcategory }}</td>
                <td>{{ tool.stock }}</td>
                <td>{{ tool.reorderValue | currency: 'MXN' }}</td>
                <td>
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="tool.active" disabled />
                </td>
                <td>
                    <p-button (click)="editTool(tool)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteTool(tool)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="10" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center space-y-4">
                        <i class="material-symbols-outlined text-6xl text-gray-300">database</i>
                        <div class="text-center">
                            <h3 class="text-lg font-semibold text-gray-600 mb-2">No hay herramientas</h3>
                            <p class="text-gray-500">Aún no se han creado herramientas. Utiliza el botón "Crear Herramienta" para agregar la primera.</p>
                        </div>
                    </div>
                </td>
            </tr>
        </ng-template>
    </p-table>
    <div class="flex justify-center mt-6"></div>
</div>
<p-dialog
  [(visible)]="toolDialog"
  [style]="{ width: '500px' }"
  [modal]="true"
  [draggable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Herramienta' : 'Nueva Herramienta' }}
    </span>
  </ng-template>
    <ng-template pTemplate="content">
        <div class="grid grid-cols-2 gap-4">
            <div class="relative col-span-2 py-2 mt-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="tool.name" />
                <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>
            <div class="relative col-span-2">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">edit_document</span>
                <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="tool.description"></textarea>
                <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">confirmation_number</span>
                <input type="text" id="folio" name="folio" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Folio" [(ngModel)]="tool.folio" />
                <label for="folio" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Folio</label>
            </div>
            <!-- Eliminados los campos de categoría y subcategoría -->
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">inventory_2</span>
                <input type="number" id="stock" name="stock" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Stock" [(ngModel)]="tool.stock" />
                <label for="stock" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Stock</label>
            </div>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">payments</span>
                <input type="number" id="reorderValue" name="reorderValue" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Valor Reposición" [(ngModel)]="tool.reorderValue" />
                <label for="reorderValue" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Valor Reposición</label>
            </div>
            <div class="flex flex-col items-center justify-center col-span-2">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" [(ngModel)]="tool.active" />
            </div>
            <div class="col-span-2">
                <label class="block mb-2">Selecciona la imagen</label>
                <div class="flex flex-col items-center">
                    <label class="border-2 border-dashed border-gray-400 rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center" style="width: 150px; height: 150px;">
                        <span class="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                        <span>Click para subir imagen</span>
                        <input type="file" accept="image/*" (change)="onImageSelected($event)" class="hidden" />
                    </label>
                    <img *ngIf="tool.image" [src]="tool.image" alt="Imagen" class="mt-2 rounded" style="max-width: 120px; max-height: 120px;" />
                </div>
            </div>
        </div>
        <div class="flex justify-end gap-4 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button w-24" (click)="saveTool()">Guardar</button>
        </div>
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
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
        }`
    ]
})
export class ToolsCrudComponent implements OnInit {
    tools: Tool[] = [];
    toolDialog: boolean = false;
    tool: Tool = this.emptyTool();
    selectedTools: Tool[] | null = null;
    isEditMode: boolean = false;
    confirmIcon: string = 'delete';
    @ViewChild('dt') dt!: Table;

    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.loadDemoData();
    }

    loadDemoData() {
        this.tools = [
            {
                id: '1',
                name: 'Taladro',
                description: 'Taladro eléctrico de 500W',
                folio: 'TAL-001',
                category: 'Eléctrica',
                subcategory: 'Manual',
                stock: 10,
                reorderValue: 1200,
                active: true,
                image: ''
            },
            {
                id: '2',
                name: 'Martillo',
                description: 'Martillo de carpintero',
                folio: 'MAR-002',
                category: 'Manual',
                subcategory: 'Corte',
                stock: 5,
                reorderValue: 300,
                active: false,
                image: ''
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.tool = this.emptyTool();
        this.isEditMode = false;
        this.toolDialog = true;
    }

    editTool(tool: Tool) {
        this.tool = { ...tool };
        this.isEditMode = true;
        this.toolDialog = true;
    }

    deleteTool(tool: Tool) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la herramienta <span class='text-primary'>${tool.name}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.tools = this.tools.filter(t => t.id !== tool.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Herramienta eliminada',
                life: 3000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.toolDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
    }

    saveTool() {
        if (this.tool.name?.trim()) {
            if (this.tool.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar la herramienta <span class='text-primary'>${this.tool.name}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.tools.findIndex(t => t.id === this.tool.id);
                    if (idx > -1) this.tools[idx] = { ...this.tool };
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Herramienta actualizada',
                        life: 3000
                    });
                    this.toolDialog = false;
                    this.isEditMode = false;
                    this.tool = this.emptyTool();
                };
                this.showCustomConfirm = true;
            } else {
                this.tool.id = this.createId();
                this.tools.push({ ...this.tool });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Herramienta creada',
                    life: 3000
                });
                this.toolDialog = false;
                this.isEditMode = false;
                this.tool = this.emptyTool();
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

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.tool.image = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
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

    emptyTool(): Tool {
        return {
            id: '',
            name: '',
            description: '',
            folio: '',
            category: '',
            subcategory: '',
            stock: 0,
            reorderValue: 0,
            active: true,
            image: ''
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.toolDialog) {
            this.hideDialog();
        }
    }
}
