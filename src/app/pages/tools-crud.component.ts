import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProductService, Product } from './service/product.service';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

// Extendiendo la interfaz Product para incluir las propiedades faltantes
interface ExtendedProduct extends Product {
    folio?: string;
    stock?: number;
    reorderValue?: number;
    active?: boolean;
}

@Component({
    selector: 'app-tool-crud',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        RatingModule,
        InputTextModule,
        TextareaModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        InputSwitchModule
    ],
    template: `

<p-toast></p-toast>

        <div class="p-6">
            
            <p-table
                #dt
                [value]="products()"
                [rows]="10"
                [columns]="cols"
                [paginator]="true"
                [globalFilterFields]="['name', 'description', 'folio', 'category', 'subcategory', 'stock', 'reorderValue', 'active']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedProducts"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                class="shadow-md rounded-lg"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h5 class="m-0 p-2">Administrar Herramientas</h5>
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
                <ng-template pTemplate="body" let-product>
                    <tr>
                        <td><img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" [alt]="product.name" style="width: 48px" class="rounded" /></td>
                        <td>{{ product.name }}</td>
                        <td>{{ product.description }}</td>
                        <td>{{ product.folio || product.code }}</td>
                        <td>{{ product.category }}</td>
                        <td>{{ product.subcategory || 'N/A' }}</td>
                        <td>{{ product.stock || product.quantity }}</td>
                        <td>{{ (product.reorderValue || product.price) | currency: 'MXN' }}</td>
                        <td>
                            <p-inputSwitch [ngModel]="product.active !== false" [disabled]="true"></p-inputSwitch>
                        </td>
                        <td>
                            <p-button (click)="editProduct(product)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">edit</i>
                                </ng-template>
                            </p-button>
                            <p-button (click)="deleteProduct(product)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                                <ng-template pTemplate="icon">
                                    <i class="material-symbols-outlined">delete</i>
                                </ng-template>
                            </p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
            <div class="flex justify-center mt-6">
                <!-- La paginación de PrimeNG ya está centrada por defecto si la tabla está centrada -->
            </div>
        </div>
        <!-- Diálogo para crear/editar herramienta -->
        <p-dialog [(visible)]="productDialog" [style]="{ width: '600px' }" [header]="isEditMode ? 'Editar Herramienta' : 'Nueva Herramienta'" [modal]="true" [draggable]="false">
            <ng-template pTemplate="content">
                <div class="grid grid-cols-2 gap-4">
                    <!-- Nombre -->
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                        <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="product.name" />
                        <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
                    </div>
                    <!-- Subcategoría -->
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">category</span>
                        <select id="subcategory" name="subcategory" class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" [(ngModel)]="product.subcategory">
                            <option value="" disabled selected>Subcategoría</option>
                            <option *ngFor="let sub of subcategories" [value]="sub">{{ sub }}</option>
                        </select>
                    </div>
                    <!-- Valor Reposición -->
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">payments</span>
                        <input type="number" id="reorderValue" name="reorderValue" class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Valor Reposición" [(ngModel)]="product.reorderValue" />
                        <label for="reorderValue" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Valor Reposición</label>
                    </div>
                    <!-- Folio -->
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">confirmation_number</span>
                        <input type="text" id="folio" name="folio" class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Folio" [(ngModel)]="product.folio" />
                        <label for="folio" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Folio</label>
                    </div>
                    <!-- Stock -->
                    <div class="relative">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">inventory_2</span>
                        <input type="number" id="stock" name="stock" class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Stock" [(ngModel)]="product.stock" />
                        <label for="stock" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Stock</label>
                    </div>
                    <!-- Activo (toggle) -->
                    <div class="flex flex-col items-center justify-center">
                        <label class="mb-2">Activo</label>
                        <p-inputSwitch [ngModel]="product.active !== false" [disabled]="true"></p-inputSwitch>
                    </div>
                    <!-- Descripción (ocupa dos columnas) -->
                    <div class="relative col-span-2">
                        <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">description</span>
                        <textarea id="description" name="description" rows="2" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="product.description"></textarea>
                        <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-sm text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
                    </div>
                    <!-- Selector de imagen (ocupa dos columnas) -->
                    <div class="col-span-2">
                        <label class="block mb-2">Selecciona la imagen</label>
                        <div class="flex flex-col items-center">
                            <label class="border-2 border-dashed border-gray-400 rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center" style="width: 150px; height: 150px;">
                                <span class="material-symbols-outlined text-4xl mb-2">cloud_upload</span>
                                <span>Click to upload image</span>
                                <input type="file" accept="image/*" (change)="onImageSelected($event)" class="hidden" />
                            </label>
                            <img *ngIf="product.image" [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + product.image" alt="Imagen" class="mt-2 rounded" style="max-width: 120px; max-height: 120px;" />
                        </div>
                    </div>
                </div>
                <!-- Botones -->
                <div class="flex justify-between mt-6">
                    <button pButton type="button" class="p-button-outlined" (click)="hideDialog()">Cancelar</button>
                    <button pButton type="button" class="p-button" (click)="saveProduct()">Publicar</button>
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
                        [ngClass]="{
                            'custom-confirm-button-delete': confirmIcon === 'delete',
                            'custom-confirm-button-warning': confirmIcon === 'warning'
                        }"
                        (click)="accept()"
                    ></button>
                </div>
            </ng-template>
        </p-confirmDialog>
    `,
    providers: [MessageService, ProductService, ConfirmationService],
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
export class ToolCrudComponent implements OnInit {
    productDialog: boolean = false;
    products = signal<ExtendedProduct[]>([]);
    product: ExtendedProduct = {};
    selectedProducts: ExtendedProduct[] | null = null;
    submitted: boolean = false;
    statuses: any[] = [];
    subcategories: string[] = ['Eléctrica', 'Manual', 'Medición', 'Corte', 'Jardinería'];
    @ViewChild('dt') dt!: Table;
    exportColumns: ExportColumn[] = [];
    cols: Column[] = [];
    isEditMode: boolean = false;

    // Nuevas propiedades para el ícono dinámico
    confirmIcon: string = 'delete';
    confirmIconColor: string = '#D9534F'; // rojo para delete por defecto

    constructor(
        private productService: ProductService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.productService.getProducts().then((data) => {
            // Mapear los datos del servicio a ExtendedProduct
            const extendedProducts: ExtendedProduct[] = data.map(product => ({
                ...product,
                folio: product.code,
                stock: product.quantity,
                reorderValue: product.price,
                active: true // Por defecto activo
            }));
            this.products.set(extendedProducts);
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.product = {};
        this.submitted = false;
        this.isEditMode = false;
        this.productDialog = true;
    }

    editProduct(product: ExtendedProduct) {
        this.product = { ...product };
        this.isEditMode = true;
        this.productDialog = true;
    }

    deleteProduct(product: ExtendedProduct) {
        this.confirmIcon = 'delete';
        this.confirmIconColor = '#D9534F';

        this.confirmationService.confirm({
            message: `
              <div style="display: flex; justify-content: center; align-items: center; width: 100%; min-height: 80px; margin-bottom: 16px;">
                <i class="material-symbols-outlined text-red-600 text-6xl" style="display: block;">delete</i>
              </div>
              <div style="text-align: center;">
                <strong>¿Estás seguro de eliminar ${product.name}?</strong>
                <p style="margin-top: 8px;">Una vez que aceptes, no podrás revertir los cambios.</p>
              </div>
            `,
            accept: () => {
                this.products.set(this.products().filter((val) => val.id !== product.id));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Herramienta eliminada',
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
        this.productDialog = false;
        this.submitted = false;
        this.isEditMode = false;
    }

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.product.image = e.target.result;
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    findIndexById(id: string): number {
        let index = -1;
        for (let i = 0; i < this.products().length; i++) {
            if (this.products()[i].id === id) {
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

    saveProduct() {
        this.submitted = true;
        let _products = this.products();

        if (this.product.name?.trim()) {
            if (this.product.id) {
                this.confirmIcon = 'warning';
                this.confirmIconColor = '#FFA726'; // color ámbar para advertencia

                this.confirmationService.confirm({
                    message: `¿Estás seguro que deseas continuar con esta operación?<br><small>Una vez que aceptes, los cambios reemplazarán la información actual.</small>`,
                    header: 'Confirmar Actualización',
                    acceptButtonStyleClass: 'p-button-warning custom-accept-button',
                    rejectButtonStyleClass: 'p-button-text',
                    acceptLabel: 'Aceptar',
                    rejectLabel: 'Cancelar',
                    accept: () => {
                        _products[this.findIndexById(this.product.id!)] = this.product;
                        this.products.set([..._products]);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `¡${this.product.name} actualizado correctamente!`,
                            life: 3000
                        });
                        this.productDialog = false;
                        this.product = {};
                    }
                });
            } else {
                this.product.id = this.createId();
                this.product.code = this.createId();
                this.product.image = 'product-placeholder.svg';
                this.products.set([..._products, this.product]);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `¡${this.product.name} creado correctamente!`,
                    life: 3000
                });
                this.productDialog = false;
                this.product = {};
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
