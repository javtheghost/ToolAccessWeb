import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of, firstValueFrom } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OAuthConfig, TokenResponse, User, OAuthState, ApiResponse } from '../../interfaces/oauth.interfaces';
import { environment } from '../../../environments/environment';

/**
 * Configuración global para OAuth2 utilizada por el servicio.
 * @type {OAuthConfig}
 */
export const OAUTH_CONFIG: OAuthConfig = {
  clientId: environment.api.clientId,
  clientSecret: environment.api.clientSecret,
  redirectUri: environment.api.redirectUri,
  baseUrl: environment.api.baseUrl,
  authUrl: environment.api.authUrl,
  tokenUrl: environment.api.tokenUrl,
  userinfoUrl: environment.api.userinfoUrl,
  unifiedApiUrl: environment.api.unifiedApiUrl
};

/**
 * Servicio para gestionar la autenticación OAuth2 y el estado de usuario en la aplicación Angular.
 *
 * Responsabilidades principales:
 * - Iniciar el flujo de autenticación OAuth2 (login).
 * - Manejar el callback de OAuth2 e intercambiar el código por tokens.
 * - Almacenar y recuperar tokens de acceso y refresh.
 * - Cargar la información del usuario autenticado desde el backend.
 * - Gestionar el estado de autenticación y usuario en memoria.
 * - Proveer métodos para cerrar sesión y refrescar tokens.
 *
 * Uso recomendado:
 * - Inyectar este servicio en componentes o guards que requieran lógica de autenticación.
 * - No mostrar mensajes de UI directamente desde el servicio; solo propagar datos o errores.
 * - Los componentes deben mostrar los mensajes al usuario según el resultado de las operaciones.
 *
 *
 */
@Injectable({ providedIn: 'root' })
export class OAuthService {
  /** Configuración OAuth utilizada por el servicio */
  private config = OAUTH_CONFIG;

