import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalAlert } from './modal-alert.service';

@Component({
    selector: 'app-modal-alert',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div *ngIf="alert.show" class="mb-4 p-4 rounded-lg border-l-4 flex items-start gap-3"
             [ngClass]="{
               'bg-red-50 border-red-400 text-red-800': alert.type === 'error',
               'bg-yellow-50 border-yellow-400 text-yellow-800': alert.type === 'warning',
               'bg-blue-50 border-blue-400 text-blue-800': alert.type === 'info',
               'bg-green-50 border-green-400 text-green-800': alert.type === 'success'
             }">
            <div class="flex-shrink-0">
                <i class="material-symbols-outlined text-xl"
                   [ngClass]="{
                     'text-red-500': alert.type === 'error',
                     'text-yellow-500': alert.type === 'warning',
                     'text-blue-500': alert.type === 'info',
                     'text-green-500': alert.type === 'success'
                   }">
                    {{ alert.type === 'error' ? 'error' :
                       alert.type === 'warning' ? 'warning' :
                       alert.type === 'info' ? 'info' : 'check_circle' }}
                </i>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-semibold mb-1">{{ alert.title }}</h4>
                <p class="text-sm">{{ alert.message }}</p>
            </div>
            <button type="button" (click)="onClose()" class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600">
                <i class="material-symbols-outlined text-lg">close</i>
            </button>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
    `]
})
export class ModalAlertComponent {
    @Input() alert: ModalAlert = {
        show: false,
        type: 'error',
        title: '',
        message: ''
    };

    @Output() close = new EventEmitter<void>();

    onClose() {
        this.close.emit();
    }
}
