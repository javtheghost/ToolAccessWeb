# Sistema de Notificaciones - ToolAccess

## Descripción

Se ha implementado un sistema completo de notificaciones en tiempo real para la aplicación ToolAccess, que incluye tanto el backend como el frontend.

## Características Implementadas

### Backend (APIServiceGeneral)

#### Rutas de Notificaciones
- **GET** `/api/notificaciones` - Obtener notificaciones del usuario
- **PUT** `/api/notificaciones/:id/leer` - Marcar notificación como leída
- **PUT** `/api/notificaciones/leer-todas` - Marcar todas las notificaciones como leídas

#### Tipos de Notificaciones
- `prestamo_vencido` - Préstamos que han vencido
- `devolucion` - Confirmaciones de devolución
- `multa` - Multas aplicadas
- `recordatorio` - Recordatorios de devolución
- `sistema` - Notificaciones del sistema

#### Prioridades
- `baja` - Verde
- `media` - Amarillo
- `alta` - Naranja
- `critica` - Rojo

### Frontend (Angular)

#### Componente de Notificaciones
- **Ubicación**: `src/app/layout/component/app.topbar.ts`
- **Servicio**: `src/app/pages/service/notification.service.ts`

#### Características del Frontend
- ✅ Badge con contador de notificaciones no leídas
- ✅ Menú desplegable con lista de notificaciones
- ✅ Indicadores visuales de prioridad
- ✅ Iconos según el tipo de notificación
- ✅ Fechas relativas (ej: "Hace 5 min")
- ✅ Actualización automática cada 30 segundos
- ✅ Marcar notificación individual como leída
- ✅ Marcar todas las notificaciones como leídas
- ✅ Estados de carga y sin notificaciones
- ✅ Mensajes de confirmación y error

#### Integración con OAuth
- ✅ Autenticación automática con tokens
- ✅ Interceptor HTTP para manejo de tokens
- ✅ Renovación automática de tokens expirados

## Estructura de Datos

### Notificación
```typescript
interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'prestamo_vencido' | 'devolucion' | 'multa' | 'recordatorio' | 'sistema';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  usuario_destinatario: number;
  leida: boolean;
  fecha_lectura: string | null;
  metadata?: any;
  is_active: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string | null;
  usuario_creacion: number;
  usuario_actualizacion: number | null;
}
```

## Funcionalidades Implementadas

### 1. Badge de Notificaciones
- Muestra el número de notificaciones no leídas
- Se actualiza automáticamente
- Se oculta cuando no hay notificaciones no leídas

### 2. Menú Desplegable
- Lista todas las notificaciones del usuario
- Diferenciación visual entre leídas y no leídas
- Indicadores de prioridad con colores
- Iconos específicos según el tipo

### 3. Acciones de Notificaciones
- **Click en notificación**: Marca como leída
- **"Marcar todas como leídas"**: Marca todas las no leídas
- **"Ver todas las notificaciones"**: Navegación futura

### 4. Actualización Automática
- Se actualiza cada 30 segundos
- Solo funciona cuando el usuario está autenticado
- Manejo de errores con mensajes informativos

### 5. Estados de UI
- **Cargando**: Spinner mientras se cargan las notificaciones
- **Sin notificaciones**: Mensaje cuando no hay notificaciones
- **Error**: Mensajes de error con Toast notifications

## Configuración

### Environment
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:3001/api'
};
```

### Interceptor HTTP
El interceptor está configurado en `src/app/pages/interceptors/token.interceptor.ts` para:
- Agregar tokens de autorización automáticamente
- Manejar renovación de tokens expirados
- Redirigir a login en caso de error de autenticación

## Uso

### Para Usuarios
1. Las notificaciones aparecen automáticamente en la barra superior
2. El badge muestra el número de notificaciones no leídas
3. Click en el icono de campana para ver las notificaciones
4. Click en una notificación para marcarla como leída
5. Click en "Marcar todas como leídas" para marcar todas

### Para Desarrolladores
1. El servicio `NotificationService` maneja toda la lógica
2. El componente `AppTopbar` integra las notificaciones
3. Las notificaciones se actualizan automáticamente
4. Los errores se manejan con mensajes informativos

## Próximas Mejoras

- [ ] Página dedicada para ver todas las notificaciones
- [ ] Filtros por tipo y prioridad
- [ ] Notificaciones push en tiempo real
- [ ] Configuración de preferencias de notificaciones
- [ ] Historial de notificaciones eliminadas

## Notas Técnicas

- Las notificaciones usan soft delete (campo `is_active`)
- El sistema es compatible con el sistema de roles existente
- Los tokens se manejan automáticamente
- La UI es responsive y compatible con el tema oscuro/claro 
