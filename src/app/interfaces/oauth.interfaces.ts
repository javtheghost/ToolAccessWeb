export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
  authUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  unifiedApiUrl: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono?: string;
  estado?: boolean;
  rol: Role;
  token_source: 'oauth' | 'api';
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos?: string[];
}

export interface OAuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
} 