import { Component, OnInit, signal, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
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
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { SubcategoryService, Subcategory, SubcategoryDisplay, SubcategoryCreateRequest, SubcategoryUpdateRequest } from '../service/subcategory.service';
import { CategoryService } from '../service/category.service';
import { Category } from '../interfaces';
import { forkJoin } from 'rxjs';
import { ModalAlertService, ModalAlert } from '../utils/modal-alert.service';
import { ModalAlertComponent } from '../utils/modal-alert.component';

@Component({
    selector: 'app-subcategorias-crud',
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
        ConfirmDialogModule,
        IconFieldModule,
        InputIconModule,
        DropdownModule,
        SkeletonModule,
        ProgressSpinnerModule,
        TooltipModule,
        ModalAlertComponent
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
            [globalFilterFields]="['id', 'nombre', 'descripcion', 'categoria_nombre', 'is_active']"
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
                        [disabled]="loading() || getActiveCategoriesCount() === 0"
                        styleClass="w-full sm:w-auto"
                        [pTooltip]="getCreateSubcategoryTooltip()"
                        tooltipPosition="top">
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
                    <th pSortableColumn="categoria_nombre" class="hidden sm:table-cell text-left p-3">
                        <div class="flex justify-content-center align-items-center">
                            Categoría
                            <p-sortIcon field="categoria_nombre"></p-sortIcon>
                        </div>
                    </th>
                    <th pSortableColumn="is_active" class="hidden sm:table-cell text-center p-3">
                        <div class="flex justify-content-center align-items-center">
                            Estado
                            <p-sortIcon field="is_active"></p-sortIcon>
                        </div>
                    </th>
                    <th class="text-center p-3">Acción</th>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-subcategory>
                <tr class="hover:bg-gray-50" [ngClass]="{'opacity-60 bg-gray-100': !subcategory.is_active}">
                    <td class="text-center p-3">
                        <span class="font-mono text-sm text-gray-600">{{ subcategory.id }}</span>
                    </td>
                    <td class="p-3">
                        <div class="font-medium" [ngClass]="{'text-gray-500': !subcategory.is_active}">{{ subcategory.nombre }}</div>
                        <span *ngIf="subcategory.is_active" class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Activa</span>
                        <span *ngIf="!subcategory.is_active" class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Inactiva</span>
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
                        <p-inputswitch
                            [(ngModel)]="subcategory.is_active"
                            (onChange)="toggleSubcategoryStatus(subcategory)"
                            [disabled]="loading()"
                            pTooltip="Cambiar estado de la subcategoría"
                            tooltipPosition="top">
                        </p-inputswitch>
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

                            <!-- Botón de eliminar removido - ahora se maneja con el switch -->

                            <!-- Botón de reactivar removido - ahora se maneja con el switch -->
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
                                <p class="text-gray-500" *ngIf="categories().length > 0">
                                    Aún no se han creado subcategorías. Utiliza el botón "Crear Subcategoría" para agregar la primera.
                                </p>
                                <p class="text-gray-500" *ngIf="categories().length === 0">
                                    No hay categorías disponibles. Primero debes crear al menos una categoría antes de poder crear subcategorías.
                                </p>
                            </div>
                        </div>
                    </td>
                </tr>
            </ng-template>
        </p-table>
        <div class="flex justify-center mt-6"></div>
    </div>
</div>

<p-dialog [(visible)]="subcategoryDialog" [style]="{ width: '95vw', maxWidth: '600px' }" [header]="isEditMode ? 'Editar Subcategoría' : 'Nueva Subcategoría'" [modal]="true" [draggable]="false" [resizable]="false">
    <ng-template pTemplate="content">
        <!-- Alerta Modal -->
        <app-modal-alert
            [alert]="modalAlert"
            (close)="hideModalAlert()">
        </app-modal-alert>

        <form [formGroup]="subcategoryForm" (ngSubmit)="saveSubcategory()">
            <div class="grid grid-cols-1 gap-4">
                <!-- Nombre -->
                <div class="relative py-2 mt-2" [ngClass]="{'py-4': isFieldInvalid('nombre'), 'py-2': !isFieldInvalid('nombre')}">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">edit</span>
                    <input
                        type="text"
                        id="nombre"
                        formControlName="nombre"
                        class="peer block w-full h-12 rounded-lg border bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] transition-all duration-200"
                        placeholder=" "
                        aria-label="Nombre"
                        [ngClass]="{
                            'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('nombre'),
                            'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('nombre')
                        }"
                        (input)="onNombreInput($event)"
                        (blur)="onNombreBlur()" />
                    <label for="nombre" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre <span class="text-red-500">*</span></label>
                    <div *ngIf="isFieldInvalid('nombre')" class="text-red-500 text-xs mt-1 ml-10 absolute top-full left-0">{{ getErrorMessage('nombre') }}</div>
                </div>

                <!-- Categoría -->
                <div class="relative py-2" [ngClass]="{'py-4': isFieldInvalid('categoria_id'), 'py-2': !isFieldInvalid('categoria_id')}">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--primary-color)] pointer-events-none z-20">inventory_2</span>
                    <p-dropdown
                        [options]="categories()"
                        formControlName="categoria_id"
                        optionLabel="nombre"
                        optionValue="id"
                        placeholder="Seleccionar categoría"
                        [style]="{ width: '100%' }"
                        class="w-full"
                        [styleClass]="'h-12 px-10'"
                        [showClear]="true"
                        [filter]="true"
                        filterPlaceholder="Buscar categorías..."
                        (onChange)="onCategoryChange($event)"
                        [ngClass]="{
                            'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('categoria_id'),
                            'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('categoria_id')
                        }"
                        (onShow)="onDropdownOpen($event)"
                        (onHide)="onDropdownClose($event)">
                        <ng-template pTemplate="selectedItem" let-category>
                            <div class="flex items-center justify-start h-full w-full">
                                <span>{{ category.nombre }}</span>
                            </div>
                        </ng-template>
                        <ng-template pTemplate="item" let-category>
                            <div class="flex items-center justify-start h-full w-full">
                                <div class="flex flex-col">
                                    <span class="font-medium">{{ category.nombre }}</span>
                                    <span class="text-sm text-gray-500">{{ category.descripcion || 'Sin descripción' }}</span>
                                </div>
                            </div>
                        </ng-template>
                        <ng-template pTemplate="emptyfilter">
                            <div class="text-center py-4">
                                <i class="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</i>
                                <p class="text-gray-500">No se encontraron categorías</p>
                            </div>
                        </ng-template>
                    </p-dropdown>
                    <label class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Categoría <span class="text-red-500">*</span></label>
                    <div *ngIf="isFieldInvalid('categoria_id')" class="text-red-500 text-xs mt-1 ml-10 absolute top-full left-0">{{ getErrorMessage('categoria_id') }}</div>
                </div>

                <!-- Descripción -->
                <div class="relative py-2" [ngClass]="{'py-4': isFieldInvalid('descripcion'), 'py-2': !isFieldInvalid('descripcion')}">
                    <span class="material-symbols-outlined absolute left-3 top-6 text-[var(--primary-color)] pointer-events-none z-20">edit_document</span>
                    <textarea
                        id="descripcion"
                        formControlName="descripcion"
                        rows="3"
                        maxlength="1000"
                        class="peer block w-full rounded-lg border bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                        placeholder=" "
                        aria-label="Descripción"
                        [ngClass]="{
                            'border-red-500 focus:ring-red-500 focus:border-red-500': isFieldInvalid('descripcion'),
                            'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]': !isFieldInvalid('descripcion')
                        }"
                        (blur)="onDescripcionBlur()">
                    </textarea>
                    <label for="descripcion" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-3 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción (Opcional)</label>
                    <div *ngIf="isFieldInvalid('descripcion')" class="text-red-500 text-xs mt-1 ml-10 absolute top-full left-0">{{ getErrorMessage('descripcion') }}</div>
                </div>
            </div>
            <div class="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <button pButton type="button" class="custom-cancel-btn w-full sm:w-24" (click)="hideDialog()" [disabled]="saving()">Cancelar</button>
                <button pButton type="submit" class="p-button w-full sm:w-24" [disabled]="subcategoryForm.invalid || saving()">
                    <span *ngIf="saving()">Guardando...</span>
                    <span *ngIf="!saving()">Guardar</span>
                </button>
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


        /* Estilos para dropdown de categoría */
        :host ::ng-deep .p-dropdown {
            border: 1px solid #d1d5db !important;
            border-radius: 0.5rem !important;
            background-color: transparent !important;
            transition: all 0.3s ease !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-label {
            padding: 0.75rem 2.5rem 0.75rem 2.5rem !important;
            font-size: 0.875rem !important;
            color: #111827 !important;
            background-color: transparent !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled):hover {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
        }

        :host ::ng-deep .p-dropdown:not(.p-disabled).p-focus {
            border-color: var(--primary-color) !important;
            box-shadow: 0 0 0 1px var(--primary-color) !important;
            outline: none !important;
        }

        :host ::ng-deep .p-dropdown .p-dropdown-trigger {
            color: var(--primary-color) !important;
            width: 2.5rem !important;
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

        /* Estilos para mantener los iconos fijos y los mensajes de error sin afectar el layout */
        .relative {
            position: relative !important;
        }

        .relative .material-symbols-outlined {
            position: absolute !important;
            z-index: 20 !important;
            pointer-events: none !important;
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

        /* Estado activo de los mensajes de error */
        .relative .text-red-500.absolute:not(:empty) {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }

        /* Asegurar que los inputs mantengan su altura fija */
        input, textarea {
            min-height: 48px !important;
        }

        /* Asegurar que los dropdowns mantengan su altura fija */
        :host ::ng-deep .p-dropdown {
            min-height: 48px !important;
        }

        /* Asegurar que los mensajes de error tengan suficiente espacio */
        .relative {
            margin-bottom: 4px !important;
            transition: all 0.3s ease !important;
        }

        /* Mejorar la visibilidad de los mensajes de error */
        .text-red-500.text-xs {
            font-size: 0.75rem !important;
            line-height: 1rem !important;
            margin-top: 4px !important;
            color: #ef4444 !important;
            font-weight: 500 !important;
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
        }

        /* Estilos del switch removidos - usar estilos por defecto de PrimeNG */

        /* Estilos para el modal y manejo de scroll */
        :host ::ng-deep .p-dialog {
            max-height: 95vh !important;
            overflow: hidden !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-header {
            flex-shrink: 0 !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            overflow-y: auto !important;
            max-height: calc(95vh - 120px) !important;
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

`
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
    selectedCategory: number | null = null;
    selectedSubcategories: SubcategoryDisplay[] | null = null;
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

    // Control de vista de subcategorías
    showOnlyActive: boolean = true;

    // Formulario reactivo
    subcategoryForm!: FormGroup;
    modalAlert: ModalAlert = { show: false, type: 'error', title: '', message: '' };

    constructor(
        private messageService: MessageService,
        private subcategoryService: SubcategoryService,
        private categoryService: CategoryService,
        private cdr: ChangeDetectorRef,
        private fb: FormBuilder,
        private modalAlertService: ModalAlertService
    ) {
        this.initForm();
    }

        ngOnInit() {
        this.loadData();
    }

    // Inicializar formulario reactivo con validaciones
    private initForm() {
        this.subcategoryForm = this.fb.group({
            nombre: ['', [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_]+$/)
            ]],
            descripcion: ['', [
                Validators.maxLength(1000)
            ]],
            categoria_id: [null, [
                Validators.required
            ]],
            is_active: [true]
        });
    }

    // Getters para validación
    get nombre() { return this.subcategoryForm.get('nombre'); }
    get descripcion() { return this.subcategoryForm.get('descripcion'); }
    get categoria_id() { return this.subcategoryForm.get('categoria_id'); }

    // Mensajes de error
    getErrorMessage(controlName: string): string {
        const control = this.subcategoryForm.get(controlName);
        if (control?.errors) {
            if (control.errors['required']) {
                if (controlName === 'nombre') return 'El nombre es obligatorio';
                if (controlName === 'categoria_id') return 'La categoría es obligatoria';
                return 'Este campo es obligatorio';
            }
            if (control.errors['minlength']) {
                if (controlName === 'nombre') return 'Mínimo 2 caracteres';
                return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
            }
            if (control.errors['maxlength']) {
                if (controlName === 'nombre') return 'Máximo 50 caracteres';
                if (controlName === 'descripcion') return 'Máximo 1000 caracteres';
                return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
            }
            if (control.errors['pattern']) {
                if (controlName === 'nombre') {
                    return 'El nombre solo puede contener letras, espacios, guiones y guiones bajos';
                }
                return 'Formato inválido';
            }
        }
        return '';
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.subcategoryForm.get(controlName);
        return !!(control?.invalid && (control?.touched || control?.dirty));
    }

    // Sanitización automática
    onNombreBlur() {
        const control = this.subcategoryForm.get('nombre');
        if (control && control.value) {
            const valorSanitizado = control.value.replace(/\s+/g, ' ').trim();
            control.setValue(valorSanitizado);
            control.updateValueAndValidity();
        }
    }

    onDescripcionBlur() {
        const control = this.subcategoryForm.get('descripcion');
        if (control && control.value) {
            const valorSanitizado = control.value.replace(/\s+/g, ' ').trim();
            control.setValue(valorSanitizado);
            control.updateValueAndValidity();
        }
    }

    // Validación en tiempo real
    onNombreInput(event: any) {
        const control = this.subcategoryForm.get('nombre');
        if (control) {
            const value = event.target.value;
            const validValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-_]/g, '');

            if (value !== validValue) {
                control.setValue(validValue);
            }

            control.updateValueAndValidity();
        }
    }

    // Marcar todos los campos como touched para mostrar errores
    markFormGroupTouched() {
        Object.keys(this.subcategoryForm.controls).forEach(key => {
            const control = this.subcategoryForm.get(key);
            control?.markAsTouched();
            control?.markAsDirty();
        });
    }

    showModalAlert(type: 'error' | 'warning' | 'info' | 'success', title: string, message: string) {
        switch (type) {
            case 'error':
                this.modalAlert = this.modalAlertService.createErrorAlert(title, message);
                break;
            case 'warning':
                this.modalAlert = this.modalAlertService.createWarningAlert(title, message);
                break;
            case 'info':
                this.modalAlert = this.modalAlertService.createInfoAlert(title, message);
                break;
            case 'success':
                this.modalAlert = this.modalAlertService.createSuccessAlert(title, message);
                break;
        }
    }

    hideModalAlert() {
        this.modalAlert = this.modalAlertService.hideAlert();
    }

    loadData() {
            this.loading.set(true);

            // Cargar tanto subcategorías como categorías de manera sincronizada
            forkJoin({
                subcategories: this.subcategoryService.getAllSubcategories(),
                categories: this.categoryService.getCategories()
            }).subscribe({
                next: (data) => {
                    // Filtrar subcategorías según showOnlyActive
                    const filteredSubcategories = this.showOnlyActive
                        ? data.subcategories.filter(sub => sub.is_active)
                        : data.subcategories;

                    this.subcategories.set(filteredSubcategories);
                    this.categories.set(data.categories);

                    this.loading.set(false);

                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error en loadData():', error);
                    // En caso de error, establecer arrays vacíos y continuar
                    this.subcategories.set([]);
                    this.categories.set([]);
                    this.loading.set(false);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cargar los datos. Por favor, intenta de nuevo.',
                        life: 5000
                    });
                }
            });
        }

        toggleActiveView() {
            this.showOnlyActive = !this.showOnlyActive;
            this.loadData();
            this.messageService.add({
                severity: 'info',
                summary: 'Vista cambiada',
                detail: this.showOnlyActive ? 'Mostrando solo subcategorías activas' : 'Mostrando todas las subcategorías',
                life: 2000
            });
        }

        // Método para cambiar el estado de la subcategoría directamente
        toggleSubcategoryStatus(subcategory: SubcategoryDisplay) {
            const newStatus = subcategory.is_active;

            if (newStatus) {
                // Activar subcategoría
                this.subcategoryService.reactivateSubcategory(subcategory.id).subscribe({
                    next: (updatedSubcategory) => {
                        const idx = this.subcategories().findIndex(s => s.id === subcategory.id);
                        if (idx > -1) {
                            this.subcategories.update(subs => {
                                const updatedSubs = [...subs];
                                updatedSubs[idx] = updatedSubcategory;
                                return updatedSubs;
                            });
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Subcategoría activada',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        // Revertir el switch si hay error
                        subcategory.is_active = !newStatus;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al activar subcategoría',
                            life: 3000
                        });
                    }
                });
            } else {
                // Desactivar subcategoría (eliminar)
                this.subcategoryService.deleteSubcategory(subcategory.id).subscribe({
                    next: () => {
                        // Actualizar el estado local
                        subcategory.is_active = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Subcategoría desactivada',
                            life: 3000
                        });
                    },
                    error: (error) => {
                        // Revertir el switch si hay error
                        subcategory.is_active = !newStatus;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al desactivar subcategoría',
                            life: 3000
                        });
                    }
                });
            }
        }

        getCreateSubcategoryTooltip(): string {
            const activeCategories = this.categories().filter(cat => cat.is_active);
            const totalCategories = this.categories().length;

            if (totalCategories === 0) {
                return 'Primero debes crear al menos una categoría para poder crear una subcategoría.';
            } else if (activeCategories.length === 0) {
                return 'Tienes categorías pero están inactivas. Reactiva una categoría para poder crear subcategorías.';
            } else {
                return 'Crear nueva subcategoría';
            }
        }

        getActiveCategoriesCount(): number {
            return this.categories().filter(cat => cat.is_active).length;
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
            descripcion: '',
            is_active: true // Siempre activa por defecto para nuevas subcategorías
        };
        this.selectedCategory = null;
        this.isEditMode = false;
        this.subcategoryForm.reset({
            nombre: '',
            descripcion: '',
            categoria_id: null,
            is_active: true
        });
        this.subcategoryDialog = true;
        this.hideModalAlert(); // Restablecer alertas al abrir modal
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
            is_active: subcategory.is_active // Mantener el estado actual, no modificable desde modal
        };
        this.selectedCategory = subcategory.categoria_id;
        this.isEditMode = true;
        this.subcategoryForm.patchValue({
            nombre: subcategory.nombre,
            descripcion: subcategory.descripcion || '',
            categoria_id: subcategory.categoria_id,
            is_active: subcategory.is_active
        });
        this.subcategoryDialog = true;
        this.hideModalAlert(); // Restablecer alertas al abrir modal
    }

    onCategoryChange(event: any) {
        if (event.value) {
            this.subcategory.categoria_id = parseInt(event.value);
            this.subcategoryForm.patchValue({ categoria_id: parseInt(event.value) });
        } else {
            this.subcategory.categoria_id = 0;
            this.subcategoryForm.patchValue({ categoria_id: null });
        }
    }

    deleteSubcategory(subcategory: SubcategoryDisplay) {
        // Validar que la subcategoría esté activa antes de intentar eliminarla
        if (!subcategory.is_active) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'No puedes eliminar una subcategoría que ya está inactiva. Usa el botón de reactivar si deseas volver a activarla.',
                life: 5000
            });
            return;
        }

        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar la subcategoría <span class='text-primary'>${subcategory.nombre}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.deleting.set(true);
            this.subcategoryService.deleteSubcategory(subcategory.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Subcategoría eliminada exitosamente',
                        life: 3000
                    });
                    this.loadData();
                    this.deleting.set(false);
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al eliminar la subcategoría',
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
            descripcion: '',
            is_active: true
        };
        this.selectedCategory = null;
        this.subcategoryForm.reset();
        this.hideModalAlert(); // Restablecer alertas al cerrar modal
    }

    saveSubcategory() {
        // Validar formulario reactivo
        if (this.subcategoryForm.invalid) {
            this.markFormGroupTouched();
            return;
        }

        this.saving.set(true);
        const formValue = this.subcategoryForm.value;

        // Sanitizar datos antes de enviar
        const nombreSanitizado = formValue.nombre ? formValue.nombre.replace(/\s+/g, ' ').trim() : '';
        const descripcionSanitizada = formValue.descripcion ? formValue.descripcion.replace(/\s+/g, ' ').trim() : '';

        // Validar que el nombre no esté vacío después de sanitizar
        if (!nombreSanitizado) {
            this.showModalAlert('error', 'Error de validación', 'El nombre no puede estar vacío');
            this.saving.set(false);
            return;
        }

        if (this.subcategory.id) {
            // Actualizar
            const updateData = {
                nombre: nombreSanitizado,
                descripcion: descripcionSanitizada,
                categoria_id: formValue.categoria_id,
                is_active: formValue.is_active
            };

            this.subcategoryService.updateSubcategory(this.subcategory.id, updateData).subscribe({
                next: (updatedSubcategory: any) => {
                    this.loadData(); // Recargar todos los datos para obtener la información actualizada

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Subcategoría actualizada correctamente',
                        life: 3000
                    });
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    console.error('❌ Error al actualizar subcategoría:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al actualizar la subcategoría',
                        life: 3000
                    });
                    this.saving.set(false);
                }
            });
        } else {
            // Crear
            const createData = {
                nombre: nombreSanitizado,
                descripcion: descripcionSanitizada,
                categoria_id: formValue.categoria_id,
                is_active: true // Siempre activa por defecto para nuevas subcategorías
            };

            console.log('🔍 Datos para crear subcategoría:', createData);

            this.subcategoryService.createSubcategory(createData).subscribe({
                next: (newSubcategory: any) => {
                    this.loadData(); // Recargar todos los datos para obtener la información actualizada

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Subcategoría creada correctamente',
                        life: 3000
                    });
                    this.hideDialog();
                    this.saving.set(false);
                },
                error: (error) => {
                    console.error('❌ Error al crear subcategoría:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al crear la subcategoría',
                        life: 3000
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

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.subcategoryDialog) {
            this.hideDialog();
        }
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
