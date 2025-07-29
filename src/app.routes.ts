import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/pages/guards/auth.guard';
import { AdminGuard } from './app/pages/guards/admin.guard';
import { PublicGuard } from './app/pages/guards/public.guard';
import { ErrorPageComponent } from './app/pages/error/error-page.component';

export const appRoutes: Routes = [
    // Ruta del callback OAuth (debe estar fuera del layout)
    {
        path: 'oauth/callback',
        loadComponent: () => import('./app/pages/auth/login/oauth-callback.component').then(m => m.OAuthCallbackComponent)
    },

    // Rutas de autenticación (rutas públicas) - Ahora en la raíz
    {
        path: '',
        loadChildren: () => import('./app/pages/auth/auth.routes'),
        canActivate: [PublicGuard] // Proteger rutas de auth para que usuarios logueados no puedan acceder
    },

    // Estructura general de tu app (rutas protegidas) - Ahora en /app
    {
        path: 'app',
        component: AppLayout,
        canActivate: [AuthGuard], // Usar AuthGuard para permitir acceso a usuarios logueados
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },

    // Rutas de error
    { path: 'error/:code', component: ErrorPageComponent },

    // Rutas 404 - redirigir a la raíz (login) para rutas no válidas
    { path: '**', redirectTo: '/' }
];
