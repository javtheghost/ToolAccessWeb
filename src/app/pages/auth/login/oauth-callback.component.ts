import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from '../../service/oauth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-oauth-callback',
  template: `
    <div class="flex flex-col items-center justify-center h-screen">
      <h2>Procesando autenticación...</h2>
      <p *ngIf="error" class="text-red-600">{{ error }}</p>
      <p>Status: {{ status }}</p>
      <div class="mt-4 p-4 bg-gray-100 rounded">
        <p><strong>Debug Info:</strong></p>
        <p>Code: {{ debugInfo.code ? 'Presente' : 'Ausente' }}</p>
        <p>State: {{ debugInfo.state ? 'Presente' : 'Ausente' }}</p>
        <p>URL: {{ debugInfo.url }}</p>
      </div>
    </div>
  `
})
export class OAuthCallbackComponent implements OnInit {
  error: string | null = null;
  status: string = 'Iniciando...';
  debugInfo: any = {};

  constructor(
    private route: ActivatedRoute,
    private oauthService: OAuthService,
    private router: Router
  ) {
    console.log('🔧 OAuthCallbackComponent constructor ejecutado');
  }

  async ngOnInit(): Promise<void> {
    console.log('🚀 OAuth Callback ngOnInit iniciado');
    this.status = 'Callback iniciado';
    
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
    
    console.log('📋 Parámetros de URL:', {
      code: code ? 'Presente' : 'Ausente',
      state: state ? 'Presente' : 'Ausente',
      error: error,
      errorDescription: errorDescription,
      fullUrl: window.location.href
    });
    
    // Verificar si hay error en la URL
    if (error) {
      console.error('❌ Error en URL de callback:', error, errorDescription);
      this.error = `Error de autorización: ${error}${errorDescription ? ' - ' + errorDescription : ''}`;
      this.status = 'Error de autorización';
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }
    
    if (!code || !state) {
      this.error = 'Faltan parámetros de autenticación.';
      this.status = 'Error: Faltan parámetros';
      console.error('❌ Faltan parámetros:', { code, state });
      console.error('❌ URL completa:', window.location.href);
      console.error('❌ Query params:', this.route.snapshot.queryParams);
      setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      return;
    }

    try {
      this.status = 'Procesando autenticación...';
      console.log('✅ Iniciando handleCallback...');
      
      // Verificar estado antes del callback
      console.log('🔍 Estado antes del callback:', {
        isAuthenticated: this.oauthService.isAuthenticated(),
        hasToken: this.oauthService.hasValidToken(),
        currentUser: this.oauthService.getCurrentUser()
      });
      
      await this.oauthService.handleCallback(code, state);
      
      this.status = 'Autenticación exitosa, navegando...';
      console.log('🎉 Callback exitoso, navegando a dashboard...');
      
      // Verificar estado después del callback
      console.log('🔍 Estado después del callback:', {
        isAuthenticated: this.oauthService.isAuthenticated(),
        hasToken: this.oauthService.hasValidToken(),
        currentUser: this.oauthService.getCurrentUser()
      });
      
      // Verificar token después del callback
      const token = this.oauthService.getToken();
      console.log('🎫 Token después del callback:', token ? 'Presente' : 'Ausente');
      
      // Esperar un poco más para asegurar que el estado se propague
      setTimeout(() => {
        console.log('🔄 Navegando a dashboard...');
        console.log('📍 URL actual:', window.location.href);
        this.router.navigate(['/dashboard']);
        console.log('🔄 Navegación iniciada...');
      }, 500);
    } catch (e: any) {
      console.error('💥 Error en callback:', e);
      this.error = e?.message || 'Error en la autenticación.';
      this.status = 'Error en autenticación';
      setTimeout(() => this.router.navigate(['/auth/login']), 4000);
    }
  }
} 