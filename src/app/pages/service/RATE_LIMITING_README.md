# Sistema de Rate Limiting - ToolAccess

## 📋 Descripción

Este sistema implementa control de velocidad de peticiones (rate limiting) para proteger el servidor contra spam de peticiones y mejorar la experiencia del usuario.

## 🚀 Características

- ✅ **Debounce/Throttle**: Evita peticiones múltiples cuando el usuario hace clic rápidamente
- ✅ **Rate Limiting por endpoint**: Cada endpoint puede tener sus propios límites
- ✅ **Configuración centralizada**: Fácil gestión de límites desde un archivo
- ✅ **Feedback visual**: Indicadores de estado y contadores de peticiones restantes
- ✅ **Componentes reutilizables**: Fácil implementación en cualquier tabla
- ✅ **Configuración por rol**: Diferentes límites según el tipo de usuario

## 📁 Estructura de archivos

```
src/app/pages/service/
├── rate-limiting.service.ts          # Servicio principal de rate limiting
├── rate-limiting-config.ts          # Configuraciones centralizadas
└── RATE_LIMITING_README.md          # Este archivo

src/app/pages/utils/
├── rate-limited-table.component.ts   # Componente reutilizable para tablas
└── table-usage-example.component.ts  # Ejemplo de uso

src/app/pages/reports/
├── reports-table.component.ts        # Componente específico para reportes
└── herramientas-populares-report.component.ts # Ejemplo de reporte
```

## 🔧 Configuración

### 1. Configuraciones por endpoint

Edita `rate-limiting-config.ts` para ajustar los límites:

```typescript
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'dashboard-stats': {
    maxRequests: 5,        // 5 peticiones por minuto
    timeWindow: 60000,     // 1 minuto
    cooldownPeriod: 30000  // 30 segundos de cooldown
  },
  // ... más configuraciones
};
```

### 2. Configuraciones por rol de usuario

```typescript
export const USER_ROLE_RATE_LIMITS: Record<string, Partial<RateLimitConfig>> = {
  'admin': {
    maxRequests: 15,       // Admins pueden hacer más peticiones
    timeWindow: 60000,
    cooldownPeriod: 10000
  },
  'user': {
    maxRequests: 8,        // Usuarios normales
    timeWindow: 60000,
    cooldownPeriod: 20000
  }
};
```

## 💻 Uso básico

### 1. En un componente simple

```typescript
import { RateLimitingService } from './service/rate-limiting.service';

export class MiComponente {
  constructor(private rateLimitingService: RateLimitingService) {}

  cargarDatos() {
    const endpoint = 'mi-endpoint';
    
    // Verificar si se puede hacer la petición
    if (!this.rateLimitingService.canMakeRequest(endpoint)) {
      console.warn('Rate limit alcanzado');
      return;
    }

    // Hacer la petición
    this.miServicio.getDatos().subscribe({
      next: (data) => {
        // Registrar petición exitosa
        this.rateLimitingService.recordRequest(endpoint);
        // ... procesar datos
      }
    });
  }
}
```

### 2. Usando configuración centralizada

```typescript
import { getRateLimitConfig } from './service/rate-limiting-config';

export class MiComponente {
  cargarDatos() {
    const endpoint = 'dashboard-stats';
    const config = getRateLimitConfig(endpoint);
    
    if (!this.rateLimitingService.canMakeRequest(endpoint, config)) {
      // Manejar límite alcanzado
      return;
    }
    
    // ... hacer petición
  }
}
```

### 3. Usando el componente de tabla reutilizable

```typescript
import { ReportsTableComponent, ReportTableConfig } from './reports/reports-table.component';

export class MiReporteComponent {
  tableConfig: ReportTableConfig = {
    endpoint: 'mi-reporte',
    title: 'Mi Reporte',
    subtitle: 'Descripción del reporte',
    maxRequests: 5,
    timeWindow: 60000,
    cooldownPeriod: 30000,
    showRefreshButton: true,
    showRateLimitInfo: true
  };

  loadData() {
    // Esta función se ejecuta cuando se hace clic en "Actualizar"
    // El rate limiting se maneja automáticamente
  }
}
```

```html
<app-reports-table
  [config]="tableConfig"
  [loading]="loading"
  (refreshRequested)="loadData()"
>
  <!-- Contenido de tu tabla aquí -->
</app-reports-table>
```

## 🎯 Endpoints configurados

### Dashboard y Estadísticas
- `dashboard-stats`: 5 peticiones/minuto
- `reports-estadisticas`: 3 peticiones/minuto

### Gestión de Herramientas
- `tools-crud-load`: 10 peticiones/minuto
- `tools-crud-create`: 5 peticiones/minuto
- `tools-crud-update`: 8 peticiones/minuto

