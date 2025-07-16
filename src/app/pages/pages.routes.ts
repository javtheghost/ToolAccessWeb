import { Routes } from '@angular/router';
import { Empty } from './empty/empty';
import { RolesCrudComponent } from './roles-crud.component';
import { CategoriesCrudComponent } from './categories-crud.component';
import { SubcategoriasCrudComponent } from './subcategorias-crud.component';
import { UsersCrudComponent } from './users/users-crud';
import { ToolsCrudComponent } from './tools-crud.component';
import { LoansCrudComponent } from './loans-crud.component';
import { ReportsPageComponent } from './reports-page.component';

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

    { path: '**', redirectTo: '/notfound' },
] as Routes;
