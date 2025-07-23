import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from '../../service/oauth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-oauth-callback',
  template: `
    <div class="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center w-full max-w-md">
        <ng-container *ngIf="!error; else errorBlock">
          <div class="mb-6">
            <div class="loader mb-4"></div>
            <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {{ status === 'Autenticación exitosa, navegando...' ? '¡Autenticación exitosa!' : 'Procesando autenticación...' }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300" *ngIf="status !== 'Autenticación exitosa, navegando...'">
              Por favor espera unos segundos...
            </p>
            <p class="text-green-600 font-semibold" *ngIf="status === 'Autenticación exitosa, navegando...'">
              Redirigiendo a tu panel...
            </p>
          </div>
        </ng-container>
        <ng-template #errorBlock>
          <div class="mb-6 flex flex-col items-center">
            <span class="text-5xl text-red-500 mb-2">✖</span>
            <h2 class="text-2xl font-bold text-red-600 mb-2">¡Error en autenticación!</h2>
            <p class="text-gray-700 dark:text-gray-200 mb-4">{{ error }}</p>
            <button (click)="reintentar()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Reintentar
            </button>
          </div>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    .loader {
      border: 6px solid #f3f3f3;
      border-top: 6px solid #3498db;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg);}
      100% { transform: rotate(360deg);}
    }
  `]
})
export class OAuthCallbackComponent implements OnInit {
  error: string | null = null;
  status: string = 'Iniciando...';
  debugInfo: any = {};

  constructor(
    private route: ActivatedRoute,
    private oauthService: OAuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    // Obtener parámetros de la URL
    const code = this.route.snapshot.queryParams['code'];
    const state = this.route.snapshot.queryParams['state'];
    const error = this.route.snapshot.queryParams['error'];
    const errorDescription = this.route.snapshot.queryParams['error_description'];

    this.debugInfo = {
      code: code,
      state: state,
      url: window.location.href,
      error: error,
      errorDescription: errorDescription
    };


    // Verificar si hay error en la URL
    if (error) {
      this.error = `Error de autorización: ${error}${errorDescription ? ' - ' + errorDescription : ''}`;
      this.status = 'Error de autorización';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    if (!code || !state) {
      this.error = 'Faltan parámetros de autenticación.';
      this.status = 'Error: Faltan parámetros';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    try {
      this.status = 'Procesando autenticación...';


      // Verificar estado antes del callback
      console.log('🔍 Estado antes del callback:', {
        isAuthenticated: this.oauthService.isAuthenticated(),
        hasToken: this.oauthService.hasValidToken(),
        currentUser: this.oauthService.getCurrentUser()
      });

      await this.oauthService.handleCallback(code, state);
      await this.oauthService.loadUserInfo();

      this.status = 'Autenticación exitosa, navegando...';

      // Verificar token después del callback
      const token = this.oauthService.getToken();
      console.log('🎫 Token después del callback:', token ? 'Presente' : 'Ausente');

      // Esperar un poco más para asegurar que el estado se propague
      setTimeout(() => {
        console.log('📍 URL actual:', window.location.href);
        this.router.navigate(['/dashboard']);
      }, 500);
    } catch (e: any) {
      this.error = e?.message || 'Error en la autenticación.';
      this.status = 'Error en autenticación';
      setTimeout(() => this.router.navigate(['/auth/login']), 4000);
    }
  }

  reintentar() {
    this.router.navigate(['/auth/login']);
  }
}
