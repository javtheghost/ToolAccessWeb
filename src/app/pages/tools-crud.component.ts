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
import { RateLimitingService } from './service/rate-limiting.service';

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
                    <p-skeleton height="1.5rem" width="60px" styleClass="bg-white/20"></p-skeleton>
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
                    <p-skeleton height="1rem" width="60px"></p-skeleton>
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
            [globalFilterFields]="['id', 'nombre', 'descripcion', 'folio', 'categoria_nombre', 'subcategoria_nombre']"
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
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar por ID, herramienta, folio..." />
                </p-iconfield>
                <p-button
                    label="Crear Herramienta"
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
                <th pSortableColumn="id" class="text-center p-3" style="min-width: 60px;">
                    <div class="flex justify-content-center align-items-center">
                        ID
                        <p-sortIcon field="id"></p-sortIcon>
                    </div>
                </th>
                <th class="text-center p-3" style="min-width: 80px;">Imagen</th>
                <th pSortableColumn="nombre" class="text-left p-3" style="min-width: 150px;">
                    <div class="flex justify-content-center align-items-center">
                        Nombre
                        <p-sortIcon field="nombre"></p-sortIcon>
                    </div>
                </th>
                <th class="text-left p-3" style="min-width: 200px;">Descripción</th>
                <th pSortableColumn="folio" class="text-center p-3" style="min-width: 120px;">
                    <div class="flex justify-content-center align-items-center">
                        Folio
                        <p-sortIcon field="folio"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="categoria_nombre" class="text-left p-3" style="min-width: 120px;">
                    <div class="flex justify-content-center align-items-center">
                        Categoría
                        <p-sortIcon field="categoria_nombre"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="subcategoria_nombre" class="text-left p-3" style="min-width: 120px;">
                    <div class="flex justify-content-center align-items-center">
                        Subcategoría
                        <p-sortIcon field="subcategoria_nombre"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="stock" class="text-center p-3" style="min-width: 80px;">
                    <div class="flex justify-content-center align-items-center">
                        Stock
                        <p-sortIcon field="stock"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="valor_reposicion" class="text-center p-3" style="min-width: 140px;">
                    <div class="flex justify-content-center align-items-center">
                        Valor Reposición
                        <p-sortIcon field="valor_reposicion"></p-sortIcon>
                    </div>
                </th>
                <th pSortableColumn="is_active" class="text-center p-3" style="min-width: 80px;">
                    <div class="flex justify-content-center align-items-center">
                        Estado
                        <p-sortIcon field="is_active"></p-sortIcon>
                    </div>
                </th>
                <th class="text-center p-3" style="min-width: 120px;">Acción</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tool>
            <tr class="hover:bg-gray-50" [ngClass]="{'opacity-60 bg-gray-100': !tool.is_active}">
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600" [ngClass]="{'text-gray-400': !tool.is_active}">{{ tool.id }}</span>
                </td>
                <td class="text-center p-3">
                    <img *ngIf="tool.foto_url" [src]="getImageUrl(tool.foto_url)" alt="Imagen" style="width: 48px; height: 48px; object-fit: cover;" class="rounded" />
                    <div *ngIf="!tool.foto_url" class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-400">image</span>
                    </div>
                </td>
                <td class="p-3">
                    <div class="font-medium" [ngClass]="{'text-gray-500': !tool.is_active}">{{ tool.nombre }}</div>
                    <span *ngIf="tool.is_active" class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Activa</span>
                    <span *ngIf="!tool.is_active" class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Inactiva</span>
                </td>
                <td class="p-3">
                    <span *ngIf="tool.descripcion && tool.descripcion.trim()" [ngClass]="{'text-gray-500': !tool.is_active}">{{ tool.descripcion }}</span>
                    <span *ngIf="!tool.descripcion || !tool.descripcion.trim()" class="text-gray-400 font-bold">Sin descripción</span>
                </td>
                <td class="text-center p-3">
                    <span class="font-mono text-sm text-gray-600" [ngClass]="{'text-gray-400': !tool.is_active}">{{ tool.folio }}</span>
                </td>
                <td class="p-3" [ngClass]="{'text-gray-500': !tool.is_active}">{{ tool.categoria_nombre || 'N/A' }}</td>
                <td class="p-3" [ngClass]="{'text-gray-500': !tool.is_active}">{{ tool.subcategoria_nombre || 'N/A' }}</td>
                <td class="text-center p-3" [ngClass]="{'text-gray-500': !tool.is_active}">{{ tool.stock }}</td>
                <td class="text-center p-3" [ngClass]="{'text-gray-500': !tool.is_active}">{{ tool.valor_reposicion | currency: 'MXN' }}</td>
                                <td class="text-center p-3">
                    <p-inputswitch
                        [(ngModel)]="tool.is_active"
                        (onChange)="toggleToolStatus(tool)"
                        [disabled]="loading"
                        pTooltip="Cambiar estado de la herramienta"
                        tooltipPosition="top">
                    </p-inputswitch>
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

                        <!-- Botón de desactivar removido - ahora se maneja con el switch -->

                        <!-- Botón de reactivar removido - ahora se maneja con el switch -->
                    </div>
                </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
            <tr>
                <td colspan="11" class="text-center py-8">
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
  [resizable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Herramienta' : 'Nueva Herramienta' }}
    </span>
  </ng-template>
  <ng-template pTemplate="content">
    <!-- Sistema de alertas en modal -->
    <div *ngIf="modalAlert.show" class="mb-4 p-4 rounded-lg border-l-4 flex items-start gap-3"
         [ngClass]="{
           'bg-red-50 border-red-400 text-red-800': modalAlert.type === 'error',
           'bg-yellow-50 border-yellow-400 text-yellow-800': modalAlert.type === 'warning',
           'bg-blue-50 border-blue-400 text-blue-800': modalAlert.type === 'info',
           'bg-green-50 border-green-400 text-green-800': modalAlert.type === 'success'
         }">
      <div class="flex-shrink-0">
        <i class="material-symbols-outlined text-xl"
           [ngClass]="{
             'text-red-500': modalAlert.type === 'error',
             'text-yellow-500': modalAlert.type === 'warning',
             'text-blue-500': modalAlert.type === 'info',
             'text-green-500': modalAlert.type === 'success'
           }">
          {{ modalAlert.type === 'error' ? 'error' :
             modalAlert.type === 'warning' ? 'warning' :
             modalAlert.type === 'info' ? 'info' : 'check_circle' }}
        </i>
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-semibold mb-1">{{ modalAlert.title }}</h4>
        <p class="text-sm">{{ modalAlert.message }}</p>
      </div>
      <button type="button" (click)="hideModalAlert()" class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600">
        <i class="material-symbols-outlined text-lg">close</i>
      </button>
    </div>

    <form [formGroup]="toolForm" (ngSubmit)="saveTool()">
        <div class="grid grid-cols-1 gap-4">
            <div class="relative col-span-1 py-2 mt-2" [ngClass]="{'py-4': isFieldInvalid('nombre'), 'py-2': !isFieldInvalid('nombre')}">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">edit</span>
                <input
                    type="text"
                    id="nombre"
                    formControlName="nombre"
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-all duration-200"
                    placeholder=" "
                    aria-label="Nombre"
                    [ngClass]="{
                        'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('nombre'),
                        'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('nombre')
                    }" />
                <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre <span class="text-red-500">*</span></label>
                <div *ngIf="isFieldInvalid('nombre')" class="text-red-500 text-xs mt-1 ml-10 absolute">{{ getErrorMessage('nombre') }}</div>
            </div>

            <div class="relative col-span-1 py-2" [ngClass]="{'py-4': isFieldInvalid('descripcion'), 'py-2': !isFieldInvalid('descripcion')}">
                <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none z-20">edit_document</span>
                <textarea
                    id="descripcion"
                    formControlName="descripcion"
                    rows="2"
                    class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-all duration-200"
                    placeholder=" "
                    aria-label="Descripción"
                    [ngClass]="{
                        'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('descripcion'),
                        'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('descripcion')
                    }"></textarea>
                <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción... <span class="text-gray-400">(opcional)</span></label>
                <div *ngIf="isFieldInvalid('descripcion')" class="text-red-500 text-xs mt-1 ml-10 absolute">{{ getErrorMessage('descripcion') }}</div>
            </div>

            <div class="relative col-span-1 py-2" [ngClass]="{'py-4': isFieldInvalid('subcategoria_id'), 'py-2': !isFieldInvalid('subcategoria_id')}">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">inventory_2</span>
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
                    [filter]="true"
                    filterPlaceholder="Buscar subcategorías..."
                    [ngClass]="{
                        'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('subcategoria_id'),
                        'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('subcategoria_id')
                    }"
                    (onShow)="onDropdownOpen($event)"
                    (onHide)="onDropdownClose($event)">
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
                    <ng-template pTemplate="emptyfilter">
                        <div class="text-center py-4">
                            <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                            <p class="text-gray-500">No se encontraron subcategorías</p>
                        </div>
                    </ng-template>
                </p-dropdown>
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Subcategoría <span class="text-red-500">*</span></label>
                <div *ngIf="isFieldInvalid('subcategoria_id')" class="text-red-500 text-xs mt-1 ml-10 absolute">{{ getErrorMessage('subcategoria_id') }}</div>
            </div>

            <!-- Mostrar folio solo en modo edición como referencia -->
            <div *ngIf="isEditMode" class="relative col-span-1 py-2">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">confirmation_number</span>
                <input
                    type="text"
                    formControlName="folio"
                    class="peer block w-full h-12 rounded-lg border bg-gray-100 px-10 text-sm text-gray-600 focus:outline-none"
                    placeholder=" "
                    readonly />
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-500 duration-300 bg-white px-1">Folio (Solo lectura) <span class="text-gray-400">(opcional)</span></label>
                <div class="text-xs text-gray-500 mt-1 ml-10">Folio generado automáticamente</div>
            </div>

            <div class="relative col-span-1 py-2" [ngClass]="{'py-4': isFieldInvalid('stock'), 'py-2': !isFieldInvalid('stock')}">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">inventory_2</span>
                <input
                    type="number"
                    id="stock"
                    formControlName="stock"
                    min="0"
                    max="9999"
                    class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-all duration-200"
                    placeholder=" "
                    aria-label="Stock"
                    [ngClass]="{
                        'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('stock'),
                        'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('stock')
                    }" />
                <label for="stock" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Stock <span class="text-red-500">*</span></label>
                <div *ngIf="isFieldInvalid('stock')" class="text-red-500 text-xs mt-1 ml-10 absolute">{{ getErrorMessage('stock') }}</div>
            </div>

            <div class="relative col-span-1 py-2" [ngClass]="{'py-4': isFieldInvalid('valor_reposicion'), 'py-2': !isFieldInvalid('valor_reposicion')}">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">payments</span>
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
                <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Valor Reposición <span class="text-red-500">*</span></label>
                <div *ngIf="isFieldInvalid('valor_reposicion')" class="text-red-500 text-xs mt-1 ml-10 absolute">{{ getErrorMessage('valor_reposicion') }}</div>
            </div>

            <!-- Switch removido del dialog - ahora se maneja desde la tabla -->

            <div class="col-span-1">
                <label class="block mb-2">Selecciona la imagen <span class="text-gray-400">(opcional)</span></label>
                <div class="flex flex-col items-center">
                    <label 
                        class="border-2 border-dashed rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center drag-drop-area"
                        [class.border-gray-400]="!isDragOver"
                        [class.hover:border-[var(--primary-color)]]="!isDragOver"
                        [class.drag-over]="isDragOver"
                        style="width: 150px; height: 150px;"
                        (dragover)="onDragOver($event)"
                        (dragleave)="onDragLeave($event)"
                        (drop)="onDrop($event)">
                        <span class="material-symbols-outlined text-4xl mb-2 transition-colors"
                              [class.text-gray-400]="!isDragOver"
                              [class.text-[var(--primary-color)]]="isDragOver">
                            {{ isDragOver ? 'file_download' : 'cloud_upload' }}
                        </span>
                        <span class="text-sm transition-colors"
                              [class.text-gray-500]="!isDragOver"
                              [class.text-[var(--primary-color)]]="isDragOver">
                            {{ isDragOver ? 'Suelta la imagen aquí' : 'Click o arrastra imagen' }}
                        </span>
                        <span class="text-xs text-gray-400 mt-1">Máx. 5MB</span>
                        <span class="text-xs text-gray-400">JPG, PNG, WEBP</span>
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
                <!-- ✅ INFORMACIÓN ADICIONAL SOBRE IMÁGENES -->
                <div class="mt-2 text-xs text-gray-500 text-center">
                    <p>Formatos permitidos: JPG, JPEG, PNG, WEBP</p>
                    <p>Tamaño máximo: 5MB</p>
                    <p class="text-blue-600">✨ Puedes arrastrar y soltar imágenes</p>
                    <p><span class="text-gray-400">Campo opcional</span></p>
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
        }

        /* Estilos para el switch personalizado con color verde */
        :host ::ng-deep .custom-inputswitch .p-inputswitch-slider {
            background: #e5e7eb !important;
            border-color: #e5e7eb !important;
        }

        :host ::ng-deep .custom-inputswitch.p-inputswitch-checked .p-inputswitch-slider {
            background: #12A883 !important;
            border-color: #12A883 !important;
        }

        :host ::ng-deep .custom-inputswitch .p-inputswitch-slider:before {
            background: #ffffff !important;
        }

        /* Estilos para el modal y manejo de scroll */
        :host ::ng-deep .p-dialog {
            max-height: 90vh !important;
            overflow: hidden !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-header {
            flex-shrink: 0 !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            overflow-y: auto !important;
            max-height: calc(90vh - 120px) !important;
            padding: 1.5rem !important;
        }

        /* Prevenir scroll en el modal cuando el dropdown está abierto */
        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open {
            overflow: hidden !important;
            pointer-events: none !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content.p-dropdown-open .p-dropdown {
            pointer-events: auto !important;
        }

        /* Configurar el panel del dropdown para evitar conflictos de scroll */
        :host ::ng-deep .p-dropdown-panel {
            z-index: 1000 !important;
            max-height: 200px !important;
            overflow-y: auto !important;
        }

        /* Prevenir que el scroll del modal interfiera con el dropdown */
        :host ::ng-deep .p-dropdown-panel .p-dropdown-items-wrapper {
            max-height: 180px !important;
            overflow-y: auto !important;
        }

        /* Asegurar que el dropdown se muestre por encima del modal */
        :host ::ng-deep .p-dropdown-panel.p-component {
            position: fixed !important;
            z-index: 1001 !important;
        }

        /* Mejorar la experiencia de scroll en el dropdown */
        :host ::ng-deep .p-dropdown-panel .p-dropdown-items {
            max-height: 200px !important;
            overflow-y: auto !important;
            scrollbar-width: thin !important;
            scrollbar-color: #cbd5e0 #f7fafc !important;
        }

        /* Estilos para el scrollbar del dropdown en WebKit */
        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar {
            width: 6px !important;
        }

        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar-track {
            background: #f7fafc !important;
            border-radius: 3px !important;
        }

        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar-thumb {
            background: #cbd5e0 !important;
            border-radius: 3px !important;
        }

        :host ::ng-deep .p-dropdown-panel .p-dropdown-items::-webkit-scrollbar-thumb:hover {
            background: #a0aec0 !important;
        }

        /* Estilos para drag and drop de imágenes */
        .drag-over {
            border-color: var(--primary-color) !important;
            background-color: rgba(59, 130, 246, 0.05) !important;
            transform: scale(1.02) !important;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
        }

        .drag-drop-area {
            transition: all 0.2s ease-in-out !important;
        }

        .drag-drop-area:hover {
            border-color: var(--primary-color) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        /* Estados de validación para inputs */
        input.border-red-500,
        textarea.border-red-500 {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 1px #ef4444 !important;
        }

        input.border-red-500:focus,
        textarea.border-red-500:focus {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
        }

        /* Estados de validación para dropdowns */
        :host ::ng-deep .p-dropdown.border-red-500 {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 1px #ef4444 !important;
        }

        :host ::ng-deep .p-dropdown.border-red-500:not(.p-disabled):hover {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 1px #ef4444 !important;
        }

        :host ::ng-deep .p-dropdown.border-red-500:not(.p-disabled).p-focus {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2) !important;
        }

        /* Mensajes de error con posición absoluta para no afectar el layout */
        .relative .text-red-500.absolute {
            position: absolute !important;
            top: calc(100% - 8px) !important;
            left: 0 !important;
            z-index: 10 !important;
            background: white !important;
            padding: 2px 4px !important;
            white-space: nowrap !important;
            border-radius: 4px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            opacity: 0 !important;
            transform: translateY(-5px) !important;
            transition: all 0.3s ease !important;
        }

        /* Mostrar mensajes de error cuando están visibles */
        .relative .text-red-500.absolute:not([style*="display: none"]) {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }

        /* Espaciado dinámico para campos con error */
        .relative.py-4 {
            margin-bottom: 8px !important;
        }

        .relative.py-2 {
            margin-bottom: 4px !important;
        }

        /* Transiciones suaves para cambios de estado */
        .relative {
            transition: padding 0.3s ease, margin-bottom 0.3s ease !important;
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

    // Control de vista de herramientas
    showOnlyActive: boolean = true;

    // Manejo de imágenes
    selectedImage: File | null = null;
    imagePreview: string | null = null;
    hasNewImage: boolean = false; // Para rastrear si se seleccionó una nueva imagen
    isDragOver: boolean = false; // Para el feedback visual del drag and drop

    // Sistema de alertas en modal
    modalAlert: {
        show: boolean;
        type: 'error' | 'warning' | 'info' | 'success';
        message: string;
        title: string;
    } = {
        show: false,
        type: 'error',
        message: '',
        title: ''
    };

    // Variable removida - ya no necesaria

    constructor(
        private messageService: MessageService,
        private toolsService: ToolsService,
        private categoryService: CategoryService,
        private subcategoryService: SubcategoryService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private rateLimitingService: RateLimitingService
    ) {
        this.initForm();
    }

    ngOnInit() {
        this.loadTools();
        this.loadCategories();

        //  LISTENER PARA CAMBIOS EN STOCK
        this.stock?.valueChanges.subscribe(value => {
            if (value !== null && value !== undefined) {
                this.showStockWarning(value);
            }
        });
    }

    initForm() {
        this.toolForm = this.fb.group({
            nombre: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100),
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()&]+$/)
            ]],
            descripcion: ['', [
                Validators.maxLength(1000),
                Validators.pattern(/^[^<>'"`;\\]*$/)
            ]],
            folio: ['', [
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-Z0-9\s\-_]*$/)
            ]],
            subcategoria_id: [null, [Validators.required]],
            stock: [1, [
                Validators.required,
                Validators.min(0),
                Validators.max(9999),
                this.validateInteger.bind(this)
            ]],
            valor_reposicion: [0, [
                Validators.required,
                Validators.min(0),
                Validators.max(999999.99),
                this.validateDecimal.bind(this)
            ]]
        });
    }

    // Validador personalizado para números enteros
    validateInteger(control: any) {
        if (control.value === null || control.value === undefined) {
            return null;
        }

        const value = control.value;
        if (!Number.isInteger(value) || value < 0) {
            return { invalidInteger: true };
        }

        return null;
    }

    // Validador personalizado para decimales
    validateDecimal(control: any) {
        if (control.value === null || control.value === undefined) {
            return null;
        }

        const value = control.value;
        const decimalPlaces = (value.toString().split('.')[1] || '').length;

        if (decimalPlaces > 2) {
            return { maxDecimalPlaces: { max: 2, actual: decimalPlaces } };
        }

        return null;
    }

    // Métodos de sanitización
    onNombreBlur() {
        const control = this.toolForm.get('nombre');
        if (control && control.value) {
            const valorSanitizado = control.value.replace(/\s+/g, ' ').trim();
            control.setValue(valorSanitizado);
            control.updateValueAndValidity();
        }
    }

    onDescripcionBlur() {
        const control = this.toolForm.get('descripcion');
        if (control && control.value) {
            const valorSanitizado = control.value.replace(/\s+/g, ' ').trim();
            control.setValue(valorSanitizado);
            control.updateValueAndValidity();
        }
    }

    onFolioBlur() {
        const control = this.toolForm.get('folio');
        if (control && control.value) {
            const valorSanitizado = control.value.replace(/\s+/g, ' ').trim();
            control.setValue(valorSanitizado);
            control.updateValueAndValidity();
        }
    }

    // Validación en tiempo real
    onNombreInput(event: any) {
        const control = this.toolForm.get('nombre');
        if (control) {
            const value = event.target.value;
            const validValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_.,()&]/g, '');

            if (value !== validValue) {
                control.setValue(validValue);
            }

            control.updateValueAndValidity();
        }
    }

    onFolioInput(event: any) {
        const control = this.toolForm.get('folio');
        if (control) {
            const value = event.target.value;
            const validValue = value.replace(/[^a-zA-Z0-9\s\-_]/g, '');

            if (value !== validValue) {
                control.setValue(validValue);
            }

            control.updateValueAndValidity();
        }
    }

    //  MÉTODO PARA ACTUALIZAR VALIDACIONES SEGÚN MODO
    updateStockValidation() {
        const stockControl = this.toolForm.get('stock');
        if (stockControl) {
            if (this.isEditMode) {
                // ✅ MODO EDICIÓN: Permite stock = 0 (para agotar)
                stockControl.setValidators([
                    Validators.required,
                    Validators.pattern(/^([1-9]\d{0,3}|0)$/),
                    Validators.min(0),
                    Validators.max(9999)
                ]);
            } else {
                //  MODO CREACIÓN: Mínimo stock = 1 (para disponibilidad)
                stockControl.setValidators([
                    Validators.required,
                    Validators.pattern(/^[1-9]\d{0,3}$/), //  SOLO 1-9999
                    Validators.min(1),
                    Validators.max(9999)
                ]);
            }
            stockControl.updateValueAndValidity();
        }
    }

    // Getters para acceder fácilmente a los controles del formulario
    get nombre() { return this.toolForm.get('nombre'); }
    get descripcion() { return this.toolForm.get('descripcion'); }
    get folio() { return this.toolForm.get('folio'); }
    get subcategoria_id() { return this.toolForm.get('subcategoria_id'); }
    get stock() { return this.toolForm.get('stock'); }
    get valor_reposicion() { return this.toolForm.get('valor_reposicion'); }

    // ✅ MÉTODOS DE VALIDACIÓN PERSONALIZADOS MEJORADOS
    getErrorMessage(controlName: string): string {
        const control = this.toolForm.get(controlName);
        if (control?.errors && control.touched) {
            if (control.errors['required']) {
                switch (controlName) {
                    case 'nombre':
                        return 'El nombre es requerido';
                    case 'subcategoria_id':
                        return 'Debes seleccionar una subcategoría';
                    case 'stock':
                        return 'El stock es requerido';
                    case 'valor_reposicion':
                        return 'El valor de reposición es requerido';
                    default:
                        return 'Este campo es requerido';
                }
            }
            if (control.errors['minlength']) {
                switch (controlName) {
                    case 'nombre':
                        return 'El nombre debe tener al menos 3 caracteres';
                    default:
                        return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
                }
            }
            if (control.errors['maxlength']) {
                switch (controlName) {
                    case 'nombre':
                        return 'El nombre no puede exceder 100 caracteres';
                    case 'descripcion':
                        return 'La descripción no puede exceder 200 caracteres';
                    default:
                        return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
                }
            }
            if (control.errors['pattern']) {
                switch (controlName) {
                    case 'nombre':
                        return 'El nombre contiene caracteres no permitidos. Solo letras, números, espacios, guiones y puntos';
                    case 'stock':
                        return this.isEditMode
                            ? 'El stock debe ser un número entre 0 y 9999 (0 = agotado)'
                            : 'El stock debe ser un número entre 1 y 9999 (mínimo 1 para disponibilidad)';
                    case 'descripcion':
                        return 'La descripción contiene caracteres no permitidos';
                    default:
                        return 'Formato no válido';
                }
            }
            if (control.errors['min']) {
                switch (controlName) {
                    case 'stock':
                        return this.isEditMode
                            ? 'El stock debe ser mayor o igual a 0'
                            : 'El stock debe ser mayor o igual a 1 para disponibilidad';
                    case 'valor_reposicion':
                        return 'El valor de reposición debe ser mayor o igual a 0';
                    default:
                        return `Valor mínimo: ${control.errors['min'].min}`;
                }
            }
            if (control.errors['max']) {
                switch (controlName) {
                    case 'stock':
                        return 'El stock no puede exceder 9999';
                    case 'valor_reposicion':
                        return 'El valor de reposición no puede exceder $999,999.99';
                    default:
                        return `Valor máximo: ${control.errors['max'].max}`;
                }
            }
            if (control.errors['invalidInteger']) {
                if (controlName === 'stock') {
                    return 'El stock debe ser un número entero positivo';
                }
                return 'Este campo debe ser un número entero positivo';
            }
            if (control.errors['maxDecimalPlaces']) {
                if (controlName === 'valor_reposicion') {
                    return `El valor debe tener máximo 2 decimales (tiene ${control.errors['maxDecimalPlaces'].actual})`;
                }
                return `Máximo ${control.errors['maxDecimalPlaces'].max} decimales permitidos`;
            }
        }
        return '';
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.toolForm.get(controlName);
        return !!(control?.invalid && (control?.touched || control?.dirty));
    }

    // ✅ MÉTODO DE VALIDACIÓN ADICIONAL PARA COINCIDIR CON LA BD
    validateFormData(data: any): string[] {
        const errors: string[] = [];

        // Validar nombre (REQUERIDO según BD)
        if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length === 0) {
            errors.push('El nombre es requerido');
        } else if (data.nombre.trim().length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        } else if (data.nombre.trim().length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        } else if (!/^[\wáéíóúÁÉÍÓÚñÑ\s\-.,]{3,100}$/.test(data.nombre.trim())) {
            errors.push('El nombre contiene caracteres no permitidos. Solo letras, números, espacios, guiones y puntos');
        }

        // Validar subcategoria_id (REQUERIDO según BD)
        if (!data.subcategoria_id || data.subcategoria_id === null) {
            errors.push('El ID de subcategoría es requerido');
        } else {
            // ✅ CONVERTIR A NÚMERO SI ES NECESARIO
            const subcategoriaId = typeof data.subcategoria_id === 'string' ?
                parseInt(data.subcategoria_id) : Number(data.subcategoria_id);

            if (isNaN(subcategoriaId) || subcategoriaId <= 0) {
                errors.push('El ID de subcategoría debe ser un número positivo');
            }
        }

        // Validar stock (OPCIONAL pero con restricciones según BD)
        if (data.stock !== undefined && data.stock !== null) {
            // ✅ CONVERTIR A NÚMERO SI ES NECESARIO
            const stockValue = typeof data.stock === 'string' ?
                parseInt(data.stock) : Number(data.stock);

            if (isNaN(stockValue)) {
                errors.push('El stock debe ser un número válido');
            } else if (stockValue < 0 || stockValue > 9999) {
                errors.push('El stock debe ser un número entre 0 y 9999');
            } else if (!/^([1-9]\d{0,3}|0)$/.test(stockValue.toString())) {
                errors.push('El stock debe ser un número válido entre 0 y 9999');
            }

            // ✅ VALIDACIÓN ESPECÍFICA SEGÚN MODO (si se proporciona isEditMode)
            if (this.isEditMode === false && stockValue === 0) {
                errors.push('No se puede crear una herramienta con stock = 0. El stock mínimo para nuevas herramientas es 1');
            }
        }

        // Validar valor_reposicion (OPCIONAL pero con restricciones según BD)
        if (data.valor_reposicion !== undefined && data.valor_reposicion !== null) {
            // ✅ CONVERTIR A NÚMERO SI ES NECESARIO
            const valorReposicion = typeof data.valor_reposicion === 'string' ?
                parseFloat(data.valor_reposicion) : Number(data.valor_reposicion);

            if (isNaN(valorReposicion) || valorReposicion < 0 || valorReposicion > 999999.99) {
                errors.push('El valor de reposición debe ser un número entre 0 y 999999.99');
            } else if (!/^\d{1,6}(\.\d{1,2})?$/.test(valorReposicion.toString())) {
                errors.push('El valor de reposición debe tener máximo 6 dígitos enteros y 2 decimales');
            }
        }

        // Validar descripción (OPCIONAL pero con validaciones si se proporciona)
        if (data.descripcion !== undefined && data.descripcion !== null && data.descripcion.trim().length > 0) {
            if (typeof data.descripcion !== 'string') {
                errors.push('La descripción debe ser un texto');
            } else if (data.descripcion.trim().length < 3) {
                errors.push('La descripción debe tener al menos 3 caracteres si se proporciona');
            } else if (data.descripcion.trim().length > 200) {
                errors.push('La descripción no puede exceder 200 caracteres');
            } else if (!/^[\wáéíóúÁÉÍÓÚñÑ\s¡!¿?@#$%&*()\-_=+.,:;'"\n\r\/]{3,200}$/.test(data.descripcion.trim())) {
                errors.push('La descripción contiene caracteres no permitidos');
            }
        }

        return errors;
    }

    // ✅ MÉTODO PARA MANEJAR ERRORES DEL SERVIDOR
    handleServerError(error: any, action: 'crear' | 'actualizar' | 'activar' | 'desactivar'): void {
        console.error(`Error al ${action} herramienta:`, error);

        let errorMessage = `Error al ${action} la herramienta`;

        if (error.error) {
            // Error del servidor con estructura específica
            if (error.error.errors && Array.isArray(error.error.errors)) {
                errorMessage = error.error.errors.join(', ');
            } else if (error.error.message) {
                errorMessage = error.error.message;
            } else if (typeof error.error === 'string') {
                errorMessage = error.error;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
    }

    loadTools() {
        // ✅ VALIDACIÓN: Evitar múltiples cargas simultáneas
        if (this.loading) {
            return;
        }

        // ✅ RATE LIMITING: Verificar límites antes de hacer petición
        const endpoint = 'tools-crud-load';
        if (!this.rateLimitingService.canMakeRequest(endpoint, {
            maxRequests: 10,      // 10 peticiones por minuto para herramientas
            timeWindow: 60000,    // 1 minuto
            cooldownPeriod: 15000 // 15 segundos de cooldown
        })) {
            const timeRemaining = this.rateLimitingService.getTimeRemaining(endpoint);
            const remainingRequests = this.rateLimitingService.getRemainingRequests(endpoint);

            this.messageService.add({
                severity: 'warn',
                summary: 'Límite alcanzado',
                detail: `Espera ${Math.ceil(timeRemaining / 1000)}s antes de hacer otra petición. Peticiones restantes: ${remainingRequests}`,
                life: 3000
            });
            return;
        }

        this.loading = true;

        // Cargar herramientas según el filtro de vista activa
        this.toolsService.getTools(undefined, this.showOnlyActive).subscribe({
            next: (tools) => {
                // ✅ VALIDACIÓN: Verificar que tools es un array válido
                if (!Array.isArray(tools)) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Formato de respuesta inválido del servidor',
                        life: 3000
                    });
                    this.tools = [];
                } else {
                    this.tools = tools;
                }
                this.loading = false;
                // ✅ RATE LIMITING: Registrar petición exitosa
                this.rateLimitingService.recordRequest(endpoint);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.message || 'Error al cargar herramientas',
                    life: 3000
                });
                this.loading = false;
                // ✅ RESETEO EN CASO DE ERROR
                this.tools = [];
            }
        });
    }

    toggleActiveView() {
        // ✅ VALIDACIÓN: Verificar que no esté cargando actualmente
        if (this.loading) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'Espera a que termine la carga actual',
                life: 2000
            });
            return;
        }

        this.showOnlyActive = !this.showOnlyActive;

        // ✅ MOSTRAR INDICADOR DE CARGA
        this.messageService.add({
            severity: 'info',
            summary: 'Cargando',
            detail: this.showOnlyActive ? 'Cargando solo herramientas activas...' : 'Cargando todas las herramientas...',
            life: 1000
        });

        this.loadTools();
    }

    loadCategories() {
        // ✅ VALIDACIÓN: Evitar múltiples cargas simultáneas
        if (this.loadingCategories) {
            return;
        }

        this.loadingCategories = true;
        this.categoryService.getCategories().subscribe({
            next: (categories) => {
                // ✅ VALIDACIÓN: Verificar que categories es un array válido
                if (!Array.isArray(categories)) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Formato de respuesta inválido para categorías',
                        life: 3000
                    });
                    this.categories = [];
                } else {
                    this.categories = categories;
                }
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
                // ✅ RESETEO EN CASO DE ERROR
                this.categories = [];
            }
        });
    }

    loadSubcategories() {
        this.subcategoryService.getAllSubcategories().subscribe({
            next: (subcategories) => {
                // ✅ VALIDACIÓN: Verificar que subcategories es un array válido
                if (!Array.isArray(subcategories)) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Formato de respuesta inválido para subcategorías',
                        life: 3000
                    });
                    this.subcategories = [];
                } else {
                    this.subcategories = subcategories;
                }
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
                // ✅ RESETEO EN CASO DE ERROR
                this.subcategories = [];
            }
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        // ✅ VALIDACIÓN: Verificar que el evento y la tabla son válidos
        if (!table || !event) {
            return;
        }

        const target = event.target as HTMLInputElement;
        if (!target) {
            return;
        }

        // ✅ VALIDACIÓN: Limpiar espacios en blanco y normalizar búsqueda
        const searchValue = target.value.trim();

        // ✅ VALIDACIÓN: Limitar longitud de búsqueda para evitar problemas de rendimiento
        if (searchValue.length > 100) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Advertencia',
                detail: 'El término de búsqueda es demasiado largo',
                life: 2000
            });
            return;
        }

        table.filterGlobal(searchValue, 'contains');
    }

    openNew() {
        // ✅ VALIDACIÓN: Verificar que las subcategorías están cargadas
        if (!this.subcategories || this.subcategories.length === 0) {
            this.messageService.add({
                severity: 'warning',
                summary: 'Advertencia',
                detail: 'Cargando subcategorías...',
                life: 2000
            });

            // Recargar subcategorías si no están disponibles
            this.loadSubcategories();
        }

        this.tool = this.emptyTool();
        this.selectedSubcategory = null;
        this.isEditMode = false;
        this.selectedImage = null;
        this.imagePreview = null;
        this.hasNewImage = false;
        this.isDragOver = false;
        this.hideModalAlert(); // Limpiar alertas del modal

        // ✅ RESETEO COMPLETO DEL FORMULARIO CON VALORES POR DEFECTO
        this.toolForm.reset({
            nombre: '',
            descripcion: '',
            folio: '',
            subcategoria_id: null,
            stock: 1, // ✅ VALOR POR DEFECTO SEGÚN BD
            valor_reposicion: 0
        });

        // ✅ MARCAR CAMPOS COMO UNTOUCHED PARA EVITAR ERRORES PREMATUROS
        Object.keys(this.toolForm.controls).forEach(key => {
            const control = this.toolForm.get(key);
            control?.markAsUntouched();
        });

        // ✅ APLICAR VALIDACIONES CORRECTAS PARA CREACIÓN
        this.updateStockValidation();

        this.toolDialog = true;
    }

    editTool(tool: Tool) {
        // ✅ VALIDACIÓN: Verificar que la herramienta existe y es válida
        if (!tool || !tool.id || tool.id <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Herramienta inválida para editar',
                life: 3000
            });
            return;
        }

        // ✅ VALIDACIÓN: Verificar que la herramienta tiene datos válidos
        if (!tool.nombre || tool.nombre.trim().length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'La herramienta no tiene un nombre válido',
                life: 3000
            });
            return;
        }

        this.tool = { ...tool };

        // Buscar la subcategoría seleccionada
        if (tool.subcategoria_id) {
            this.selectedSubcategory = this.subcategories.find(s => s.id === tool.subcategoria_id) || null;
        }

        // Actualizar el formulario con los datos de la herramienta
        // ✅ CONVERTIR VALORES A NÚMEROS PARA EVITAR PROBLEMAS DE VALIDACIÓN
        this.toolForm.patchValue({
            nombre: tool.nombre,
            descripcion: tool.descripcion,
            folio: tool.folio,
            subcategoria_id: Number(tool.subcategoria_id),
            stock: Number(tool.stock),
            valor_reposicion: Number(tool.valor_reposicion)
        });

        this.selectedImage = null;
        this.imagePreview = null;
        this.hasNewImage = false;
        this.isEditMode = true;
        this.hideModalAlert(); // Limpiar alertas del modal

        // ✅ APLICAR VALIDACIONES CORRECTAS PARA EDICIÓN
        this.updateStockValidation();

        this.toolDialog = true;
    }

    // Método deactivateTool removido - ahora se maneja con toggleToolStatus

    // Método reactivateTool removido - ahora se maneja con toggleToolStatus

        // Método para cambiar el estado de la herramienta directamente
    toggleToolStatus(tool: Tool) {
        // ✅ VALIDACIÓN: Verificar que la herramienta existe
        if (!tool || !tool.id || tool.id <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Herramienta inválida',
                life: 3000
            });
            return;
        }

        const newStatus = tool.is_active;

        if (newStatus) {
            // Activar herramienta
            this.toolsService.reactivateTool(tool.id).subscribe({
                next: (updatedTool) => {
                    const idx = this.tools.findIndex(t => t.id === tool.id);
                    if (idx > -1) this.tools[idx] = updatedTool;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Herramienta activada',
                        life: 3000
                    });
                },
                error: (error) => {
                    // Revertir el switch si hay error
                    tool.is_active = !newStatus;
                    this.handleServerError(error, 'activar');
                }
            });
        } else {
            // Desactivar herramienta (eliminar)
            this.toolsService.deleteTool(tool.id).subscribe({
                next: () => {
                    // Actualizar el estado local
                    tool.is_active = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Herramienta desactivada',
                        life: 3000
                    });
                },
                error: (error) => {
                    // Revertir el switch si hay error
                    tool.is_active = !newStatus;
                    this.handleServerError(error, 'desactivar');
                }
            });
        }
    }

    hideDialog() {
        // ✅ VALIDACIÓN: Verificar si hay cambios sin guardar
        if (this.toolForm.dirty) {
            this.messageService.add({
                severity: 'info',
                summary: 'Información',
                detail: 'Los cambios no guardados se han descartado',
                life: 2000
            });
        }

        this.toolDialog = false;
        this.isEditMode = false;
        this.selectedSubcategory = null;
        this.selectedImage = null;
        this.imagePreview = null;
        this.hasNewImage = false;
        this.isDragOver = false;
        this.showCustomConfirm = false;
        this.hideModalAlert(); // Limpiar alertas del modal

        // ✅ RESETEO COMPLETO DEL FORMULARIO
        this.toolForm.reset({
            nombre: '',
            descripcion: '',
            folio: '',
            subcategoria_id: null,
            stock: 1, // ✅ VALOR POR DEFECTO SEGÚN BD
            valor_reposicion: 0
        });

        // ✅ MARCAR CAMPOS COMO UNTOUCHED
        Object.keys(this.toolForm.controls).forEach(key => {
            const control = this.toolForm.get(key);
            control?.markAsUntouched();
        });

        // ✅ APLICAR VALIDACIONES CORRECTAS PARA CREACIÓN
        this.updateStockValidation();
    }

    // ✅ MÉTODOS PARA MANEJAR ALERTAS EN MODAL
    showModalAlert(type: 'error' | 'warning' | 'info' | 'success', title: string, message: string) {
        this.modalAlert = {
            show: true,
            type,
            title,
            message
        };
    }

    hideModalAlert() {
        this.modalAlert.show = false;
    }

    saveTool() {
        // Marcar todos los campos como touched y dirty para mostrar errores
        Object.keys(this.toolForm.controls).forEach(key => {
            const control = this.toolForm.get(key);
            control?.markAsTouched();
            control?.markAsDirty();
        });

        if (this.toolForm.valid) {
            const formValue = this.toolForm.value;

            // ✅ SANITIZAR DATOS ANTES DE ENVIAR
            const nombreSanitizado = formValue.nombre ? formValue.nombre.replace(/\s+/g, ' ').trim() : '';
            const descripcionSanitizada = formValue.descripcion ? formValue.descripcion.replace(/\s+/g, ' ').trim() : '';
            const folioSanitizado = formValue.folio ? formValue.folio.replace(/\s+/g, ' ').trim() : '';

            // ✅ VALIDAR QUE EL NOMBRE NO ESTÉ VACÍO DESPUÉS DE SANITIZAR
            if (!nombreSanitizado) {
                this.showModalAlert('error', 'Error de Validación', 'El nombre no puede estar vacío');
                return;
            }

            // ✅ VALIDACIONES ADICIONALES ANTES DE ENVIAR
            const validationErrors = this.validateFormData(formValue);
            if (validationErrors.length > 0) {
                this.showModalAlert('error', 'Error de Validación', validationErrors.join(', '));
                return;
            }

            // ✅ VALIDACIÓN ESPECÍFICA DE SUBCATEGORÍA
            if (!formValue.subcategoria_id || formValue.subcategoria_id <= 0) {
                this.showModalAlert('error', 'Error de Validación', 'Debes seleccionar una subcategoría válida');
                return;
            }

            // ✅ VALIDACIÓN DE TIPOS DE DATOS
            const subcategoriaId = Number(formValue.subcategoria_id);
            const stockValue = Number(formValue.stock);
            const valorReposicionValue = Number(formValue.valor_reposicion);

            if (isNaN(subcategoriaId) || subcategoriaId <= 0) {
                this.showModalAlert('error', 'Error de Validación', 'El ID de subcategoría debe ser un número válido');
                return;
            }

            // ✅ VALIDACIÓN DE STOCK SEGÚN MODO
            if (isNaN(stockValue)) {
                this.showModalAlert('error', 'Error de Validación', 'El stock debe ser un número válido');
                return;
            }

            if (this.isEditMode) {
                // ✅ MODO EDICIÓN: Permite stock = 0 (para agotar)
                if (stockValue < 0 || stockValue > 9999) {
                    this.showModalAlert('error', 'Error de Stock', 'El stock debe ser un número entre 0 y 9999 (0 = agotado)');
                    return;
                }
            } else {
                // ✅ MODO CREACIÓN: Mínimo stock = 1 (para disponibilidad)
                if (stockValue < 1 || stockValue > 9999) {
                    this.showModalAlert('error', 'Stock Inválido', 'No se puede crear una herramienta con stock = 0. El stock mínimo para nuevas herramientas es 1 para garantizar disponibilidad.');
                    return;
                }
            }

            if (isNaN(valorReposicionValue) || valorReposicionValue < 0 || valorReposicionValue > 999999.99) {
                this.showModalAlert('error', 'Error de Validación', 'El valor de reposición debe ser un número entre 0 y 999,999.99');
                return;
            }

            // ✅ VALIDACIÓN DE DESCRIPCIÓN (si se proporciona)
            if (formValue.descripcion && formValue.descripcion.trim().length > 0) {
                if (formValue.descripcion.trim().length < 3) {
                    this.showModalAlert('error', 'Error de Validación', 'La descripción debe tener al menos 3 caracteres si se proporciona');
                    return;
                }
                if (formValue.descripcion.trim().length > 200) {
                    this.showModalAlert('error', 'Error de Validación', 'La descripción no puede exceder 200 caracteres');
                    return;
                }
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
                        nombre: nombreSanitizado,
                        subcategoria_id: subcategoriaId,
                        folio: folioSanitizado,
                        stock: stockValue,
                        valor_reposicion: valorReposicionValue,
                        descripcion: formValue.descripcion?.trim() || '',
                        imagen: this.hasNewImage && this.selectedImage ? this.selectedImage : undefined,
                        is_active: true // Siempre crear como activa, el estado se maneja desde la tabla
                    };

                                            this.toolsService.updateTool(this.tool.id, updateData).subscribe({
                            next: (updatedTool) => {
                                // ✅ ENRIQUECER LA HERRAMIENTA CON DATOS DE CATEGORÍA Y SUBCATEGORÍA
                                const enrichedTool = this.enrichToolWithCategoryData(updatedTool);
                                const idx = this.tools.findIndex(t => t.id === this.tool.id);
                                if (idx > -1) this.tools[idx] = enrichedTool;
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Éxito',
                                    detail: 'Herramienta actualizada exitosamente',
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
                                // ✅ MANEJO MEJORADO DE ERRORES DEL SERVIDOR
                                this.handleServerError(error, 'actualizar');
                            }
                        });
                };
                this.showCustomConfirm = true;
            } else {
                // Crear nueva herramienta
                const createData: ToolCreateRequest = {
                    nombre: formValue.nombre.trim(),
                    subcategoria_id: subcategoriaId,
                    folio: formValue.folio,
                    stock: stockValue,
                    valor_reposicion: valorReposicionValue,
                    descripcion: formValue.descripcion?.trim() || '',
                    imagen: this.selectedImage || undefined,
                    is_active: true // Siempre crear como activa, el estado se maneja desde la tabla
                };

                this.toolsService.createTool(createData).subscribe({
                    next: (newTool) => {
                        // ✅ ENRIQUECER LA HERRAMIENTA CON DATOS DE CATEGORÍA Y SUBCATEGORÍA
                        const enrichedTool = this.enrichToolWithCategoryData(newTool);
                        this.tools.push(enrichedTool);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Herramienta creada exitosamente',
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
                        // ✅ MANEJO MEJORADO DE ERRORES DEL SERVIDOR
                        this.handleServerError(error, 'crear');
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

    // ✅ MÉTODO DE VALIDACIÓN DE IMÁGENES MEJORADO
    validateImageFile(file: File): { isValid: boolean; error?: string } {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            return { isValid: false, error: 'Solo se permiten archivos de imagen' };
        }

        // Validar extensión del archivo
        const fileName = file.name.toLowerCase();
        const validExtensions = /\.(jpg|jpeg|png|webp)$/;
        if (!validExtensions.test(fileName)) {
            return { isValid: false, error: 'Solo se permiten archivos JPG, JPEG, PNG y WEBP' };
        }

        // Validar tamaño (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { isValid: false, error: 'La imagen no puede exceder 5MB' };
        }

        // Validar nombre del archivo (máximo 255 caracteres según BD)
        if (fileName.length > 255) {
            return { isValid: false, error: 'El nombre del archivo es demasiado largo' };
        }

        // Validar caracteres especiales en el nombre del archivo
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(fileName)) {
            return { isValid: false, error: 'El nombre del archivo contiene caracteres no permitidos' };
        }

        // Validación básica sin verificar dimensiones (para evitar problemas de async)
        return { isValid: true };
    }

    onImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // ✅ VALIDACIONES MEJORADAS PARA IMÁGENES
            const validationResult = this.validateImageFile(file);
            if (!validationResult.isValid) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de imagen',
                    detail: validationResult.error,
                    life: 5000
                });
                // Limpiar el input
                input.value = '';
                return;
            }

            this.selectedImage = file;
            this.hasNewImage = true;

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
        // ✅ VALIDACIÓN: Verificar que la acción existe
        if (!this.confirmAction) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Acción de confirmación no válida',
                life: 3000
            });
            return;
        }

        if (this.confirmAction) this.confirmAction();
        this.showCustomConfirm = false;
    }

    onCustomConfirmReject() {
        this.showCustomConfirm = false;
    }

    // Métodos para confirmación de eliminación de imagen
    onImageDeleteConfirmAccept() {
        // ✅ VALIDACIÓN: Verificar que la acción existe
        if (!this.imageDeleteConfirmAction) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Acción de eliminación de imagen no válida',
                life: 3000
            });
            return;
        }

        if (this.imageDeleteConfirmAction) this.imageDeleteConfirmAction();
        this.showImageDeleteConfirm = false;
    }

    onImageDeleteConfirmReject() {
        this.showImageDeleteConfirm = false;
    }

    // Métodos para drag and drop de imágenes
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            this.processDroppedFile(file);
        }
    }

    private processDroppedFile(file: File) {
        // ✅ VALIDACIONES MEJORADAS PARA IMÁGENES
        const validationResult = this.validateImageFile(file);
        if (!validationResult.isValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error de imagen',
                detail: validationResult.error,
                life: 5000
            });
            return;
        }

        this.selectedImage = file;
        this.hasNewImage = true;

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

    // ✅ MÉTODO PARA MOSTRAR ADVERTENCIAS DE STOCK
    showStockWarning(stockValue: number): void {
        if (!this.isEditMode && stockValue === 0) {
            this.showModalAlert('warning', 'Advertencia de Stock', 'No se puede crear una herramienta con stock = 0. El stock mínimo para nuevas herramientas es 1 para garantizar disponibilidad.');
        } else if (this.isEditMode && stockValue === 0) {
            this.showModalAlert('info', 'Información de Stock', 'Stock = 0 significa que la herramienta está agotada. Los usuarios no podrán solicitarla hasta que se reponga el stock.');
        }
    }

    emptyTool(): Tool {
        return {
            id: 0,
            subcategoria_id: 0,
            nombre: '',
            descripcion: '',
            folio: '',
            foto_url: '',
            stock: 1, // ✅ VALOR POR DEFECTO SEGÚN BD
            valor_reposicion: 0.00, // ✅ VALOR POR DEFECTO SEGÚN BD
            is_active: true // ✅ VALOR POR DEFECTO SEGÚN BD
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        // ✅ VALIDACIÓN: Verificar que no esté cargando
        if (this.loading || this.loadingCategories) {
            return;
        }

        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.showImageDeleteConfirm) {
            this.onImageDeleteConfirmReject();
        } else if (this.toolDialog) {
            this.hideDialog();
        }
    }

    // ✅ MÉTODO PARA ENRIQUECER HERRAMIENTA CON DATOS DE CATEGORÍA Y SUBCATEGORÍA
    private enrichToolWithCategoryData(tool: Tool): Tool {
        // Buscar la subcategoría correspondiente
        const subcategory = this.subcategories.find(s => s.id === tool.subcategoria_id);

        if (subcategory) {
            // Enriquecer la herramienta con los nombres de categoría y subcategoría
            return {
                ...tool,
                subcategoria_nombre: subcategory.nombre,
                categoria_nombre: subcategory.categoria_nombre
            };
        }

        // Si no se encuentra la subcategoría, devolver la herramienta sin cambios
        return tool;
    }

    // Método para manejar el scroll cuando se abre un dropdown
    onDropdownOpen(event: any) {
        // Prevenir el scroll del modal cuando el dropdown está abierto
        const modalContent = document.querySelector('.p-dialog .p-dialog-content');
        if (modalContent) {
            modalContent.classList.add('p-dropdown-open');
        }
    }

    // Método para restaurar el scroll cuando se cierra un dropdown
    onDropdownClose(event: any) {
        // Restaurar el scroll del modal cuando el dropdown se cierra
        const modalContent = document.querySelector('.p-dialog .p-dialog-content');
        if (modalContent) {
            modalContent.classList.remove('p-dropdown-open');
        }
    }
}