  /**
   * Estado de autenticación y usuario, gestionado como BehaviorSubject para reactividad.
   * @private
   */
  private authStateSubject = new BehaviorSubject<OAuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null
  });

  /** Observable del estado de autenticación completo */
  public authState$ = this.authStateSubject.asObservable();
  /** Observable que indica si el usuario está autenticado */
  public isAuthenticated$ = this.authState$.pipe(map(state => state.isAuthenticated));
  /** Observable del usuario autenticado */
  public user$ = this.authState$.pipe(map(state => state.user));
  /** Observable que indica si hay una operación de autenticación en curso */
  public isLoading$ = this.authState$.pipe(map(state => state.isLoading));
  /** Observable para indicar si el logout está en proceso */
  public logoutLoading$ = new BehaviorSubject<boolean>(false);

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP Angular para peticiones a la API.
   * @param router Router Angular para navegación programática.
   */
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Inicializa el estado de autenticación manualmente, útil al arrancar la app.
   * @returns {Promise<void>}
   */
  public async initAuthState(): Promise<void> {
    await this.initializeAuthState();
  }

  /**
   * Inicializa el estado de autenticación verificando tokens almacenados y cargando usuario si aplica.
   * @private
   * @returns {Promise<void>}
   */
  private async initializeAuthState(): Promise<void> {
    this.setLoading(true);
    try {
      const token = this.getStoredToken();
      const refreshToken = this.getStoredRefreshToken();
      if (token) {
        this.updateAuthState({ token, refreshToken, isAuthenticated: true });
        await this.loadUserInfo();
      }
    } catch (error) {
      this.clearAuthState();
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Inicia el flujo de autenticación OAuth2 redirigiendo al usuario al proveedor de autorización.
   * @returns {void}
   */
  login(): void {
    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);
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
    window.location.href = authUrl;
  }

  /**
   * Maneja el callback de OAuth2, intercambia el código por tokens y actualiza el estado de autenticación.
   * @param code Código de autorización recibido del proveedor OAuth2.
   * @param state Valor de estado recibido para prevenir CSRF.
   * @returns {Promise<TokenResponse>} Respuesta con los tokens de acceso y refresh.
   * @throws {Error} Si ocurre un error en el proceso o el backend responde con error.
   */
  async handleCallback(code: string, state: string): Promise<TokenResponse> {
    this.setLoading(true);
    try {
      const savedState = localStorage.getItem('oauth_state');
      if (state !== savedState) {
        throw new Error('Error de autenticación. Por favor, intenta nuevamente.');
      }
      const tokenData = await this.exchangeCodeForToken(code);
      this.storeTokens(tokenData);
      this.updateAuthState({
        token: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        isAuthenticated: true
      });
      await this.loadUserInfo();
      this.cleanupOAuthState();
      return tokenData;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      this.setError('Error en callback OAuth: ' + errorMessage);
      this.clearAuthState();
      throw new Error('No se pudo completar la autenticación. Intenta de nuevo.');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Intercambia el código de autorización por tokens de acceso y refresh.
   * @private
   * @param code Código de autorización recibido del proveedor OAuth2.
   * @returns {Promise<TokenResponse>} Respuesta con los tokens.
   * @throws {Error} Si ocurre un error en el proceso o el backend responde con error.
   */
  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('client_id', this.config.clientId)
      .set('client_secret', this.config.clientSecret)
      .set('redirect_uri', this.config.redirectUri);
    try {
      const response = await firstValueFrom(
        this.http.post<any>(
          this.config.tokenUrl,
          body,
          { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) }
        )
      );
      let tokenData: TokenResponse;
      if (response && response.data) {
        tokenData = response.data;
      } else if (response && response.access_token) {
        tokenData = response;
      } else {
        throw new Error('No se pudo completar la autenticación. Intenta de nuevo.');
      }
      if (tokenData && tokenData.access_token) {
        return tokenData;
      }
      throw new Error('No se pudo completar la autenticación. Intenta de nuevo.');
    } catch (error) {
      throw new Error('No se pudo completar la autenticación. Intenta de nuevo.');
    }
  }

  /**
   * Carga la información del usuario autenticado desde el backend y actualiza el estado.
   * @returns {Promise<User | null>} Usuario autenticado o null si no se pudo cargar.
   * @throws {Error} Si ocurre un error al cargar el usuario.
   */
  public async loadUserInfo(): Promise<User | null> {
    try {
      const token = this.getStoredToken();
      if (!token) throw new Error('No se pudo obtener la información del usuario. Intenta de nuevo.');
      const response = await firstValueFrom(
        this.http.get<ApiResponse<User>>(
          environment.api.profileUrl,
          { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) }
        )
      );
      const usuario: User | undefined = response?.data ?? response as any as User;
      if (!usuario) {
        throw new Error('No se pudo obtener la información del usuario. Intenta de nuevo.');
      }
      this.updateAuthState({ user: usuario });
      return usuario;
    } catch (error: any) {
      if (error?.status === 401) {
        try {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            return await this.loadUserInfo();
          } else {
            this.clearAuthState();
            this.router.navigate(['/error', '401'], { queryParams: { message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' } });
          }
        } catch (refreshError) {
          this.clearAuthState();
          this.router.navigate(['/error', '401'], { queryParams: { message: 'Sesión expirada. Por favor, inicia sesión nuevamente.' } });
        }
      } else {
        throw new Error('No se pudo obtener la información del usuario. Intenta de nuevo.');
      }
    }
    return null;
  }

  /**
   * Refresca el token de acceso usando el endpoint de refresh del backend.
   * @returns {Promise<TokenResponse | null>} Nuevo token o null si no se pudo refrescar.
   */
  async refreshToken(): Promise<TokenResponse | null> {
    try {
      const expiredToken = this.getToken();
      if (!expiredToken) {
        this.logout();
        return null;
      }
      const response = await firstValueFrom(
        this.http.post<any>(
          environment.api.refreshUrl,
          {},
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${expiredToken}`
            }),
            withCredentials: true
          }
        )
      );
      const accessToken = response.data?.access_token;
      if (!accessToken) {
        throw new Error('No se pudo renovar la sesión. Intenta de nuevo.');
      }
      let tokenData: TokenResponse = {
        access_token: accessToken,
        token_type: response.data?.token_type || 'Bearer',
        expires_in: response.data?.expires_in || 3600,
        refresh_token: response.data?.refresh_token || null,
        scope: response.data?.scope || null
      };
      if (tokenData && tokenData.access_token) {
        this.storeTokens(tokenData);
        this.updateAuthState({
          token: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
        });
        return tokenData;
      }
      throw new Error('No se pudo renovar la sesión. Intenta de nuevo.');
    } catch (error) {
      this.logout();
      return null;
    }
  }

  /**
   * Cierra la sesión del usuario, revoca el token en el backend y limpia el estado local.
   * @param redirectToLogin Si es true, redirige al login tras cerrar sesión (por defecto true).
   * @returns {Promise<void>}
   */
  async logout(redirectToLogin: boolean = true): Promise<void> {
    this.logoutLoading$.next(true);
    try {
      const token = this.getStoredToken();
      if (token) {
        await firstValueFrom(
          this.http.post(
            environment.api.revokeUrl,
            { token: token, client_id: this.config.clientId }
          )
        ).catch(() => {});
      }
    } catch (error) {
      // Error al revocar token, continuar con logout local
    } finally {
      this.clearAuthState();
      this.logoutLoading$.next(false);
      if (redirectToLogin) {
        this.router.navigate(['/auth/login']);
      }
    }
  }

  /**
   * Verifica si el usuario está autenticado en la aplicación.
   *
   * Un usuario se considera autenticado si:
   *  - Existe un token de acceso válido en el almacenamiento local.
   *  - El estado de autenticación es verdadero o hay un usuario cargado en memoria.
   *
   * @returns {boolean} true si el usuario está autenticado, false en caso contrario.
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.getStoredToken();
    const stateAuth = this.authStateSubject.value.isAuthenticated;
    const hasUser = !!this.authStateSubject.value.user;
    const isAuth = hasToken && (stateAuth || hasUser);
    return isAuth;
  }

  /**
   * Verifica si existe un token de acceso válido en el almacenamiento local.
   * @returns {boolean} true si hay token, false si no.
   */
  hasValidToken(): boolean {
    const token = this.getStoredToken();
    const hasToken = !!token;
    return hasToken;
  }

  /**
   * Obtiene el token de acceso almacenado actualmente.
   * @returns {string | null} Token de acceso o null si no existe.
   */
  getToken(): string | null {
    const token = this.getStoredToken();
    return token;
  }

  /**
   * Obtiene el usuario autenticado actualmente desde el estado en memoria.
   * @returns {User | null} Usuario autenticado o null si no hay usuario cargado.
   */
  getCurrentUser(): User | null {
    const user = this.authStateSubject.value.user;
    return user;
  }

  // Métodos privados de utilidad

  /**
   * Actualiza el estado de autenticación y usuario en memoria.
   * @private
   * @param updates Cambios parciales a aplicar al estado.
   */
  private updateAuthState(updates: Partial<OAuthState>): void {
    const current = this.authStateSubject.value;
    const newState = {
      ...current,
      ...updates,
      error: null
    };
    this.authStateSubject.next(newState);
  }

  /**
   * Marca el estado como cargando o no cargando.
   * @private
   * @param loading true si está cargando, false si no.
   */
  private setLoading(loading: boolean): void {
    this.updateAuthState({ isLoading: loading });
  }

  /**
   * Establece un mensaje de error en el estado de autenticación.
   * @private
   * @param error Mensaje de error a mostrar.
   */
  private setError(error: string): void {
    this.updateAuthState({ error, isLoading: false });
  }

  /**
   * Limpia completamente el estado de autenticación y usuario, y borra los tokens del almacenamiento local.
   * @private
   */
  private clearAuthState(): void {
    localStorage.removeItem('access_token');
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

  /**
   * Limpia los valores de estado y nonce de OAuth almacenados en localStorage.
   * @private
   */
  private cleanupOAuthState(): void {
    localStorage.removeItem('oauth_state');
    localStorage.removeItem('oauth_nonce');
  }

  /**
   * Almacena los tokens de acceso y refresh en localStorage.
   * @private
   * @param tokenData Objeto con los tokens a guardar.
   */
  private storeTokens(tokenData: TokenResponse): void {
    localStorage.setItem('access_token', tokenData.access_token);
    if (tokenData.refresh_token) {
      localStorage.setItem('refresh_token', tokenData.refresh_token);
    }
  }

  /**
   * Obtiene el token de acceso almacenado en localStorage.
   * @private
   * @returns {string | null} Token de acceso o null si no existe.
   */
  private getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtiene el refresh token almacenado en localStorage (si aplica).
   * @private
   * @returns {string | null} Refresh token o null si no existe.
   */
  private getStoredRefreshToken(): string | null {
    return null;
  }

  /**
   * Genera una cadena aleatoria de la longitud especificada, útil para state y nonce.
   * @private
   * @param length Longitud de la cadena a generar.
   * @returns {string} Cadena aleatoria.
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Extrae el mensaje de error más relevante de un objeto de error.
   * @private
   * @param error Objeto de error recibido.
   * @returns {string} Mensaje de error extraído o 'Error desconocido'.
   */
  private getErrorMessage(error: any): string {
    if (error?.error?.message) return error.error.message;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Error desconocido';
  }
}
