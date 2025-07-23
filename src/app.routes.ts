import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/pages/guards/auth.guard';
import { AdminGuard } from './app/pages/guards/admin.guard';
import { ErrorPageComponent } from './app/pages/error/error-page.component';

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
        canActivate: [AdminGuard], // Solo administradores pueden acceder a dashboard y pages
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    // Rutas específicas


    // Rutas de autenticación
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },

    // Rutas de error
    { path: 'error/:code', component: ErrorPageComponent },

    // Cualquier otra ruta redirige al login (opcionalmente a notfound)
    { path: '**', redirectTo: '/error/404' }
];
