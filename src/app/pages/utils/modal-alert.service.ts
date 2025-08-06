import { Injectable } from '@angular/core';

export interface ModalAlert {
    show: boolean;
    type: 'error' | 'warning' | 'info' | 'success';
    message: string;
    title: string;
}

@Injectable({
    providedIn: 'root'
})
export class ModalAlertService {

    // Método para crear una alerta de error
    createErrorAlert(title: string, message: string): ModalAlert {
        return {
            show: true,
            type: 'error',
            title,
            message
        };
    }

    // Método para crear una alerta de advertencia
    createWarningAlert(title: string, message: string): ModalAlert {
        return {
            show: true,
            type: 'warning',
            title,
            message
        };
    }

    // Método para crear una alerta de información
    createInfoAlert(title: string, message: string): ModalAlert {
        return {
            show: true,
            type: 'info',
            title,
            message
        };
    }

    // Método para crear una alerta de éxito
    createSuccessAlert(title: string, message: string): ModalAlert {
        return {
            show: true,
            type: 'success',
            title,
            message
        };
    }

    // Método para ocultar la alerta
    hideAlert(): ModalAlert {
        return {
            show: false,
            type: 'error',
            title: '',
            message: ''
        };
    }
}
