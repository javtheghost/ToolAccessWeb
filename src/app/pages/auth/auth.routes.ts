import { Routes } from '@angular/router';
import { Access } from './access';
import { LoginComponent } from './login/login.component';

export default [
    { path: '', component: LoginComponent }, // Login como página principal
    { path: 'access', component: Access },
    { path: 'login', component: LoginComponent },
] as Routes;
