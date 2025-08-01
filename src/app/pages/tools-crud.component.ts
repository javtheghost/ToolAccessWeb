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
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToolsService, Tool, ToolCreateRequest, ToolUpdateRequest } from './service/tools.service';
import { CategoryService } from './service/category.service';
import { SubcategoryService, SubcategoryDisplay } from './service/subcategory.service';
import { Category } from './interfaces';

@Component({
    selector: 'app-tools-crud',
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
        DropdownModule,
        InputNumberModule,
        TooltipModule,
        SkeletonModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-6">
    <!-- Loading State -->
    <div *ngIf="loading" class="space-y-4">
        <!-- Header siempre visible -->
        <div class="flex items-center justify-between">
            <h5 class="m-0 p-2 text-[var(--primary-color)]">Administrar Herramientas</h5>
            <p-button label="Crear Herramienta" icon="pi pi-plus" (onClick)="openNew()" [disabled]="true"></p-button>
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
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="150px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="200px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="140px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="80px" styleClass="bg-white/20"></p-skeleton>
                    <p-skeleton height="1.5rem" width="120px" styleClass="bg-white/20"></p-skeleton>
                </div>
            </div>
            <!-- Filas skeleton -->
            <div class="p-4 space-y-3">
                <div *ngFor="let item of [1,2,3,4,5]" class="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                    <p-skeleton height="1rem" width="80px"></p-skeleton>
                    <p-skeleton height="1rem" width="150px"></p-skeleton>
                    <p-skeleton height="1rem" width="200px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                    <p-skeleton height="1rem" width="80px"></p-skeleton>
                    <p-skeleton height="1rem" width="140px"></p-skeleton>
                    <p-skeleton height="1rem" width="80px"></p-skeleton>
                    <p-skeleton height="1rem" width="120px"></p-skeleton>
                </div>
            </div>
        </div>
    </div>

    <!-- Content when loaded -->
    <div *ngIf="!loading">
        <p-table
            #dt
            [value]="tools"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['nombre', 'descripcion', 'folio', 'categoria_nombre', 'subcategoria_nombre']"
            [tableStyle]="{ 'min-width': '1200px' }"
            [(selection)]="selectedTools"
            [rowHover]="true"
            dataKey="id"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} herramientas"
            [rowsPerPageOptions]="[5, 10, 20]"
            class="shadow-md rounded-lg"
        >
        <ng-template #caption>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h5 class="m-0 p-2 text-[var(--primary-color)] text-lg sm:text-xl">Administrar Herramientas</h5>
            </div>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
                <p-iconfield class="flex-1">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar herramientas..." />
                </p-iconfield>
                <p-button
                    label="Crear Herramienta"
                    icon="pi pi-plus"
                    (onClick)="openNew()"
                    styleClass="w-full sm:w-auto">
                </p-button>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th class="text-center p-3" style="min-width: 80px;">Imagen</th>
                <th class="text-left p-3" style="min-width: 150px;">Nombre</th>
                <th class="text-left p-3" style="min-width: 200px;">Descripción</th>
                <th class="text-center p-3" style="min-width: 120px;">Folio</th>
                <th class="text-left p-3" style="min-width: 120px;">Categoría</th>
                <th class="text-left p-3" style="min-width: 120px;">Subcategoría</th>
                <th class="text-center p-3" style="min-width: 80px;">Stock</th>
                <th class="text-center p-3" style="min-width: 140px;">Valor Reposición</th>
                <th class="text-center p-3" style="min-width: 80px;">Activo</th>
                <th class="text-center p-3" style="min-width: 120px;">Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tool>
            <tr class="hover:bg-gray-50">
                <td class="text-center p-3">
                    <img *ngIf="tool.foto_url" [src]="getImageUrl(tool.foto_url)" alt="Imagen" style="width: 48px; height: 48px; object-fit: cover;" class="rounded" />
                    <div *ngIf="!tool.foto_url" class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-400">image</span>
                    </div>
                </td>
                <td class="p-3">
                    <div class="font-medium">{{ tool.nombre }}</div>
                </td>
                <td class="p-3">
                    <span *ngIf="tool.descripcion && tool.descripcion.trim()">{{ tool.descripcion }}</span>
                    <span *ngIf="!tool.descripcion || !tool.descripcion.trim()" class="text-gray-400 font-bold">Sin descripción</span>
                </td>
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600">{{ tool.folio }}</span>
                </td>
                <td class="p-3">{{ tool.categoria_nombre || 'N/A' }}</td>
                <td class="p-3">{{ tool.subcategoria_nombre || 'N/A' }}</td>
                <td class="text-center p-3">{{ tool.stock }}</td>
                <td class="text-center p-3">{{ tool.valor_reposicion | currency: 'MXN' }}</td>
                <td class="text-center p-3">
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="tool.is_active" disabled />
                </td>
                <td class="text-center p-3">
                    <div class="flex justify-center gap-2">
                        <p-button
                            (click)="editTool(tool)"
                            styleClass="custom-flat-icon-button custom-flat-icon-button-edit"
                            pTooltip="Editar herramienta"
                            tooltipPosition="top">
                            <ng-template pTemplate="icon">
                                <i class="material-symbols-outlined">edit</i>
                            </ng-template>
                        </p-button>
                        <p-button
                            (click)="deleteTool(tool)"
                            styleClass="custom-flat-icon-button custom-flat-icon-button-delete"
                            pTooltip="Eliminar herramienta"
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
  [style]="{ width: '95vw', maxWidth: '600px' }"
  [modal]="true"
  [draggable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Herramienta' : 'Nueva Herramienta' }}
    </span>
  </ng-template>
  <ng-template pTemplate="content">
    <form [formGroup]="toolForm" (ngSubmit)="saveTool()">
        <div class="grid grid-cols-1 gap-4">
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

            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none">edit_document</span>
                <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="2"
                    class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Descripción"
                    [class.border-red-500]="isFieldInvalid('descripcion')"
                    [class.border-gray-300]="!isFieldInvalid('descripcion')"></textarea>
                <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
                <div *ngIf="isFieldInvalid('descripcion')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('descripcion') }}</div>
            </div>

            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">inventory_2</span>
                <p-dropdown
                    [options]="subcategories"
                    formControlName="subcategoria_id"
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccionar subcategoría"
                    [style]="{ width: '100%' }"
                    class="w-full"
                    [styleClass]="'h-12 px-10'"
                    [showClear]="true"
                    [class.border-red-500]="isFieldInvalid('subcategoria_id')"
                    [class.border-gray-300]="!isFieldInvalid('subcategoria_id')">
                    <ng-template pTemplate="selectedItem" let-subcategory>
                        <div class="flex items-center justify-start h-full w-full">
                            <span>{{ subcategory.nombre }}</span>
                        </div>
                    </ng-template>
                    <ng-template pTemplate="item" let-subcategory>
                        <div class="flex items-center justify-start h-full w-full">
                            <div class="flex flex-col">
                                <span class="font-medium">{{ subcategory.nombre }}</span>
                                <span class="text-sm text-gray-500">{{ subcategory.categoria_nombre }}</span>
                            </div>
                        </div>
                    </ng-template>
                </p-dropdown>
                <div *ngIf="isFieldInvalid('subcategoria_id')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('subcategoria_id') }}</div>
            </div>

            <!-- Mostrar folio solo en modo edición como referencia -->
            <div *ngIf="isEditMode" class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">confirmation_number</span>
                <input
                    type="text"
                    formControlName="folio"
                    class="peer block w-full h-12 rounded-lg border bg-gray-100 px-10 text-sm text-gray-600 focus:outline-none"
                    placeholder=" "
                    readonly />
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-500 duration-300 bg-white px-1">Folio (Solo lectura)</label>
                <div class="text-xs text-gray-500 mt-1 ml-10">Folio generado automáticamente</div>
            </div>

            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none">inventory_2</span>
                <input
                    type="number"
                    id="stock"
                    formControlName="stock"
                    min="0"
                    max="9999"
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                    placeholder=" "
                    aria-label="Stock"
                    [class.border-red-500]="isFieldInvalid('stock')"
                    [class.border-gray-300]="!isFieldInvalid('stock')" />
                <label for="stock" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Stock</label>
                <div *ngIf="isFieldInvalid('stock')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('stock') }}</div>
            </div>

            <div class="relative col-span-1">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-10">payments</span>
                <p-inputnumber
                    formControlName="valor_reposicion"
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
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Valor Reposición</label>
                <div *ngIf="isFieldInvalid('valor_reposicion')" class="text-red-500 text-xs mt-1 ml-10">{{ getErrorMessage('valor_reposicion') }}</div>
            </div>

            <div class="flex flex-col items-center justify-center col-span-1">
                <label class="mb-2">Activo</label>
                <input type="checkbox" class="custom-toggle" formControlName="is_active" />
            </div>

            <div class="col-span-1">
                <label class="block mb-2">Selecciona la imagen</label>
                <div class="flex flex-col items-center">
                    <label class="border-2 border-dashed border-gray-400 rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center hover:border-[var(--primary-color)] transition-colors" style="width: 150px; height: 150px;">
                        <span class="material-symbols-outlined text-4xl mb-2 text-gray-400">cloud_upload</span>
                        <span class="text-sm text-gray-500">Click para subir imagen</span>
                        <span class="text-xs text-gray-400 mt-1">Máx. 5MB</span>
                        <input type="file" accept="image/*" (change)="onImageSelected($event)" class="hidden" />
                    </label>

                    <!-- Imagen cargada con botón de eliminar -->
                    <div *ngIf="selectedImage || tool.foto_url" class="mt-2 relative">
                        <img [src]="getImagePreview()" alt="Imagen" class="rounded" style="max-width: 120px; max-height: 120px; object-fit: cover;" />
                        <button
                            type="button"
                            (click)="removeImage()"
                            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                            title="Eliminar imagen">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()">Cancelar</button>
            <button pButton type="submit" class="p-button w-full sm:w-24" [disabled]="toolForm.invalid">Guardar</button>
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
<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN PARA ELIMINACIÓN DE IMAGEN -->
<div *ngIf="showImageDeleteConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative" style="background: #fff;">
    <button type="button" (click)="onImageDeleteConfirmReject()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
      <span class="material-symbols-outlined">close</span>
    </button>
    <div class="flex flex-col items-start">
      <i class="material-symbols-outlined text-6xl mb-4 text-danger">delete</i>
      <div class="text-left mb-6">
        <div [innerHTML]="imageDeleteConfirmMessage"></div>
      </div>
      <div class="flex gap-4 self-end">
        <button type="button"
          class="custom-cancel-btn px-4 py-2 font-semibold w-24 text-center"
          (click)="onImageDeleteConfirmReject()"
        >Cancelar</button>
        <button type="button"
          class="custom-confirm-accept-danger px-4 py-2 rounded font-semibold w-24 text-center"
          (click)="onImageDeleteConfirmAccept()"
        >Eliminar</button>
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

        /* Estilos para tabla scrolleable */
        :host ::ng-deep .p-table {
            overflow-x: auto !important;
        }

        :host ::ng-deep .p-table .p-table-wrapper {
            overflow-x: auto !important;
        }

        :host ::ng-deep .p-table .p-table-content {
            overflow-x: auto !important;
        }

        /* Estilos para dropdown de subcategoría */
        :host ::ng-deep .p-dropdown {
            height: 3rem !important;
            border-radius: 0.5rem !important;
            border: 1px solid #d1d5db !important;
            background-color: transparent !important;
            transition: all 0.3s ease !important;
            width: 100% !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            padding-left: 2.5rem !important;
            height: 3rem !important;
            font-size: 0.875rem !important;
            color: #111827 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled):hover {
            border-color: #9ca3af !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled).p-focus {
            outline: none !important;
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-trigger {
            width: 2.5rem !important;
            color: #6b7280 !important;
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

    // Formulario reactivo
    toolForm!: FormGroup;

    // Modal personalizado
    showCustomConfirm: boolean = false;
    confirmMessage: string = '';
    confirmAction: (() => void) | null = null;

    // Variables para confirmación de eliminación de imagen
    showImageDeleteConfirm: boolean = false;
    imageDeleteConfirmMessage: string = '';
    imageDeleteConfirmAction: (() => void) | null = null;

    // Datos para dropdowns
    categories: Category[] = [];
    subcategories: SubcategoryDisplay[] = [];
    selectedCategory: Category | null = null;
    selectedSubcategory: SubcategoryDisplay | null = null;

    // Loading states
    loading: boolean = false;
    loadingCategories: boolean = false;

    // Manejo de imágenes
    selectedImage: File | null = null;
    imagePreview: string | null = null;
    hasNewImage: boolean = false; // Para rastrear si se seleccionó una nueva imagen

    constructor(
        private messageService: MessageService,
        private toolsService: ToolsService,
        private categoryService: CategoryService,
        private subcategoryService: SubcategoryService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadTools();
        this.loadCategories();
    }

    initForm() {
        this.toolForm = this.fb.group({
            nombre: ['', [
                Validators.required,
                Validators.pattern(/^[\wáéíóúÁÉÍÓÚñÑ\s\-.,]{3,100}$/),
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            descripcion: ['', [
                Validators.pattern(/^[\wáéíóúÁÉÍÓÚñÑ\s¡!¿?@#$%&*()\-_=+.,:;'"\n\r]{3,200}$/),
                Validators.minLength(3),
                Validators.maxLength(200)
            ]],
            folio: [''],
            subcategoria_id: [null, [Validators.required]],
            stock: [1, [
                Validators.required,
                Validators.pattern(/^(0|[1-9]\d{0,3})$/),
                Validators.min(0),
                Validators.max(9999)
            ]],
            valor_reposicion: [0, [
                Validators.required,
                Validators.pattern(/^\d{1,6}(\.\d{1,2})?$/),
                Validators.min(0),
                Validators.max(999999.99)
            ]],
            is_active: [true]
        });
    }

    // Getters para acceder fácilmente a los controles del formulario
    get nombre() { return this.toolForm.get('nombre'); }
    get descripcion() { return this.toolForm.get('descripcion'); }
    get folio() { return this.toolForm.get('folio'); }
    get subcategoria_id() { return this.toolForm.get('subcategoria_id'); }
    get stock() { return this.toolForm.get('stock'); }
    get valor_reposicion() { return this.toolForm.get('valor_reposicion'); }
    get is_active() { return this.toolForm.get('is_active'); }

    // Métodos de validación personalizados
    getErrorMessage(controlName: string): string {
        const control = this.toolForm.get(controlName);
        if (control?.errors && control.touched) {
            if (control.errors['required']) {
                if (controlName === 'nombre') {
                    return 'Este campo es requerido';
                }
                if (controlName === 'subcategoria_id') {
                    return 'Debes seleccionar una subcategoría';
                }
                return 'Este campo es requerido';
            }
            if (control.errors['minlength']) {
                if (controlName === 'nombre') {
                    return 'Mínimo 3 caracteres';
                }
                if (controlName === 'descripcion') {
                    return 'Mínimo 3 caracteres';
                }
                return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
            }
            if (control.errors['maxlength']) {
                if (controlName === 'nombre') {
                    return 'Máximo 100 caracteres';
                }
                if (controlName === 'descripcion') {
                    return 'Máximo 200 caracteres';
                }
                return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
            }
            if (control.errors['pattern']) {
                if (controlName === 'nombre') {
                    return 'Solo letras, números, guiones y puntos';
                }
                if (controlName === 'stock') {
                    return 'Solo números del 0 al 9999';
                }
                if (controlName === 'valor_reposicion') {
                    return 'Solo números con máximo dos decimales';
                }
                if (controlName === 'descripcion') {
                    return 'Solo caracteres permitidos';
                }
                return 'Formato no válido';
            }
            if (control.errors['min']) {
                if (controlName === 'valor_reposicion') {
                    return `Valor mínimo: ${control.errors['min'].min}`;
                }
                return `Valor mínimo: ${control.errors['min'].min}`;
            }
            if (control.errors['max']) {
                if (controlName === 'valor_reposicion') {
                    return `Valor máximo: ${control.errors['max'].max}`;
                }
                return `Valor máximo: ${control.errors['max'].max}`;
            }
        }
        return '';
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.toolForm.get(controlName);
        return !!(control?.invalid && control?.touched);
    }

    loadTools() {
        this.loading = true;
        this.toolsService.getTools().subscribe({
            next: (tools) => {
                this.tools = tools;
                this.loading = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar herramientas',
                    life: 3000
                });
                this.loading = false;
            }
        });
    }

    loadCategories() {
        this.loadingCategories = true;
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
                // Cargar subcategorías después de las categorías
                this.loadSubcategories();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar categorías',
                    life: 3000
                });
                this.loadingCategories = false;
            }
        });
    }

    loadSubcategories() {
        this.subcategoryService.getAllSubcategories().subscribe({
            next: (subcategories) => {
                this.subcategories = subcategories;
                this.loadingCategories = false;
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar subcategorías',
                    life: 3000
                });
                this.loadingCategories = false;
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.tool = this.emptyTool();
        this.selectedSubcategory = null;
        this.isEditMode = false;
        this.selectedImage = null;
        this.imagePreview = null;
        this.hasNewImage = false;
        this.toolForm.reset({
            nombre: '',
            descripcion: '',
            folio: '',
            subcategoria_id: null,
            stock: 1,
            valor_reposicion: 0,
            is_active: true
        });
        this.toolDialog = true;
    }

    editTool(tool: Tool) {
        this.tool = { ...tool };
        // Buscar la subcategoría seleccionada
        if (tool.subcategoria_id) {
            this.selectedSubcategory = this.subcategories.find(s => s.id === tool.subcategoria_id) || null;
        }

        // Actualizar el formulario con los datos de la herramienta
        this.toolForm.patchValue({
            nombre: tool.nombre,
            descripcion: tool.descripcion,
            folio: tool.folio,
            subcategoria_id: tool.subcategoria_id,
            stock: tool.stock,
            valor_reposicion: tool.valor_reposicion,
            is_active: tool.is_active
        });

        this.selectedImage = null;
        this.imagePreview = null;
        this.hasNewImage = false;
        this.isEditMode = true;
        this.toolDialog = true;
    }

    deleteTool(tool: Tool) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la herramienta <span class='text-primary'>${tool.nombre}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.toolsService.deleteTool(tool.id).subscribe({
                next: () => {
                    this.tools = this.tools.filter(t => t.id !== tool.id);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Herramienta eliminada',
                        life: 3000
                    });
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al eliminar herramienta',
                        life: 3000
                    });
                }
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.toolDialog = false;
        this.isEditMode = false;
        this.selectedSubcategory = null;
        this.selectedImage = null;
        this.imagePreview = null;
        this.hasNewImage = false;
        this.showCustomConfirm = false;
        this.toolForm.reset();
    }

    saveTool() {
        if (this.toolForm.valid) {
            const formValue = this.toolForm.value;

            // Validar que subcategoria_id sea un número válido
            if (!formValue.subcategoria_id || formValue.subcategoria_id <= 0) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Debes seleccionar una subcategoría válida',
                    life: 3000
                });
                return;
            }

            // Asegurar que subcategoria_id sea un número
            const subcategoriaId = Number(formValue.subcategoria_id);
            if (isNaN(subcategoriaId) || subcategoriaId <= 0) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'El ID de subcategoría debe ser un número válido',
                    life: 3000
                });
                return;
            }

            if (this.tool.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                let confirmMessage = `¿Estás seguro que deseas actualizar la herramienta <span class='text-primary'>${formValue.nombre}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;

                // Agregar información sobre la imagen si se seleccionó una nueva
                if (this.hasNewImage && this.selectedImage) {
                    confirmMessage += `<br><br><span class='text-info'>📷 Se actualizará la imagen de la herramienta.</span>`;
                }

                this.confirmMessage = confirmMessage;
                this.confirmAction = () => {
                    const updateData: ToolUpdateRequest = {
                        nombre: formValue.nombre,
                        subcategoria_id: subcategoriaId,
                        folio: formValue.folio,
                        stock: formValue.stock,
                        valor_reposicion: formValue.valor_reposicion,
                        descripcion: formValue.descripcion,
                        imagen: this.hasNewImage && this.selectedImage ? this.selectedImage : undefined,
                        is_active: Boolean(formValue.is_active)
                    };

                    this.toolsService.updateTool(this.tool.id, updateData).subscribe({
                        next: (updatedTool) => {
                            const idx = this.tools.findIndex(t => t.id === this.tool.id);
                            if (idx > -1) this.tools[idx] = updatedTool;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Herramienta actualizada',
                                life: 3000
                            });
                            this.toolDialog = false;
                            this.isEditMode = false;
                            this.tool = this.emptyTool();
                            this.selectedSubcategory = null;
                            this.selectedImage = null;
                            this.imagePreview = null;
                            this.hasNewImage = false;
                            this.toolForm.reset();
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: error.message || 'Error al actualizar herramienta',
                                life: 3000
                            });
                        }
                    });
                };
                this.showCustomConfirm = true;
            } else {
                // Crear nueva herramienta
                const createData: ToolCreateRequest = {
                    nombre: formValue.nombre,
                    subcategoria_id: subcategoriaId,
                    folio: formValue.folio,
                    stock: formValue.stock,
                    valor_reposicion: formValue.valor_reposicion,
                    descripcion: formValue.descripcion,
                    imagen: this.selectedImage || undefined,
                    is_active: Boolean(formValue.is_active)
                };

                this.toolsService.createTool(createData).subscribe({
                    next: (newTool) => {
                        this.tools.push(newTool);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Herramienta creada',
                            life: 3000
                        });
                        this.toolDialog = false;
                        this.isEditMode = false;
                        this.tool = this.emptyTool();
                        this.selectedSubcategory = null;
                        this.selectedImage = null;
                        this.imagePreview = null;
                        this.hasNewImage = false;
                        this.toolForm.reset();
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al crear herramienta',
                            life: 3000
                        });
                    }
                });
            }
        } else {
            // Marcar todos los campos como touched para mostrar errores
            Object.keys(this.toolForm.controls).forEach(key => {
                const control = this.toolForm.get(key);
                control?.markAsTouched();
            });

            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Por favor, completa todos los campos requeridos correctamente',
                life: 3000
            });
        }
    }

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Solo se permiten archivos de imagen',
                    life: 3000
                });
                return;
            }

            // Validar extensión del archivo
            const fileName = file.name.toLowerCase();
            const validExtensions = /\.(jpg|png|webp)$/;
            if (!validExtensions.test(fileName)) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Solo se permiten archivos JPG, PNG y WEBP',
                    life: 3000
                });
                return;
            }

            // Validar tamaño (máximo 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'La imagen no puede exceder 5MB',
                    life: 3000
                });
                return;
            }

            this.selectedImage = file;
            this.hasNewImage = true; // Marcar que se seleccionó una nueva imagen

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreview = e.target.result;
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);

            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: this.isEditMode ? 'Nueva imagen cargada. Se actualizará al guardar.' : 'Imagen cargada correctamente',
                life: 2000
            });
        }
    }

    removeImage() {
        // Si estamos editando una herramienta existente y tiene imagen
        if (this.isEditMode && this.tool.id > 0 && this.tool.foto_url) {
            // Mostrar confirmación antes de eliminar
            this.imageDeleteConfirmMessage = `¿Estás seguro que deseas eliminar la imagen de la herramienta <span class='text-primary'>${this.tool.nombre}</span>? Esta acción no se puede deshacer.`;
            this.imageDeleteConfirmAction = () => {
                this.loading = true;

                this.toolsService.deleteToolImage(this.tool.id).subscribe({
                    next: (success: boolean) => {
                        if (success) {
                            // Limpiar la imagen en el objeto local
                            this.tool.foto_url = '';
                            this.selectedImage = null;
                            this.imagePreview = null;
                            this.hasNewImage = false;
                            this.cdr.detectChanges();

                            this.messageService.add({
                                severity: 'success',
                                summary: 'Éxito',
                                detail: 'Imagen eliminada del servidor correctamente',
                                life: 3000
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'No se pudo eliminar la imagen del servidor',
                                life: 3000
                            });
                        }
                        this.loading = false;
                    },
                    error: (error: any) => {
                        console.error('Error eliminando imagen:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar la imagen del servidor',
                            life: 3000
                        });
                        this.loading = false;
                    }
                });
            };
            this.showImageDeleteConfirm = true;
        } else {
            // Si es una nueva herramienta o no hay imagen, solo limpiar variables locales
            this.selectedImage = null;
            this.imagePreview = null;
            this.hasNewImage = false;
            this.cdr.detectChanges();

            this.messageService.add({
                severity: 'info',
                summary: 'Imagen eliminada',
                detail: 'La imagen ha sido removida',
                life: 2000
            });
        }
    }

    getImagePreview(): string {
        if (this.imagePreview) {
            return this.imagePreview;
        }
        if (this.tool.foto_url) {
            return this.toolsService.getImageUrl(this.tool.foto_url);
        }
        return '';
    }

    getImageUrl(imagePath: string): string {
        return this.toolsService.getImageUrl(imagePath);
    }

    onCustomConfirmAccept() {
        if (this.confirmAction) this.confirmAction();
        this.showCustomConfirm = false;
    }
    onCustomConfirmReject() {
        this.showCustomConfirm = false;
    }

    // Métodos para confirmación de eliminación de imagen
    onImageDeleteConfirmAccept() {
        if (this.imageDeleteConfirmAction) this.imageDeleteConfirmAction();
        this.showImageDeleteConfirm = false;
    }
    onImageDeleteConfirmReject() {
        this.showImageDeleteConfirm = false;
    }

    emptyTool(): Tool {
        return {
            id: 0,
            subcategoria_id: 0,
            nombre: '',
            descripcion: '',
            folio: '',
            foto_url: '',
            stock: 1,
            valor_reposicion: 0,
            is_active: true
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.showImageDeleteConfirm) {
            this.onImageDeleteConfirmReject();
        } else if (this.toolDialog) {
            this.hideDialog();
        }
    }
}
