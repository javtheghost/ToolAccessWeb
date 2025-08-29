import { Component, Input, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { OAuthService } from '../../pages/service/oauth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    providers: [MessageService],
    template: `
    <div class="layout-topbar py-10">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" *ngIf="!minimal && !isAuthRoute" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <img src="assets/logos/logoHeader.png" alt="logo toolaccess" routerLink="/dashboard" class="layout-topbar-logo p-5 m-5" />
            <a routerLink="/dashboard" class="layout-topbar-logo-text">
                <span>ToolAccess</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <div class="relative" [hidden]="true">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

       

            <!-- Menú de usuario - Solo mostrar si está autenticado -->
            <div class="relative" *ngIf="!minimal && isAuthenticated">
                <button
                    class="layout-topbar-action"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                >
                    <i class="pi pi-user"></i>
                </button>

                <!-- Menú desplegable -->
                <div
                    class="hidden absolute right-0 mt-2 w-40 border rounded shadow-md z-50"
                    style="background-color: var(--background-color); color: #fff;"
                >
                    <ul style="list-style: none; margin: 0; padding: 0;" >
                        <!-- Nombre del usuario -->
                        <li class="border-b border-gray-600">
                            <div class="block px-4 py-2" style="color: #fff; font-weight: 500;">
                                <i class="material-symbols-outlined" style="color: #fff;">person</i>
                                {{ getUserName() }}
                            </div>
                        </li>
                        <li >
                            <a
                                routerLink="/dashboard/pages/profile"
                                class="block px-4 py-2 cursor-pointer hover-bg-secundary"
                                style="color: #fff;"
                            >
                                <i class="material-symbols-outlined" style="color: #fff;">manage_accounts</i>

                                Ver perfil
                            </a>
                        </li>
                        <li>
                            <a
                                (click)="logout()"
                                class="block px-4 py-2 cursor-pointer hover-bg-secundary"
                                style="color: #fff;"
                            >
                                <i class="material-symbols-outlined" style="color: #fff;">logout</i>

                                Cerrar sesión
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

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

        /* Estilos para el badge de notificaciones */
        /* @keyframes notification-pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.8;
            }
        }

        .notification-badge {
            animation: notification-pulse 2s infinite;
            transition: all 0.3s ease;
        }

        .notification-badge:hover {
            transform: scale(1.05);
        } */
    `]
})
export class AppTopbar implements OnDestroy {
    @Input() minimal: boolean = false;

    // unreadCount: number = 3; // Hardcodeado: 3 notificaciones no leídas

    // Simular notificaciones nuevas cada cierto tiempo
    // private notificationInterval: any;
    showLogoutDialog = false;

    constructor(
        public layoutService: LayoutService,
        private oauthService: OAuthService,
        private messageService: MessageService
    ) {
        // Iniciar simulación de notificaciones nuevas
        // this.startNotificationSimulation();
    }

    // Verifica si la ruta actual es de autenticación
    isAuthRoute: boolean = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');

    // Verifica si el usuario está autenticado
    get isAuthenticated(): boolean {
        return this.oauthService.isAuthenticated();
    }

    // Obtiene el nombre del usuario
    getUserName(): string {
        const user = this.oauthService.getCurrentUser();
        return user ? user.nombre : 'Usuario';
    }

    // toggleNotifications() {
    //     // La funcionalidad de toggle se maneja automáticamente con pStyleClass
    // }

    // markAsRead(notificationId: number) {
    //     // Simular marcar como leído
    //     this.unreadCount = Math.max(0, this.unreadCount - 1);
    // }

    // markAllAsRead() {
    //     // Simular marcar todas como leídas
    //     this.unreadCount = 0;
    // }

    // viewAllNotifications() {
    //     // Navegar a una página de todas las notificaciones
    // }

    /**
     * Simula la llegada de nuevas notificaciones
     */
    // private startNotificationSimulation() {
    //     // Simular nuevas notificaciones cada 30 segundos (solo para demostración)
    //     this.notificationInterval = setInterval(() => {
    //         // Solo agregar notificaciones si el usuario está autenticado
    //         if (this.isAuthenticated && !this.isAuthRoute) {
    //             this.unreadCount += Math.floor(Math.random() * 2) + 1; // 1-2 notificaciones nuevas

    //         // Mostrar mensaje de notificación nueva
    //         this.messageService.add({
    //             severity: 'info',
    //             summary: 'Nueva notificación',
    //             detail: `Tienes ${this.unreadCount} notificaciones no leídas`,
    //             life: 3000
    //         });
    //         }
    //     }, 30000); // 30 segundos
    // }

    /**
     * Detiene la simulación de notificaciones
     */
    // private stopNotificationSimulation() {
    //     if (this.notificationInterval) {
    //         clearInterval(this.notificationInterval);
    //     }
    // }

    /**
     * Limpia los recursos cuando el componente se destruye
     */
    ngOnDestroy() {
        // this.stopNotificationSimulation();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    logout() {
        this.showLogoutConfirmation();
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
