import { Routes } from '@angular/router';
import { ToolCrudComponent } from './tools-crud.component';
import { Empty } from './empty/empty';
import { CategoriesListComponent } from './categories-list/categories-list.component';
import {  UserCrudComponent } from './users/users-crud';
import { RolesCrudComponent } from './roles-crud.component';

export default [
    { path: 'tools', component: ToolCrudComponent },
    { path: 'empty', component: Empty },
    {path: 'categories-list', component:CategoriesListComponent},
    {path: 'users-list', component:UserCrudComponent},
    {path: 'roles-crud', component:RolesCrudComponent},


    { path: '**', redirectTo: '/notfound' },
] as Routes;
