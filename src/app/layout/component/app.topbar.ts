import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
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
            <div class="relative" *ngIf="!minimal && !isAuthRoute">
                <button
                    class="layout-topbar-action"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                >
                    <i class="pi pi-bell"></i>
                </button>
                <!-- Aquí puedes agregar un menú desplegable de notificaciones en el futuro -->
            </div>

            <!-- Menú de usuario -->
            <div class="relative" *ngIf="!minimal">
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
                    style="background-color: var(--background-color); color: var(--text-color);"
                >
                    <ul style="list-style: none; margin: 0; padding: 0;" >
                        <li >
                            <a
                                routerLink="/profile"
                                class="block px-4 py-2 cursor-pointer hover-bg-secundary"
                            >
                                <i class="material-symbols-outlined">manage_accounts</i>

                                Editar perfil
                            </a>
                        </li>
                        <li>
                            <a
                                (click)="logout()"
                                class="block px-4 py-2 cursor-pointer hover-bg-secundary"
                            >
                                <i class="material-symbols-outlined">logout</i>

                                Cerrar sesión
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    `
})
export class AppTopbar {
    @Input() minimal: boolean = false;
    constructor(public layoutService: LayoutService) {}

    // Verifica si la ruta actual es de autenticación
    isAuthRoute: boolean = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    logout() {
        // Lógica real de logout aquí
        console.log('Cerrando sesión...');
    }
}
