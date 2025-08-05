import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Interfaces para los eventos de comunicación
export interface DataUpdateEvent {
  type: 'damage-types' | 'fines-config' | 'damages' | 'fines';
  action: 'created' | 'updated' | 'deleted' | 'status-changed';
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  // BehaviorSubjects para diferentes tipos de datos
  private damageTypesUpdateSubject = new BehaviorSubject<DataUpdateEvent | null>(null);
  private finesConfigUpdateSubject = new BehaviorSubject<DataUpdateEvent | null>(null);
  private damagesUpdateSubject = new BehaviorSubject<DataUpdateEvent | null>(null);
  private finesUpdateSubject = new BehaviorSubject<DataUpdateEvent | null>(null);

  // Observables públicos
  public damageTypesUpdates$ = this.damageTypesUpdateSubject.asObservable();
  public finesConfigUpdates$ = this.finesConfigUpdateSubject.asObservable();
  public damagesUpdates$ = this.damagesUpdateSubject.asObservable();
  public finesUpdates$ = this.finesUpdateSubject.asObservable();

  // Métodos para emitir actualizaciones
  notifyDamageTypesUpdate(event: DataUpdateEvent) {
    this.damageTypesUpdateSubject.next(event);
  }

  notifyFinesConfigUpdate(event: DataUpdateEvent) {
    this.finesConfigUpdateSubject.next(event);
  }

  notifyDamagesUpdate(event: DataUpdateEvent) {
    this.damagesUpdateSubject.next(event);
  }

  notifyFinesUpdate(event: DataUpdateEvent) {
    this.finesUpdateSubject.next(event);
  }

  // Método genérico para notificar cualquier actualización
  notifyUpdate(event: DataUpdateEvent) {
    switch (event.type) {
      case 'damage-types':
        this.notifyDamageTypesUpdate(event);
        break;
      case 'fines-config':
        this.notifyFinesConfigUpdate(event);
        break;
      case 'damages':
        this.notifyDamagesUpdate(event);
        break;
      case 'fines':
        this.notifyFinesUpdate(event);
        break;
    }
  }

  // Métodos de conveniencia para operaciones comunes
  notifyDamageTypeCreated(data: any) {
    this.notifyUpdate({
      type: 'damage-types',
      action: 'created',
      data
    });
  }

  notifyDamageTypeUpdated(data: any) {
    this.notifyUpdate({
      type: 'damage-types',
      action: 'updated',
      data
    });
  }

  notifyDamageTypeDeleted(data: any) {
    this.notifyUpdate({
      type: 'damage-types',
      action: 'deleted',
      data
    });
  }

  notifyDamageTypeStatusChanged(data: any) {
    this.notifyUpdate({
      type: 'damage-types',
      action: 'status-changed',
      data
    });
  }

  notifyFinesConfigCreated(data: any) {
    this.notifyUpdate({
      type: 'fines-config',
      action: 'created',
      data
    });
  }

  notifyFinesConfigUpdated(data: any) {
    this.notifyUpdate({
      type: 'fines-config',
      action: 'updated',
      data
    });
  }

  notifyFinesConfigDeleted(data: any) {
    this.notifyUpdate({
      type: 'fines-config',
      action: 'deleted',
      data
    });
  }

  notifyDamageCreated(data: any) {
    this.notifyUpdate({
      type: 'damages',
      action: 'created',
      data
    });
  }

  notifyDamageUpdated(data: any) {
    this.notifyUpdate({
      type: 'damages',
      action: 'updated',
      data
    });
  }

  notifyDamageDeleted(data: any) {
    this.notifyUpdate({
      type: 'damages',
      action: 'deleted',
      data
    });
  }

  notifyFineCreated(data: any) {
    this.notifyUpdate({
      type: 'fines',
      action: 'created',
      data
    });
  }

  notifyFineUpdated(data: any) {
    this.notifyUpdate({
      type: 'fines',
      action: 'updated',
      data
    });
  }

  notifyFineDeleted(data: any) {
    this.notifyUpdate({
      type: 'fines',
      action: 'deleted',
      data
    });
  }
}
