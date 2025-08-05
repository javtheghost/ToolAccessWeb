// Exportar todas las interfaces de categorías
export * from './category.interfaces';

// Exportar todas las interfaces de usuarios
export * from './user.interfaces';

// Exportar interfaces de OAuth específicas (evitando conflictos)
export type { 
    OAuthConfig, 
    TokenResponse, 
    OAuthState, 
    ApiResponse 
} from '../../interfaces/oauth.interfaces';
