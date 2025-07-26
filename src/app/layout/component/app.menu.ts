import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { OAuthService } from '../../pages/service/oauth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    providers: [MessageService],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>

        <!-- MODAL PERSONALIZADO DE CONFIRMACIÓN PARA LOGOUT -->
        <div *ngIf="showLogoutDialog" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                <!-- Tachita de cerrar -->
                <button type="button" (click)="showLogoutDialog = false" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div class="flex flex-col items-start">
                    <i class="material-symbols-outlined text-6xl mb-4 text-danger">logout</i>
                    <div class="text-left mb-6">
                        <h3 class="text-lg font-semibold mb-2">¿Deseas cerrar tu sesión?</h3>
                        <p class="text-gray-600">Al confirmar, serás desconectado del sistema y deberás volver a iniciar sesión para acceder nuevamente.</p>
                    </div>
                    <div class="flex gap-4 self-end">
                        <button type="button"
                            class="custom-cancel-btn px-6 py-2 font-semibold text-center"
                            (click)="showLogoutDialog = false"
                        >Cancelar</button>
                        <button type="button"
                            class="custom-confirm-accept-danger px-6 py-2 rounded font-semibold text-center"
                            (click)="confirmLogout()"
                        >Cerrar sesión</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        ::ng-deep .logout-menu-item .material-symbols-outlined {
            color: #EF395A !important;
        }

        ::ng-deep .logout-menu-item:hover .material-symbols-outlined {
            color: #c12d47 !important; /* color más oscuro al hacer hover */
        }

        /* Estilos para el modal personalizado */
        .z-modal-confirm {
            z-index: 9999;
        }

        .custom-cancel-btn {
            background-color: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            transition: all 0.2s ease;
            min-width: 100px;
        }

        .custom-cancel-btn:hover {
            background-color: #e5e7eb;
            border-color: #9ca3af;
        }

        .text-danger {
            color: #d9534f;
        }
    `]
})
export class AppMenu {
    model: MenuItem[] = [];
    showLogoutDialog = false;

    constructor(
        private oauthService: OAuthService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Dashboard',
                items: [
                    {
                        label: 'Inicio',
                        icon: 'material-symbols-outlined',
                        iconText: 'home',
                        routerLink: ['/dashboard']
                    }
                ]
            },
            {
                label: 'Usuarios',
                items: [
                    {
                        label: 'Lista Usuarios',
                        icon: 'material-symbols-outlined',
                        iconText: 'groups',
                        routerLink: ['/pages/users-list']
                    },
                    {
                        label: 'Roles',
                        icon: 'material-symbols-outlined',
                        iconText: 'groups',
                        routerLink: ['/pages/roles-crud']
                    }
                ]
            },
            {
                label: 'Gestión',
                items: [
                    {
                        label: 'Herramientas',
                        icon: 'material-symbols-outlined',
                        iconText: 'construction',
                        routerLink: ['/pages/tools']
                    },
                    {
                        label: 'Categorías',
                        icon: 'material-symbols-outlined',
                        svgIcon: 'assets/icons/categorias.svg',
                        routerLink: ['/pages/categories-list']
                    },
                    {
                        label: 'Subcategorías',
                        icon: 'material-symbols-outlined',
                        svgIcon: 'assets/icons/categorias.svg',
                        routerLink: ['/pages/subcategories-list']
                    },
                    {
                        label: 'Reportes',
                        svgIcon: 'assets/icons/reportes.svg',
                        routerLink: ['/pages/reports']
                    },
                    {
                        label: 'Préstamos',
                        svgIcon: 'assets/icons/prestamos.svg',
                        routerLink: ['/pages/loans']
                    },
                    {
                        label: 'Multas y daños',
                        svgIcon: 'assets/icons/multa_nav.svg',
                        routerLink: ['/pages/fines-damages'],
                        style: { background: '#fff' }
                    }
                ]
            },
            {
                label: 'Perfil',
                items: [
                    {
                        label: 'Mi Perfil',
                        icon: 'material-symbols-outlined',
                        iconText: 'person',
                        routerLink: ['/pages/profile']
                    }
                ]
            },
            {
                label: 'Sistema',
                items: [
                    {
                        label: 'Cerrar sesión',
                        icon: 'material-symbols-outlined logout-menu-item',
                        iconText: 'logout',
                        command: () => this.showLogoutConfirmation(),
                        styleClass: 'logout-menu-item'
                    }
                ]
            },

        ];
    }

    /**
     * Muestra el modal de confirmación para cerrar sesión
     */
    showLogoutConfirmation(): void {
        this.showLogoutDialog = true;
    }

    /**
     * Confirma el cierre de sesión y ejecuta el logout
     */
    confirmLogout(): void {
        this.showLogoutDialog = false;

        // Mostrar mensaje de confirmación
        this.messageService.add({
            severity: 'info',
            summary: 'Cerrando sesión',
            detail: 'Sesión cerrada exitosamente',
            life: 2000
        });

        // Ejecutar el logout después de un pequeño delay para que se vea el mensaje
        setTimeout(() => {
            this.oauthService.logout();
        }, 500);
    }
}
