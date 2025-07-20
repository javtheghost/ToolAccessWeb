import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/pages/guards/auth.guard';

export const appRoutes: Routes = [
    // Redireccionar raíz al login
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

    // Ruta del callback OAuth (debe estar fuera del layout)
    {
        path: 'oauth/callback',
        loadComponent: () => import('./app/pages/auth/login/oauth-callback.component').then(m => m.OAuthCallbackComponent)
    },

    // Estructura general de tu app
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: 'dashboard',
                component: Dashboard,
                // canActivate: [AuthGuard]
            }, // Cambiado a /dashboard en vez de raíz
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
