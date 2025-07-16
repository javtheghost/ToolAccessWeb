import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface DamageType {
  id: string;
  name: string;
  description: string;
  percentage: number;
  active: boolean;
}

@Component({
  selector: 'app-damage-types-registry',
  standalone: true,
  templateUrl: './damage-types-registry.component.html',
  styleUrls: ['./damage-types-registry.component.scss'],
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputSwitchModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class DamageTypesRegistryComponent implements OnInit {
  damageTypes: DamageType[] = [];
  damageTypeDialog = false;
  damageType: DamageType = this.emptyDamageType();
  isEditMode = false;
  selectedDamageTypes: DamageType[] | null = null;
  @ViewChild('dt') dt!: Table;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadDemoData();
  }

  loadDemoData() {
    this.damageTypes = [
      { id: '1', name: 'Daño grave', description: 'Inutiliza la herramienta', percentage: 70, active: true },
      { id: '2', name: 'Daño moderado', description: 'Requiere reparación', percentage: 40, active: true }
    ];
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
    this.damageTypes = this.damageTypes.filter(d => d.id !== damageType.id);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo de daño eliminado', life: 2000 });
  }

  saveDamageType() {
    if (this.damageType.name?.trim()) {
      if (this.isEditMode) {
        const idx = this.damageTypes.findIndex(d => d.id === this.damageType.id);
        if (idx > -1) this.damageTypes[idx] = { ...this.damageType };
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo de daño actualizado', life: 2000 });
      } else {
        this.damageType.id = this.createId();
        this.damageTypes.push({ ...this.damageType });
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Tipo de daño creado', life: 2000 });
      }
      this.damageTypeDialog = false;
      this.isEditMode = false;
      this.damageType = this.emptyDamageType();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El nombre es requerido', life: 2000 });
    }
  }

  emptyDamageType(): DamageType {
    return { id: '', name: '', description: '', percentage: 0, active: true };
  }

  createId(): string {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}
