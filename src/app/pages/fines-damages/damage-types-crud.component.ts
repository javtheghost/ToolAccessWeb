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

interface DamageType {
    id: string;
    name: string;
    description: string;
    percentage: number;
    active: boolean;
}

@Component({
    selector: 'app-damage-types-crud',
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
        InputIconModule,
        IconFieldModule
    ],
    template: `
<p-toast></p-toast>
<div class="p-4">
    <p-table
        #dt
        [value]="damageTypes"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="['name', 'description']"
        [tableStyle]="{ 'min-width': '100%' }"
        [(selection)]="selectedDamageTypes"
        [rowHover]="true"
        dataKey="id"
        [showCurrentPageReport]="false"
        [rowsPerPageOptions]="[5, 10, 15]"
        [scrollable]="true"
        scrollHeight="300px"
        class="shadow-md rounded-lg"
    >
        <ng-template #caption>
            <div class="flex items-center justify-between">
                <h5 class="m-0 p-2 text-[var(--primary-color)]">Tipos de daño</h5>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
                <p-iconfield class="flex-1 w-full sm:w-auto">
                    <p-inputicon styleClass="pi pi-search" />
                    <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Buscar..." />
                </p-iconfield>
                <div class="flex justify-end w-full sm:w-auto">
                    <p-button label="Nuevo Tipo de daño" icon="pi pi-plus" (onClick)="openNew()"></p-button>
                </div>
            </div>
        </ng-template>
        <ng-template pTemplate="header">
            <tr class="bg-[#6ea1cc] text-white">
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Porcentaje</th>
                <th>Activo</th>
                <th>Acciones</th>
            </tr>
        </ng-template>
        <ng-template pTemplate="body" let-damageType>
            <tr>
                <td>{{ damageType.id }}</td>
                <td>{{ damageType.name }}</td>
                <td>{{ damageType.description }}</td>
                <td>{{ damageType.percentage }}%</td>
                <td>
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="damageType.active" disabled />
                </td>
                <td>
                    <p-button (click)="editDamageType(damageType)" styleClass="custom-flat-icon-button custom-flat-icon-button-edit mr-2">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">edit</i>
                        </ng-template>
                    </p-button>
                    <p-button (click)="deleteDamageType(damageType)" styleClass="custom-flat-icon-button custom-flat-icon-button-delete">
                        <ng-template pTemplate="icon">
                            <i class="material-symbols-outlined">delete</i>
                        </ng-template>
                    </p-button>
                </td>
            </tr>
        </ng-template>
    </p-table>
</div>
<p-dialog
  [(visible)]="damageTypeDialog"
  [style]="{ width: '90vw', maxWidth: '500px' }"
  [modal]="true"
  [draggable]="false"
  [resizable]="false"
>
  <ng-template pTemplate="header">
    <span style="color: var(--primary-color); font-weight: bold; font-size: 1.25rem;">
      {{ isEditMode ? 'Editar Tipo de Daño' : 'Nuevo Tipo de Daño' }}
    </span>
  </ng-template>
    <ng-template pTemplate="content">
        <div class="space-y-4">
            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">edit</span>
                <input type="text" id="name" name="name" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Nombre" [(ngModel)]="damageType.name" />
                <label for="name" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-4 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Nombre</label>
            </div>

            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-6 text-gray-600 pointer-events-none">edit_document</span>
                <textarea id="description" name="description" rows="3" class="peer block w-full rounded-lg border border-gray-300 bg-transparent px-10 pt-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Descripción" [(ngModel)]="damageType.description"></textarea>
                <label for="description" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:left-4 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Descripción...</label>
            </div>

            <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">percent</span>
                <input type="number" id="percentage" name="percentage" min="0" max="100" required class="peer block w-full h-12 rounded-lg border border-gray-300 bg-transparent px-10 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]" placeholder=" " aria-label="Porcentaje" [(ngModel)]="damageType.percentage" />
                <label for="percentage" class="absolute left-10 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform text-base text-gray-600 duration-300 peer-placeholder-shown:left-10 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:left-4 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-[var(--primary-color)] bg-white px-1">Porcentaje (%)</label>
            </div>

            <div class="flex items-center justify-center pt-2">
                <div class="flex items-center space-x-3">
                    <label class="text-sm font-medium text-gray-700">Estado activo</label>
                    <input type="checkbox" class="custom-toggle" [(ngModel)]="damageType.active" />
                </div>
            </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
            <button pButton type="button" class="custom-cancel-btn px-6 py-2" (click)="hideDialog()">Cancelar</button>
            <button pButton type="button" class="p-button px-6 py-2" (click)="saveDamageType()">Guardar</button>
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
            background: #fff !important;
        }

        :host ::ng-deep .p-dialog .p-dialog-content {
            border-radius: 0 0 12px 12px !important;
            background: #fff !important;
        }


    `]
})
export class DamageTypesCrudComponent implements OnInit {
    damageTypes: DamageType[] = [];
    damageTypeDialog: boolean = false;
    damageType: DamageType = this.emptyDamageType();
    selectedDamageTypes: DamageType[] | null = null;
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
        this.damageTypes = [
            {
                id: '1',
                name: 'Daño grave',
                description: 'Inutiliza la herramienta',
                percentage: 70,
                active: true
            },
            {
                id: '2',
                name: 'Daño moderado',
                description: 'Requiere reparación',
                percentage: 40,
                active: true
            }
        ];
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.damageType = this.emptyDamageType();
        this.isEditMode = false;
        this.damageTypeDialog = true;
    }

    editDamageType(damageType: DamageType) {
        this.damageType = { ...damageType };
        this.isEditMode = true;
        this.damageTypeDialog = true;
    }

    deleteDamageType(damageType: DamageType) {
        this.confirmIcon = 'delete';
        this.confirmMessage = `¿Estás seguro de eliminar el tipo de daño <span class='text-primary'>${damageType.name}</span>? Una vez que aceptes, no podrás revertir los cambios.`;
        this.confirmAction = () => {
            this.damageTypes = this.damageTypes.filter(t => t.id !== damageType.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Tipo de daño eliminado',
                life: 3000
            });
        };
        this.showCustomConfirm = true;
    }

    hideDialog() {
        this.damageTypeDialog = false;
        this.isEditMode = false;
        this.showCustomConfirm = false;
    }

    saveDamageType() {
        if (this.damageType.name?.trim()) {
            if (this.damageType.id) {
                // Modo edición - mostrar confirmación
                this.confirmIcon = 'warning';
                this.confirmMessage = `¿Estás seguro que deseas actualizar el tipo de daño <span class='text-primary'>${this.damageType.name}</span>? Una vez que aceptes, los cambios reemplazarán la información actual.`;
                this.confirmAction = () => {
                    const idx = this.damageTypes.findIndex(t => t.id === this.damageType.id);
                    if (idx > -1) this.damageTypes[idx] = { ...this.damageType };
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Tipo de daño actualizado',
                        life: 3000
                    });
                    this.damageTypeDialog = false;
                    this.isEditMode = false;
                    this.damageType = this.emptyDamageType();
                };
                this.showCustomConfirm = true;
            } else {
                this.damageType.id = this.createId();
                this.damageTypes.push({ ...this.damageType });
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Tipo de daño creado',
                    life: 3000
                });
                this.damageTypeDialog = false;
                this.isEditMode = false;
                this.damageType = this.emptyDamageType();
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

    emptyDamageType(): DamageType {
        return {
            id: '',
            name: '',
            description: '',
            percentage: 0,
            active: true
        };
    }

    @HostListener('document:keydown.escape')
    onEscapePress() {
        if (this.showCustomConfirm) {
            this.onCustomConfirmReject();
        } else if (this.damageTypeDialog) {
            this.hideDialog();
        }
    }
}
