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

interface FineConfig {
  id: string;
  name: string;
  category: string;
  baseValue: number;
  active: boolean;
}

@Component({
  selector: 'app-fines-config',
  standalone: true,
  templateUrl: './fines-config.component.html',
  styleUrls: ['./fines-config.component.scss'],
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
export class FinesConfigComponent implements OnInit {
  fines: FineConfig[] = [];
  fineDialog = false;
  fine: FineConfig = this.emptyFine();
  isEditMode = false;
  selectedFines: FineConfig[] | null = null;
  @ViewChild('dt') dt!: Table;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadDemoData();
  }

  loadDemoData() {
    this.fines = [
      { id: '1', name: 'Daño de herramienta', category: 'categoría name', baseValue: 200, active: true },
      { id: '2', name: 'Retraso', category: 'categoría name', baseValue: 20, active: false }
    ];
  }

  openNew() {
    this.fine = this.emptyFine();
    this.isEditMode = false;
    this.fineDialog = true;
  }

  editFine(fine: FineConfig) {
    this.fine = { ...fine };
    this.isEditMode = true;
    this.fineDialog = true;
  }

  deleteFine(fine: FineConfig) {
    this.fines = this.fines.filter(f => f.id !== fine.id);
    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Multa eliminada', life: 2000 });
  }

  saveFine() {
    if (this.fine.name?.trim()) {
      if (this.isEditMode) {
        const idx = this.fines.findIndex(f => f.id === this.fine.id);
        if (idx > -1) this.fines[idx] = { ...this.fine };
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Multa actualizada', life: 2000 });
      } else {
        this.fine.id = this.createId();
        this.fines.push({ ...this.fine });
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Multa creada', life: 2000 });
      }
      this.fineDialog = false;
      this.isEditMode = false;
      this.fine = this.emptyFine();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El nombre es requerido', life: 2000 });
    }
  }

  emptyFine(): FineConfig {
    return { id: '', name: '', category: '', baseValue: 0, active: true };
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
