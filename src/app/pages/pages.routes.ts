
import { Routes } from '@angular/router';
import { Empty } from './empty/empty';
import { RolesCrudComponent } from './roles/roles-crud.component';
import { CategoriesCrudComponent } from './categories/categories-crud.component';
import { UsersCrudComponent } from './users/users-crud';
import { ToolsCrudComponent } from './tools-crud.component';
import { LoansCrudComponent } from './loans/loans-crud.component';
import { SubcategoriasCrudComponent } from './subcategories/subcategorias-crud.component';
import { FinesDamagesComponent } from './fines-damages/fines-damages.component';

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
    // {
    //   path: 'profile-settings',
    //   loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
    // },

    { path: '**', redirectTo: '/notfound' },
] as Routes;
