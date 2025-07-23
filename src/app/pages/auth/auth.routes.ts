import { Routes } from '@angular/router';
import { Access } from './access';
import { LoginComponent } from './login/login.component';

export default [
    { path: 'access', component: Access },
    { path: 'login', component: LoginComponent },


] as Routes;
