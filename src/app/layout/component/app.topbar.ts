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

            <!-- Botón de notificaciones -->
            <div class="relative" *ngIf="!minimal && !isAuthRoute && isAuthenticated">
                <button
                    class="layout-topbar-action relative"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                    (click)="toggleNotifications()"
                >
                    <i class="pi pi-bell"></i>
                    <!-- Badge de notificaciones no leídas -->
                    <span
                        *ngIf="unreadCount > 0"
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg notification-badge"
                        style="min-width: 24px; min-height: 24px;"
                    >
                        {{ unreadCount > 99 ? '99+' : unreadCount }}
                    </span>
                </button>

                <!-- Menú desplegable de notificaciones -->
                <div
                    class="hidden absolute right-0 mt-2 w-80 border rounded-lg shadow-lg z-50 max-h-96 text-black bg-white"
                    style="color: var(--text-color); background-color: white;"
                >
                    <!-- Header del menú -->
                    <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-white">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold" style="color: var(--primary-color);">Notificaciones</h3>
                            <button
                                *ngIf="unreadCount > 0"
                                (click)="markAllAsRead()"
                                class="text-sm hover:opacity-80 transition-opacity"
                                style="color: var(--primary-color);"
                            >
                                Marcar todas como leídas
                            </button>
                        </div>
                    </div>

                    <!-- Lista de notificaciones con scroll -->
                    <div class="max-h-64 overflow-y-auto">
                        <!-- Notificación 1 -->
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors" (click)="markAsRead(1)">
                            <div class="flex items-start space-x-3">
                                <div class="flex-shrink-0">
                                    <i class="pi pi-tools text-lg" style="color: var(--primary-color);"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <p class="text-sm font-medium" style="color: var(--primary-color);">Préstamo solicitado</p>
                                        <span class="text-xs" style="color: var(--primary-color);">Hace 5 min</span>
                                    </div>
                                    <p class="text-sm" style="color: var(--primary-color);">Juan Pérez ha solicitado el préstamo de la herramienta "Taladro DeWalt"</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <div class="w-2 h-2 rounded-full" style="background-color: var(--primary-color);"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Notificación 2 -->
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors" (click)="markAsRead(2)">
                            <div class="flex items-start space-x-3">
                                <div class="flex-shrink-0">
                                    <i class="pi pi-check-circle text-lg" style="color: var(--primary-color);"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <p class="text-sm font-medium" style="color: var(--primary-color);">Préstamo aprobado</p>
                                        <span class="text-xs" style="color: var(--primary-color);">Hace 15 min</span>
                                    </div>
                                    <p class="text-sm" style="color: var(--primary-color);">El préstamo de "Sierra circular" ha sido aprobado por el administrador</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <div class="w-2 h-2 rounded-full" style="background-color: var(--primary-color);"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Notificación 3 -->
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors" (click)="markAsRead(3)">
                            <div class="flex items-start space-x-3">
                                <div class="flex-shrink-0">
                                    <i class="pi pi-exclamation-triangle text-lg" style="color: var(--primary-color);"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <p class="text-sm font-medium" style="color: var(--primary-color);">Multa aplicada</p>
                                        <span class="text-xs" style="color: var(--primary-color);">Hace 2 h</span>
                                    </div>
                                    <p class="text-sm" style="color: var(--primary-color);">Se ha aplicado una multa de $50 por devolución tardía de "Martillo"</p>
                                </div>
                            </div>
                        </div>

                        <!-- Notificación 4 -->
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors" (click)="markAsRead(4)">
                            <div class="flex items-start space-x-3">
                                <div class="flex-shrink-0">
                                    <i class="pi pi-undo text-lg" style="color: var(--primary-color);"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <p class="text-sm font-medium" style="color: var(--primary-color);">Herramienta devuelta</p>
                                        <span class="text-xs" style="color: var(--primary-color);">Hace 4 h</span>
                                    </div>
                                    <p class="text-sm" style="color: var(--primary-color);">María García ha devuelto la herramienta "Destornillador Phillips"</p>
                                </div>
                            </div>
                        </div>

                        <!-- Notificación 5 -->
                        <div class="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors" (click)="markAsRead(5)">
                            <div class="flex items-start space-x-3">
                                <div class="flex-shrink-0">
                                    <i class="pi pi-plus-circle text-lg" style="color: var(--primary-color);"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <p class="text-sm font-medium" style="color: var(--primary-color);">Nueva herramienta registrada</p>
                                        <span class="text-xs" style="color: var(--primary-color);">Hace 6 h</span>
                                    </div>
                                    <p class="text-sm" style="color: var(--primary-color);">Se ha registrado una nueva herramienta: "Compresor de aire"</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <div class="w-2 h-2 rounded-full" style="background-color: var(--primary-color);"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="p-3 border-t border-gray-200 dark:border-gray-700 bg-white">
                        <button
                            (click)="viewAllNotifications()"
                            class="w-full text-center text-sm " style="color: var(--primary-color);"
                        >
                            Ver todas las notificaciones
                        </button>
                    </div>
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
                                routerLink="/profile"
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
        @keyframes notification-pulse {
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
        }
    `]
})
export class AppTopbar implements OnDestroy {
    @Input() minimal: boolean = false;

    unreadCount: number = 3; // Hardcodeado: 3 notificaciones no leídas

    // Simular notificaciones nuevas cada cierto tiempo
    private notificationInterval: any;
    showLogoutDialog = false;

    constructor(
        public layoutService: LayoutService,
        private oauthService: OAuthService,
        private messageService: MessageService
    ) {
        // Iniciar simulación de notificaciones nuevas
        this.startNotificationSimulation();
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

    toggleNotifications() {
        // La funcionalidad de toggle se maneja automáticamente con pStyleClass
    }

    markAsRead(notificationId: number) {
        // Simular marcar como leído
        this.unreadCount = Math.max(0, this.unreadCount - 1);
    }

    markAllAsRead() {
        // Simular marcar todas como leídas
        this.unreadCount = 0;
    }

    viewAllNotifications() {
        // Navegar a una página de todas las notificaciones
    }

    /**
     * Simula la llegada de nuevas notificaciones
     */
    private startNotificationSimulation() {
        // Simular nuevas notificaciones cada 30 segundos (solo para demostración)
        this.notificationInterval = setInterval(() => {
            // Solo agregar notificaciones si el usuario está autenticado
            if (this.isAuthenticated && !this.isAuthRoute) {
                this.unreadCount += Math.floor(Math.random() * 2) + 1; // 1-2 notificaciones nuevas

                // Mostrar mensaje de notificación nueva
                this.messageService.add({
                    severity: 'info',
                    summary: 'Nueva notificación',
                    detail: `Tienes ${this.unreadCount} notificaciones no leídas`,
                    life: 3000
                });
            }
        }, 30000); // 30 segundos
    }

    /**
     * Detiene la simulación de notificaciones
     */
    private stopNotificationSimulation() {
        if (this.notificationInterval) {
            clearInterval(this.notificationInterval);
        }
    }

    /**
     * Limpia los recursos cuando el componente se destruye
     */
    ngOnDestroy() {
        this.stopNotificationSimulation();
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
