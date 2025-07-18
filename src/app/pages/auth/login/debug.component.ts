import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuthService } from '../../service/oauth.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-debug',
  template: `
    <div class="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 class="font-bold text-lg mb-2">🔍 Debug OAuth</h3>
      
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span>Estado:</span>
          <span [class]="debugState.isAuthenticated ? 'text-green-600' : 'text-red-600'">
            {{ debugState.isAuthenticated ? '✅ Autenticado' : '❌ No autenticado' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span>Token:</span>
          <span [class]="debugState.hasToken ? 'text-green-600' : 'text-red-600'">
            {{ debugState.hasToken ? '✅ Presente' : '❌ Ausente' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span>Usuario:</span>
          <span [class]="debugState.hasUser ? 'text-green-600' : 'text-red-600'">
            {{ debugState.hasUser ? '✅ Cargado' : '❌ No cargado' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span>Loading:</span>
          <span [class]="debugState.isLoading ? 'text-yellow-600' : 'text-gray-600'">
            {{ debugState.isLoading ? '⏳ Cargando' : '✅ Listo' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span>Error:</span>
          <span [class]="debugState.error ? 'text-red-600' : 'text-gray-600'">
            {{ debugState.error || '✅ Sin errores' }}
          </span>
        </div>
        
        <div class="flex justify-between">
          <span>URL Actual:</span>
          <span class="text-xs text-gray-500">
            {{ debugState.currentUrl }}
          </span>
        </div>
      </div>
      
      <div class="mt-3 pt-3 border-t">
        <button 
          (click)="refreshDebug()" 
          class="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2">
          🔄 Refresh
        </button>
        <button 
          (click)="clearStorage()" 
          class="bg-red-500 text-white px-2 py-1 rounded text-xs">
          🗑️ Clear
        </button>
        <button 
          (click)="testOAuth()" 
          class="bg-green-500 text-white px-2 py-1 rounded text-xs ml-2">
          🧪 Test OAuth
        </button>
      </div>
      
      <div class="mt-2 text-xs text-gray-500">
        <div>Token: {{ debugState.tokenPreview }}</div>
        <div>User: {{ debugState.userPreview }}</div>
        <div>State: {{ debugState.oauthState }}</div>
      </div>
    </div>
  `
})
export class DebugComponent implements OnInit, OnDestroy {
  debugState = {
    isAuthenticated: false,
    hasToken: false,
    hasUser: false,
    isLoading: false,
    error: null,
    tokenPreview: '',
    userPreview: '',
    currentUrl: '',
    oauthState: ''
  };
  
  private subscription: Subscription = new Subscription();

  constructor(private oauthService: OAuthService) {}

  ngOnInit(): void {
    console.log('🔧 DebugComponent inicializado');
    
    // Suscribirse a cambios en el estado de autenticación
    this.subscription.add(
      this.oauthService.authState$.subscribe(state => {
        this.updateDebugState();
      })
    );
    
    // Actualizar estado inicial
    this.updateDebugState();
    
    // Actualizar URL cada segundo
    setInterval(() => {
      this.updateDebugState();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  updateDebugState(): void {
    const token = this.oauthService.getToken();
    const user = this.oauthService.getCurrentUser();
    const oauthState = localStorage.getItem('oauth_state');
    
    this.debugState = {
      isAuthenticated: this.oauthService.isAuthenticated(),
      hasToken: this.oauthService.hasValidToken(),
      hasUser: !!user,
      isLoading: false, // TODO: suscribirse a isLoading$
      error: null, // TODO: suscribirse a error$
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
      userPreview: user ? `${user.nombre} ${user.apellido_paterno}` : 'No user',
      currentUrl: window.location.href,
      oauthState: oauthState ? 'Presente' : 'Ausente'
    };
    
    console.log('🔍 Debug state actualizado:', this.debugState);
  }

  refreshDebug(): void {
    console.log('🔄 Refrescando debug...');
    this.updateDebugState();
  }

  clearStorage(): void {
    console.log('🗑️ Limpiando localStorage...');
    localStorage.clear();
    this.updateDebugState();
    window.location.reload();
  }

  testOAuth(): void {
    console.log('🧪 Iniciando test OAuth...');
    this.oauthService.login();
  }
} 