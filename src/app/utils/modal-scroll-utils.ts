/**
 * Utilidades para manejar el scroll de modales con dropdowns
 * Soluciona el problema de los dos scrollbars simultáneos
 */

export class ModalScrollUtils {

    /**
     * Prevenir el scroll del modal cuando se abre un dropdown
     */
    static onDropdownOpen(event: any): void {
        const modalContent = document.querySelector('.p-dialog .p-dialog-content');
        if (modalContent) {
            modalContent.classList.add('p-dropdown-open');
        }
    }

    /**
     * Restaurar el scroll del modal cuando se cierra un dropdown
     */
    static onDropdownClose(event: any): void {
        const modalContent = document.querySelector('.p-dialog .p-dialog-content');
        if (modalContent) {
            modalContent.classList.remove('p-dropdown-open');
        }
    }

    /**
     * Estilos CSS para modales con manejo de scroll
     */
    static getModalScrollStyles(): string {
        return `
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
        `;
    }
}
