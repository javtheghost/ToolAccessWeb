import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, firstValueFrom } from 'rxjs';
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
  public logoutLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    console.log('🔧 OAuthService inicializado');
    console.log('[DEBUG] localStorage al inicializar:', {
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token')
    });
    // this.initializeAuthState(); // Eliminado para evitar dependencia circular
  }

  // Método público para inicializar el estado de autenticación manualmente
  public async initAuthState(): Promise<void> {
    await this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    console.log('🔄 Inicializando estado de autenticación...');
    console.log('[DEBUG] localStorage al iniciar initializeAuthState:', {
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token')
    });
    this.setLoading(true);
    try {
      const token = this.getStoredToken();
      const refreshToken = this.getStoredRefreshToken();
      console.log(' Tokens encontrados:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken
      });
      console.log('[DEBUG] Token recuperado en initializeAuthState:', token);
      if (token) {
        console.log(' Token encontrado, actualizando estado...');
        this.updateAuthState({ token, refreshToken, isAuthenticated: true });
        await this.loadUserInfo();
      } else {
        console.log(' No hay token almacenado');
      }
    } catch (error) {
      console.error(' Error inicializando estado:', error);
      this.clearAuthState();
    } finally {
      this.setLoading(false);
      console.log('🏁 Inicialización completada');
      console.log('[DEBUG] localStorage al finalizar initializeAuthState:', {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token')
      });
    }
  }

  login(): void {
    console.log(' Iniciando login OAuth...');
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
    console.log(' URL de autorización:', authUrl);

    window.location.href = authUrl;
  }

  async handleCallback(code: string, state: string): Promise<TokenResponse> {
    console.log(' handleCallback iniciado');
    console.log(' Parámetros recibidos:', { code, state });
    this.setLoading(true);

    try {
      const savedState = localStorage.getItem('oauth_state');
      console.log(' Estado guardado:', savedState);
      console.log(' Estado recibido:', state);

      if (state !== savedState) {
        console.error('❌ Estados no coinciden - posible ataque CSRF');
        throw new Error('Estado OAuth inválido - posible ataque CSRF');
      }

      console.log(' Estado válido, intercambiando código por token...');
      const tokenData = await this.exchangeCodeForToken(code);
      console.log('🎫 Token obtenido:', !!tokenData.access_token);

      this.storeTokens(tokenData);
      console.log(' Tokens guardados en localStorage');

      this.updateAuthState({
        token: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        isAuthenticated: true
      });
      console.log(' Estado actualizado con isAuthenticated = true');

      // await this.loadUserInfo(); // Eliminado para evitar ciclo de dependencias
      this.cleanupOAuthState();
      console.log(' Callback completado exitosamente');
      return tokenData;
    } catch (error) {
      console.error(' Error en handleCallback:', error);
      this.setError('Error en callback OAuth: ' + this.getErrorMessage(error));
      this.clearAuthState();
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    console.log(' Intercambiando código por token...');
    console.log(' URL del token:', this.config.tokenUrl);

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('client_id', this.config.clientId)
      .set('client_secret', this.config.clientSecret)
      .set('redirect_uri', this.config.redirectUri);

    console.log(' Body de la petición:', body.toString());

    try {
      console.log(' Enviando petición POST a:', this.config.tokenUrl);
      const response = await firstValueFrom(
        this.http.post<any>(
          this.config.tokenUrl,
          body,
          { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
        )
      );

      console.log(' Respuesta completa del servidor:', response);
      console.log(' Tipo de respuesta:', typeof response);
      console.log(' Keys de respuesta:', Object.keys(response || {}));

      // Manejar respuesta wrapped del backend
      let tokenData: TokenResponse;
      if (response && response.data) {
        console.log(' Respuesta wrapped detectada');
        tokenData = response.data;
      } else if (response && response.access_token) {
        console.log(' Respuesta directa detectada');
        tokenData = response;
      } else {
        console.error('❌ Formato de respuesta inválido:', response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      console.log(' Token extraído:', !!tokenData.access_token);
      console.log(' Token completo:', tokenData);

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

  public async loadUserInfo(): Promise<User | null> {
    try {
      const token = this.getStoredToken();
      console.log('[DEBUG] localStorage al iniciar loadUserInfo:', {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token')
      });
      if (!token) throw new Error('No hay token');

      console.log('Cargando información del usuario desde: /api/auth/profile');

      const response = await firstValueFrom(
        this.http.get<ApiResponse<User>>(
          'http://localhost:3000/api/auth/profile',
          { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) }
        )
      );

      console.log('Usuario cargado:', response);

      // Extraer el usuario del ApiResponse<User>
      const usuario: User | undefined = response?.data ?? response as any as User;

      if (!usuario) {
        throw new Error('No se pudo obtener la información del usuario del servidor');
      }

      this.updateAuthState({ user: usuario });
      console.log('[DEBUG] localStorage tras cargar usuario:', {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token')
      });
      return usuario;
    } catch (error: any) {
      console.error('Error cargando usuario:', error);
      console.log('[DEBUG] localStorage tras error en loadUserInfo:', {
        access_token: localStorage.getItem('access_token'),
        refresh_token: localStorage.getItem('refresh_token')
      });
      if (error?.status === 401) {
        console.warn('Recibido 401 al cargar usuario. Intentando refresh de token...');
        try {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            console.log('Token refrescado exitosamente. Reintentando cargar usuario...');
            return await this.loadUserInfo();
          } else {
            console.error('No se pudo refrescar el token. Limpiando estado y redirigiendo.');
            this.clearAuthState();
            this.router.navigate(['/error', '401'], { queryParams: { message: this.getErrorMessage(error) } });
          }
        } catch (refreshError) {
          console.error('Error al refrescar token tras 401:', refreshError);
          this.clearAuthState();
          this.router.navigate(['/error', '401'], { queryParams: { message: this.getErrorMessage(refreshError) } });
        }
      } else {
        throw new Error('Error cargando usuario: ' + this.getErrorMessage(error));
      }
    }
    return null;
  }

  async refreshToken(): Promise<TokenResponse | null> {
    console.log('🔄 Intentando renovar token...');
    // El refresh token ya no está disponible en el frontend
    // Si el backend lo maneja por cookie HttpOnly, simplemente haz la petición sin enviarlo
    // const refreshToken = this.getStoredRefreshToken();
    // if (!refreshToken) {
    //   console.log(' No hay refresh token');
    //   this.logout();
    //   return null;
    // }
    try {
      // Aquí deberías hacer la petición al backend, que debe leer el refresh token de la cookie
      const body = new HttpParams()
        .set('grant_type', 'refresh_token')
        .set('client_id', this.config.clientId)
        .set('client_secret', this.config.clientSecret);

      console.log(' Enviando petición de refresh a:', this.config.tokenUrl);
      const response = await firstValueFrom(
        this.http.post<any>(
          this.config.tokenUrl,
          body,
          { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }), withCredentials: true }
        )
      );

      console.log(' Respuesta de refresh:', response);

      let tokenData: TokenResponse;
      if (response && response.data) {
        console.log(' Respuesta wrapped detectada en refresh');
        tokenData = response.data;
      } else if (response && response.access_token) {
        console.log(' Respuesta directa detectada en refresh');
        tokenData = response;
      } else {
        console.error(' Formato de respuesta inválido en refresh:', response);
        throw new Error('Formato de respuesta inválido del servidor');
      }

      if (tokenData && tokenData.access_token) {
        this.storeTokens(tokenData);
        this.updateAuthState({
          token: tokenData.access_token,
          refreshToken: null // Ya no se maneja en frontend
        });
        console.log(' Token renovado exitosamente');
        console.log('[DEBUG] sessionStorage tras refreshToken exitoso:', {
          access_token: sessionStorage.getItem('access_token')
        });
        return tokenData;
      }
      throw new Error('Error renovando token');
    } catch (error) {
      console.error(' Error renovando token:', error);
      console.log('[DEBUG] sessionStorage tras error en refreshToken:', {
        access_token: sessionStorage.getItem('access_token')
      });
      this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 Iniciando logout...');
    this.logoutLoading$.next(true);
    try {
      const token = this.getStoredToken();
      if (token) {
        console.log('🔄 Revocando token en el servidor...');
        await firstValueFrom(
          this.http.post(
            `${this.config.baseUrl}/oauth/revoke`,
            { token: token, client_id: this.config.clientId }
          )
        ).catch(() => {});
      }
    } catch (error) {
      console.error('💥 Error en logout:', error);
    } finally {
      this.clearAuthState();
      this.logoutLoading$.next(false);
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
    console.log('[DEBUG] localStorage en getToken:', {
      access_token: localStorage.getItem('access_token'),
      refresh_token: localStorage.getItem('refresh_token')
    });
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
    console.log('[DEBUG] sessionStorage antes de limpiar:', {
      access_token: sessionStorage.getItem('access_token')
    });
    sessionStorage.removeItem('access_token');
    // sessionStorage.removeItem('refresh_token'); // Ya no se usa
    this.cleanupOAuthState();
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null
    });
    console.log('[DEBUG] sessionStorage después de limpiar:', {
      access_token: sessionStorage.getItem('access_token')
    });
  }

  private cleanupOAuthState(): void {
    console.log('🧹 Limpiando estado OAuth...');
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_nonce');
  }

  private storeTokens(tokenData: TokenResponse): void {
    console.log('💾 Guardando access token en sessionStorage...');
    sessionStorage.setItem('access_token', tokenData.access_token);
    // ADVERTENCIA: No guardar refresh token en el frontend por seguridad
    // Si el backend lo maneja por cookie HttpOnly, no es necesario almacenarlo aquí
    // if (tokenData.refresh_token) {
    //   sessionStorage.setItem('refresh_token', tokenData.refresh_token);
    // }
  }

  private getStoredToken(): string | null {
    return sessionStorage.getItem('access_token');
  }

  private getStoredRefreshToken(): string | null {
    // Ya no se almacena el refresh token en el frontend
    // Si el backend lo maneja por cookie HttpOnly, este método puede retornar null
    return null;
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
