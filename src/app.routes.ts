import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/pages/guards/auth.guard';
import { AdminGuard } from './app/pages/guards/admin.guard';
import { PublicGuard } from './app/pages/guards/public.guard';
import { ErrorPageComponent } from './app/pages/error/error-page.component';

export const appRoutes: Routes = [
    // Redireccionar raíz al login
    { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

    // Ruta del callback OAuth (debe estar fuera del layout)
    {
        path: 'oauth/callback',
        loadComponent: () => import('./app/pages/auth/login/oauth-callback.component').then(m => m.OAuthCallbackComponent)
    },

    // Estructura general de tu app (rutas protegidas)
    {
        path: 'dashboard',
        component: AppLayout,
        canActivate: [AuthGuard], // Usar AuthGuard para permitir acceso a usuarios logueados
        children: [
            {
                path: '',
                component: Dashboard
            },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    // Rutas de autenticación (rutas públicas)
    {
        path: 'auth',
        loadChildren: () => import('./app/pages/auth/auth.routes'),
        canActivate: [PublicGuard] // Proteger rutas de auth para que usuarios logueados no puedan acceder
    },

    // Rutas de error
    { path: 'error/:code', component: ErrorPageComponent },

    // Rutas 404 - redirigir a /error/404 para que el componente reciba el parámetro code
    { path: '**', redirectTo: '/error/404' }
];
