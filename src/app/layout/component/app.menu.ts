import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { OAuthService } from '../../pages/service/oauth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `,
    styles: [`
        ::ng-deep .logout-menu-item .material-symbols-outlined {
            color: #EF395A !important;
        }

        ::ng-deep .logout-menu-item:hover .material-symbols-outlined {
            color: #c12d47 !important; /* color más oscuro al hacer hover */
        }
    `]
})
export class AppMenu {
    model: MenuItem[] = [];

    constructor(private oauthService: OAuthService) {}

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
                        command: () => this.oauthService.logout(),
                        styleClass: 'logout-menu-item'
                    }
                ]
            },

        ];
    }
}
