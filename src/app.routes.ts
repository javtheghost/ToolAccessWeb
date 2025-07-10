import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    // Redireccionar raíz al login
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

    // Estructura general de tu app
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'dashboard', component: Dashboard }, // Cambiado a /dashboard en vez de raíz
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    // Rutas específicas
    { path: 'notfound', component: Notfound },

    // Rutas de autenticación
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },

    // Cualquier otra ruta redirige al login (opcionalmente a notfound)
    { path: '**', redirectTo: '/auth/login' }
];
