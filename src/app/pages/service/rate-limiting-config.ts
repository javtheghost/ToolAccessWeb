import { RateLimitConfig } from './rate-limiting.service';

/**
 * Configuraciones de rate limiting para diferentes endpoints de la aplicación
 *
 * ESTRUCTURA:
 * - maxRequests: Número máximo de peticiones permitidas
 * - timeWindow: Ventana de tiempo en milisegundos (ej: 60000 = 1 minuto)
 * - cooldownPeriod: Tiempo de espera después de exceder el límite en milisegundos
 */

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // ===== DASHBOARD Y ESTADÍSTICAS =====
  'dashboard-stats': {
    maxRequests: 5,        // 5 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000  // 30 segundos de cooldown
  },

  'reports-estadisticas': {
    maxRequests: 3,        // Solo 3 peticiones por minuto (datos críticos)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000  // 30 segundos de cooldown
  },

  // ===== GESTIÓN DE HERRAMIENTAS =====
  'tools-crud-load': {
    maxRequests: 10,       // 10 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 15000  // 15 segundos de cooldown
  },

  'tools-crud-create': {
    maxRequests: 5,        // 5 peticiones por minuto (crear es más costoso)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 20000  // 20 segundos de cooldown
  },

  'tools-crud-update': {
    maxRequests: 8,        // 8 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 15000  // 15 segundos de cooldown
  },

  // ===== CATEGORÍAS Y SUBCATEGORÍAS =====
  'categories-load': {
    maxRequests: 15,       // 15 peticiones por minuto (datos que cambian poco)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 10000  // 10 segundos de cooldown
  },

  'subcategories-load': {
    maxRequests: 15,       // 15 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 10000  // 10 segundos de cooldown
  },

  // ===== PRÉSTAMOS =====
  'loans-load': {
    maxRequests: 8,        // 8 peticiones por minuto (reducido para evitar spam)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 15000  // 15 segundos de cooldown
  },

  'loans-create': {
    maxRequests: 6,        // 6 peticiones por minuto (crear préstamo es crítico)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 25000  // 25 segundos de cooldown
  },

  'loans-details': {
    maxRequests: 15,       // 15 peticiones por minuto (ver detalles es más frecuente)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 10000  // 10 segundos de cooldown
  },

  // ===== REPORTES =====
  'reports-herramientas-populares': {
    maxRequests: 4,        // 4 peticiones por minuto (reportes pesados)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000  // 30 segundos de cooldown
  },

  'reports-prestamos': {
    maxRequests: 4,        // 4 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000  // 30 segundos de cooldown
  },

  'reports-multas': {
    maxRequests: 4,        // 4 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000  // 30 segundos de cooldown
  },

  // ===== USUARIOS =====
  'users-load': {
    maxRequests: 8,        // 8 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 15000  // 15 segundos de cooldown
  },

  // ===== MULTAS =====
  'fines-load': {
    maxRequests: 10,       // 10 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 12000  // 12 segundos de cooldown
  },

  'fines-create': {
    maxRequests: 5,        // 5 peticiones por minuto (crear multa es importante)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 20000  // 20 segundos de cooldown
  },

  // ===== NOTIFICACIONES =====
  'notifications-load': {
    maxRequests: 20,       // 20 peticiones por minuto (notificaciones son ligeras)
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 5000   // 5 segundos de cooldown
  },

  // ===== CONFIGURACIÓN POR DEFECTO =====
  'default': {
    maxRequests: 10,       // 10 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 15000  // 15 segundos de cooldown
  }
};

/**
 * Obtiene la configuración de rate limiting para un endpoint específico
 * @param endpoint Identificador del endpoint
 * @returns Configuración de rate limiting
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  return RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default'];
}

/**
 * Configuraciones especiales para diferentes tipos de usuario
 */
export const USER_ROLE_RATE_LIMITS: Record<string, Partial<RateLimitConfig>> = {
  'admin': {
    // Los admins pueden hacer más peticiones
    maxRequests: 15,
    timeWindow: 60000,
    cooldownPeriod: 10000
  },
  'user': {
    // Usuarios normales tienen límites más estrictos
    maxRequests: 8,
    timeWindow: 60000,
    cooldownPeriod: 20000
  },
  'guest': {
    // Invitados tienen límites muy estrictos
    maxRequests: 3,
    timeWindow: 60000,
    cooldownPeriod: 30000
  }
};

/**
 * Obtiene configuración de rate limiting ajustada por rol de usuario
 * @param endpoint Identificador del endpoint
 * @param userRole Rol del usuario
 * @returns Configuración ajustada
 */
export function getRateLimitConfigForRole(endpoint: string, userRole: string): RateLimitConfig {
  const baseConfig = getRateLimitConfig(endpoint);
  const roleConfig = USER_ROLE_RATE_LIMITS[userRole] || USER_ROLE_RATE_LIMITS['user'];

  return {
    ...baseConfig,
    ...roleConfig
  };
}
