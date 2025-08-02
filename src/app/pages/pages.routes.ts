
import { Routes } from '@angular/router';
import { RolesCrudComponent } from './roles/roles-crud.component';
import { CategoriesCrudComponent } from './categories/categories-crud.component';
import { UsersCrudComponent } from './users/users-crud';
import { ToolsCrudComponent } from './tools-crud.component';
import { LoansCrudComponent } from './loans/loans-crud.component';
import { SubcategoriasCrudComponent } from './subcategories/subcategorias-crud.component';
import { FinesDamagesComponent } from './fines-damages/fines-damages.component';
import { ProfileComponent } from './profile/profile.component';
import { ErrorPageComponent } from './error/error-page.component';

export default [
    { path: 'tools', component: ToolsCrudComponent },
    { path: 'loans', component: LoansCrudComponent },
    {path: 'categories-list', component:CategoriesCrudComponent},
    {path: 'subcategories-list', component:SubcategoriasCrudComponent},
    {path: 'users-list', component:UsersCrudComponent},
    {path: 'roles-crud', component:RolesCrudComponent},
    {
      path: 'reports',
      loadComponent: () => import('./reports/reports-page.component').then(m => m.ReportsPageComponent)
    },

    {
      path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
    },
    {
      path: 'fines-damages',
      component: FinesDamagesComponent
    },

    {
      path: 'profile',
      component: ProfileComponent
    },
    {
      path: 'unauthorized',
      component: ErrorPageComponent,
      data: {
        code: 401,
        message: 'No autorizado. Por favor, inicia sesión o verifica tus permisos.',
        image: 'assets/errors/401_unauthorized.svg'
      }
    },
    {
      path: 'notfound',
      component: ErrorPageComponent,
      data: {
        code: 404,
        message: 'Página no encontrada. La URL no existe.',
        image: 'assets/errors/404.svg'
      }
    },
    {
      path: 'server-error',
      component: ErrorPageComponent,
      data: {
        code: 500,
        message: 'Error interno del servidor. Intenta más tarde.',
        image: 'assets/errors/500.svg'
      }
    },
    { path: '**', redirectTo: '/notfound' },
] as Routes;