### Categorías y Subcategorías
- `categories-load`: 15 peticiones/minuto
- `subcategories-load`: 15 peticiones/minuto

### Préstamos
- `loans-load`: 8 peticiones/minuto (reducido para evitar spam)
- `loans-create`: 6 peticiones/minuto
- `loans-details`: 15 peticiones/minuto (ver detalles es más frecuente)

### Reportes
- `reports-herramientas-populares`: 4 peticiones/minuto
- `reports-prestamos`: 4 peticiones/minuto
- `reports-multas`: 4 peticiones/minuto

### Usuarios y Multas
- `users-load`: 8 peticiones/minuto
- `fines-load`: 10 peticiones/minuto
- `fines-create`: 5 peticiones/minuto

### Notificaciones
- `notifications-load`: 20 peticiones/minuto

## 🔍 Monitoreo y debugging

### Verificar estado de rate limiting

```typescript
// Obtener peticiones restantes
const remaining = this.rateLimitingService.getRemainingRequests('mi-endpoint');

// Obtener tiempo restante
const timeRemaining = this.rateLimitingService.getTimeRemaining('mi-endpoint');

// Verificar si se puede hacer petición
const canMake = this.rateLimitingService.canMakeRequest('mi-endpoint');
```

### Limpiar datos de rate limiting

```typescript
// Limpiar un endpoint específico
this.rateLimitingService.clearEndpoint('mi-endpoint');

// Limpiar todos los datos
this.rateLimitingService.clearAll();
```

## 🎨 Personalización visual

### Modificar estilos del botón de refresh

```scss
// En tu componente
:host ::ng-deep .refresh-button {
  background-color: var(--primary-color);
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
```

### Personalizar mensajes

```typescript
// En el componente de tabla
getRefreshButtonText(): string {
  if (this.loading || this.isRefreshing) {
    return 'Cargando...';
  }
  if (!this.canRefresh) {
    return 'Esperando...';
  }
  return 'Actualizar datos';
}
```

## 🚨 Manejo de errores

### Capturar errores de rate limiting

```typescript
this.miServicio.getDatos().subscribe({
  next: (data) => {
    this.rateLimitingService.recordRequest(endpoint);
    // Procesar datos
  },
  error: (error) => {
    if (error.message === 'Rate limit alcanzado') {
      // Mostrar mensaje específico para rate limiting
      this.mostrarMensajeRateLimit();
    } else {
      // Manejar otros errores
      this.mostrarErrorGeneral(error);
    }
  }
});
```

## 📊 Métricas recomendadas

### Para monitoreo en producción

```typescript
// Registrar métricas de rate limiting
const metrics = {
  endpoint: 'mi-endpoint',
  timestamp: new Date().toISOString(),
  remainingRequests: this.rateLimitingService.getRemainingRequests('mi-endpoint'),
  timeRemaining: this.rateLimitingService.getTimeRemaining('mi-endpoint'),
  canMakeRequest: this.rateLimitingService.canMakeRequest('mi-endpoint')
};

// Enviar a servicio de métricas
this.metricsService.recordRateLimitMetrics(metrics);
```

## 🔄 Migración de componentes existentes

### Antes (sin rate limiting)

```typescript
loadData() {
  this.loading = true;
  this.miServicio.getDatos().subscribe({
    next: (data) => {
      this.datos = data;
      this.loading = false;
    }
  });
}
```

### Después (con rate limiting)

```typescript
loadData() {
  const endpoint = 'mi-endpoint';
  
  if (!this.rateLimitingService.canMakeRequest(endpoint)) {
    this.mostrarMensajeRateLimit();
    return;
  }

  this.loading = true;
  this.miServicio.getDatos().subscribe({
    next: (data) => {
      this.datos = data;
      this.loading = false;
      this.rateLimitingService.recordRequest(endpoint);
    }
  });
}
```

## ✅ Checklist de implementación

- [ ] Importar `RateLimitingService` en el componente
- [ ] Definir endpoint único para el componente
- [ ] Verificar rate limiting antes de hacer peticiones
- [ ] Registrar peticiones exitosas
- [ ] Manejar errores de rate limiting
- [ ] Probar límites y cooldowns
- [ ] Ajustar configuración según necesidades
- [ ] Documentar endpoint en `rate-limiting-config.ts`

## 🆘 Soporte

Si tienes problemas con el rate limiting:

1. Verifica que el endpoint esté configurado en `rate-limiting-config.ts`
2. Revisa los logs de la consola para mensajes de rate limiting
3. Usa `clearEndpoint()` para resetear un endpoint específico
4. Ajusta los límites si son muy restrictivos para tu caso de uso 
