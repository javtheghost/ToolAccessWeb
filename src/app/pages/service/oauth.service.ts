import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OAuthConfig, TokenResponse, User, OAuthState, ApiResponse } from '../../interfaces/oauth.interfaces';

export const OAUTH_CONFIG: OAuthConfig = {
  clientId: 'web-app-angular',
  clientSecret: 'angular-secret-key-2025',
  redirectUri: 'http://localhost:4200/oauth/callback',
  baseUrl: 'http://localhost:3000',
  authUrl: 'http://localhost:3000/oauth/authorize',
  tokenUrl: 'http://localhost:3000/oauth/token',
  userinfoUrl: 'http://localhost:3000/oauth/userinfo',
  unifiedApiUrl: 'http://localhost:3000/api/unified'
};

@Injectable({ providedIn: 'root' })
export class OAuthService {
  private config = OAUTH_CONFIG;

  private authStateSubject = new BehaviorSubject<OAuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null
  });
  public authState$ = this.authStateSubject.asObservable();
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  public user$ = this.authState$.pipe(map(state => state.user));
  public isLoading$ = this.authState$.pipe(map(state => state.isLoading));

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔧 OAuthService inicializado');
    this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    console.log('🔄 Inicializando estado de autenticación...');
    this.setLoading(true);
    try {
      const token = this.getStoredToken();
      const refreshToken = this.getStoredRefreshToken();
      console.log('🔍 Tokens encontrados:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken
      });

      if (token) {
        console.log('✅ Token encontrado, actualizando estado...');
        this.updateAuthState({ token, refreshToken, isAuthenticated: true });
        await this.loadUserInfo();
      } else {
        console.log('❌ No hay token almacenado');
      }
    } catch (error) {
      console.error('💥 Error inicializando estado:', error);
      this.clearAuthState();
    } finally {
      this.setLoading(false);
      console.log('🏁 Inicialización completada');
    }
  }

  login(): void {
    console.log('🚀 Iniciando login OAuth...');
    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);

    console.log('🔐 Generando state y nonce:', { state, nonce });

    localStorage.setItem('oauth_state', state);
    localStorage.setItem('oauth_nonce', nonce);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'openid profile email',
      state,
      nonce
    });

    const authUrl = `${this.config.authUrl}?${params.toString()}`;
    console.log('🌐 URL de autorización:', authUrl);

    window.location.href = authUrl;
  }

  async handleCallback(code: string, state: string): Promise<TokenResponse> {
    console.log('🚀 handleCallback iniciado');
    console.log('📋 Parámetros recibidos:', { code, state });
    this.setLoading(true);

    try {
      const savedState = localStorage.getItem('oauth_state');
      console.log('🔐 Estado guardado:', savedState);
      console.log('📋 Estado recibido:', state);

      if (state !== savedState) {
        console.error('❌ Estados no coinciden - posible ataque CSRF');
        throw new Error('Estado OAuth inválido - posible ataque CSRF');
      }

      console.log('✅ Estado válido, intercambiando código por token...');
      const tokenData = await this.exchangeCodeForToken(code);
      console.log('🎫 Token obtenido:', !!tokenData.access_token);

      this.storeTokens(tokenData);
      console.log('💾 Tokens guardados en localStorage');

      this.updateAuthState({
        token: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        isAuthenticated: true
      });
      console.log('✅ Estado actualizado con isAuthenticated = true');

      await this.loadUserInfo();
      this.cleanupOAuthState();
      console.log('🎉 Callback completado exitosamente');
      return tokenData;
    } catch (error) {
      console.error('💥 Error en handleCallback:', error);
      this.setError('Error en callback OAuth: ' + this.getErrorMessage(error));
      this.clearAuthState();
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    console.log('🔄 Intercambiando código por token...');
    console.log('📡 URL del token:', this.config.tokenUrl);

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('client_id', this.config.clientId)
      .set('client_secret', this.config.clientSecret)
      .set('redirect_uri', this.config.redirectUri);

    console.log('📦 Body de la petición:', body.toString());

    try {
      console.log('📤 Enviando petición POST a:', this.config.tokenUrl);
      const response = await this.http.post<any>(
        this.config.tokenUrl,
        body,
        { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
      ).toPromise();

      console.log('📦 Respuesta completa del servidor:', response);
      console.log('📊 Tipo de respuesta:', typeof response);
      console.log('📋 Keys de respuesta:', Object.keys(response || {}));

      // Manejar respuesta wrapped del backend
      let tokenData: TokenResponse;
      if (response && response.data) {
        console.log('✅ Respuesta wrapped detectada');
        tokenData = response.data;
      } else if (response && response.access_token) {
        console.log('✅ Respuesta directa detectada');
        tokenData = response;
      } else {
        console.error('❌ Formato de respuesta inválido:', response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      console.log('🎫 Token extraído:', !!tokenData.access_token);
      console.log('🔑 Token completo:', tokenData);

      if (tokenData && tokenData.access_token) {
        return tokenData;
      }
      throw new Error('Error obteniendo tokens');
    } catch (error) {
      console.error('💥 Error en intercambio de token:', error);
      console.error('📊 Detalles del error:', {
        status: (error as any)?.status,
        message: (error as any)?.message,
        error: (error as any)?.error,
        statusText: (error as any)?.statusText
      });
      throw new Error('Error en intercambio de token: ' + this.getErrorMessage(error));
    }
  }

  private async loadUserInfo(): Promise<User> {
    try {
      const token = this.getStoredToken();
      if (!token) throw new Error('No hay token');

      console.log('👤 Cargando información del usuario desde:', this.config.userinfoUrl);

      const response = await this.http.get<any>(
        this.config.userinfoUrl,
        { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) }
      ).toPromise();

      console.log('📦 Respuesta userinfo:', response);

      // El endpoint /oauth/userinfo devuelve datos directamente, no wrapped
      if (response && response.sub) {
        // Convertir respuesta OAuth userinfo a formato User
        const user: User = {
          id: parseInt(response.sub),
          email: response.email,
          nombre: response.given_name || response.name?.split(' ')[0] || '',
          apellido_paterno: response.family_name || response.name?.split(' ')[1] || '',
          apellido_materno: response.name?.split(' ')[2] || '',
          telefono: undefined,
          estado: true,
          rol: {
            id: 2, // Por defecto
            nombre: 'Usuario',
            descripcion: 'Usuario estándar'
          },
          token_source: 'oauth',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('👤 Usuario cargado:', user);
        this.updateAuthState({ user });
        return user;
      }

      throw new Error('Formato de respuesta inválido del userinfo');
    } catch (error) {
      console.error('💥 Error cargando usuario:', error);
      throw new Error('Error cargando usuario: ' + this.getErrorMessage(error));
    }
  }

  async refreshToken(): Promise<TokenResponse | null> {
    console.log('🔄 Intentando renovar token...');
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      console.log(' No hay refresh token');
      this.logout();
      return null;
    }
    try {
      const body = new HttpParams()
        .set('grant_type', 'refresh_token')
        .set('refresh_token', refreshToken)
        .set('client_id', this.config.clientId)
        .set('client_secret', this.config.clientSecret);

      console.log('📤 Enviando petición de refresh a:', this.config.tokenUrl);
      const response = await this.http.post<any>(
        this.config.tokenUrl,
        body,
        { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
      ).toPromise();

      console.log('📦 Respuesta de refresh:', response);

      // Manejar respuesta wrapped del backend
      let tokenData: TokenResponse;
      if (response && response.data) {
        console.log('✅ Respuesta wrapped detectada en refresh');
        tokenData = response.data;
      } else if (response && response.access_token) {
        console.log('✅ Respuesta directa detectada en refresh');
        tokenData = response;
      } else {
        console.error('❌ Formato de respuesta inválido en refresh:', response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      if (tokenData && tokenData.access_token) {
        this.storeTokens(tokenData);
        this.updateAuthState({
          token: tokenData.access_token,
          refreshToken: tokenData.refresh_token
        });
        console.log('✅ Token renovado exitosamente');
        return tokenData;
      }
      throw new Error('Error renovando token');
    } catch (error) {
      console.error('💥 Error renovando token:', error);
      this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Iniciando logout...');
    try {
      const token = this.getStoredToken();
      if (token) {
        console.log('🔄 Revocando token en el servidor...');
        await this.http.post(
          `${this.config.baseUrl}/oauth/revoke`,
          { token: token, client_id: this.config.clientId }
        ).toPromise().catch(() => {});
      }
    } catch (error) {
      console.error('💥 Error en logout:', error);
    } finally {
      this.clearAuthState();
      console.log('🔄 Navegando a login...');
      this.router.navigate(['/login']);
    }
  }

  /**
   * ✅ VERIFICAR SI ESTÁ AUTENTICADO (versión mejorada)
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.getStoredToken();
    const stateAuth = this.authStateSubject.value.isAuthenticated;
    const hasUser = !!this.authStateSubject.value.user;

    // Considerar autenticado si tiene token Y (estado autenticado O usuario cargado)
    const isAuth = hasToken && (stateAuth || hasUser);

    console.log('🔍 isAuthenticated() llamado:', {
      hasToken,
      stateAuth,
      hasUser,
      isAuth
    });

    return isAuth;
  }

  /**
   * 🔍 VERIFICAR SI TIENE TOKEN VÁLIDO
   */
  hasValidToken(): boolean {
    const token = this.getStoredToken();
    const hasToken = !!token;
    console.log('🔍 hasValidToken() llamado:', { hasToken });
    return hasToken;
  }

  getToken(): string | null {
    const token = this.getStoredToken();
    console.log('🎫 getToken() llamado:', token ? 'Token presente' : 'Sin token');
    return token;
  }

  getCurrentUser(): User | null {
    const user = this.authStateSubject.value.user;
    console.log('👤 getCurrentUser() llamado:', user ? 'Usuario presente' : 'Sin usuario');
    return user;
  }

  // Métodos privados de utilidad
  private updateAuthState(updates: Partial<OAuthState>): void {
    const current = this.authStateSubject.value;
    const newState = {
      ...current,
      ...updates,
      error: null
    };
    console.log('🔄 Actualizando estado de autenticación:', updates);
    this.authStateSubject.next(newState);
  }

  private setLoading(loading: boolean): void {
    console.log('⏳ setLoading:', loading);
    this.updateAuthState({ isLoading: loading });
  }

  private setError(error: string): void {
    console.error('❌ setError:', error);
    this.updateAuthState({ error, isLoading: false });
  }

  private clearAuthState(): void {
    console.log('🧹 Limpiando estado de autenticación...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.cleanupOAuthState();
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null
    });
  }

  private cleanupOAuthState(): void {
    console.log('🧹 Limpiando estado OAuth...');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_nonce');
  }

  private storeTokens(tokenData: TokenResponse): void {
    console.log('💾 Guardando tokens en localStorage...');
    localStorage.setItem('access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Error desconocido';
  }
}
