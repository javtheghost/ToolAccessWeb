import { Routes } from '@angular/router';
import { ToolCrudComponent } from './tools-crud.component';
import { Empty } from './empty/empty';
import { RolesCrudComponent } from './roles-crud.component';
import { CategoriesCrudComponent } from './categories-crud.component';
import { UsersCrudComponent } from './users/users-crud';

export default [
    { path: 'tools', component: ToolCrudComponent },
    { path: 'empty', component: Empty },
    {path: 'categories-list', component:CategoriesCrudComponent},
    {path: 'users-list', component:UsersCrudComponent},
    {path: 'roles-crud', component:RolesCrudComponent},


    { path: '**', redirectTo: '/notfound' },
] as Routes;
