import { FinesDamagesComponent } from './fines-damages/fines-damages.component';
import { FinesConfigComponent } from './fines-damages/fines-config/fines-config.component';
import { Routes } from '@angular/router';
import { Empty } from './empty/empty';
import { RolesCrudComponent } from './roles-crud.component';
import { CategoriesCrudComponent } from './categories-crud.component';
import { SubcategoriasCrudComponent } from './subcategorias-crud.component';
import { UsersCrudComponent } from './users/users-crud';
import { ToolsCrudComponent } from './tools-crud.component';
import { LoansCrudComponent } from './loans-crud.component';
import { ReportsPageComponent } from './reports-page.component';
import { AuthGuard } from '../pages/guards/auth.guard';
import { AdminGuard } from '../pages/guards/admin.guard';

export default [
    { path: 'tools', component: ToolsCrudComponent },
    { path: 'loans', component: LoansCrudComponent },
    { path: 'empty', component: Empty },
    {path: 'categories-list', component:CategoriesCrudComponent},
    {path: 'subcategories-list', component:SubcategoriasCrudComponent},
    {path: 'users-list', component:UsersCrudComponent},
    {path: 'roles-crud', component:RolesCrudComponent},
    {
      path: 'reports',
      loadComponent: () => import('./reports-page.component').then(m => m.ReportsPageComponent)
    },
    {
        path: 'fines-damages',
        loadComponent: () => import('./fines-damages/fines-damages.component').then(m => m.FinesDamagesComponent)
      },
    {
      path: 'dashboard',
      loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard),
      canActivate: [AuthGuard]
    },
    { path: '**', redirectTo: '/notfound' },
] as Routes;
