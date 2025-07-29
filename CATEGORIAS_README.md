# Módulo de Categorías - Integración con API

## Descripción
Este módulo permite gestionar categorías de herramientas conectándose con la API de backend en `http://localhost:3001/api/categories`.

## Funcionalidades Implementadas

### ✅ Operaciones CRUD Completas
- **GET** `/api/categories` - Obtener todas las categorías
- **POST** `/api/categories` - Crear nueva categoría
- **GET** `/api/categories/:id` - Obtener categoría por ID
- **PUT** `/api/categories/:id` - Actualizar categoría existente
- **DELETE** `/api/categories/:id` - Eliminar categoría

### 🔧 Características del Componente
- ✅ Tabla con paginación y filtrado global
- ✅ Modal de confirmación personalizado para eliminar/actualizar
- ✅ Validación de campos requeridos
- ✅ Manejo de errores con mensajes toast
- ✅ Interceptor de token automático
- ✅ Diseño responsive y moderno

## Archivos Modificados/Creados

### Nuevos Archivos:
- `src/app/pages/service/category.service.ts` - Servicio para operaciones CRUD
- `src/app/pages/interfaces/category.interfaces.ts` - Interfaces para categorías
- `src/app/pages/interfaces/index.ts` - Archivo índice de interfaces
- `src/app/pages/interfaces/README.md` - Documentación de interfaces
- `CATEGORIAS_README.md` - Este archivo de documentación

### Archivos Modificados:
- `src/app/pages/categories/categories-crud.component.ts` - Componente actualizado con integración API y interfaces separadas
- `src/app/pages/service/category.service.ts` - Servicio actualizado con interfaces específicas
- `src/environments/environment.ts` - Agregada URL de API
- `src/app/app.config.ts` - Configurado HttpClient e interceptor

## Configuración Requerida

### 1. API Backend
Asegúrate de que tu API esté corriendo en `http://localhost:3001` con los siguientes endpoints:

```bash
# Verificar que la API esté funcionando
curl http://localhost:3001/api/categories
```

### 2. Estructura de Respuesta Esperada
La API debe devolver respuestas en este formato:

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    "id": "1",
    "name": "Eléctrica",
    "description": "Herramientas eléctricas",
    "active": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Autenticación
El componente utiliza el interceptor de token existente para agregar automáticamente el token de autorización a todas las peticiones.

## Uso del Componente

### Navegación
```typescript
// En tu routing
{ path: 'categories', component: CategoriesCrudComponent }
```

### Funcionalidades Disponibles

1. **Ver Categorías**: La tabla se carga automáticamente al inicializar
2. **Crear Categoría**: Botón "Crear Categoría" → Modal de formulario
3. **Editar Categoría**: Botón de editar → Modal con datos precargados
4. **Eliminar Categoría**: Botón de eliminar → Confirmación personalizada
5. **Buscar**: Campo de búsqueda global en tiempo real

## Manejo de Errores

El componente maneja automáticamente:
- ✅ Errores de conexión
- ✅ Errores de autenticación (401)
- ✅ Errores de validación
- ✅ Errores del servidor (500)
- ✅ Mensajes de éxito/error con toast

## Personalización

### Estilos CSS
Los estilos están incluidos en el componente y utilizan:
- Tailwind CSS para diseño responsive
- PrimeNG para componentes UI
- Material Symbols para iconos

### Mensajes
Todos los mensajes están en español y se pueden personalizar en el componente.

## Próximos Pasos

1. **Probar la integración**:
   ```bash
   ng serve
   # Navegar a /categories
   ```

2. **Verificar endpoints**:
   - Asegúrate de que tu API responda correctamente
   - Verifica que el formato de respuesta sea el esperado

3. **Configurar autenticación**:
   - El interceptor de token ya está configurado
   - Asegúrate de estar logueado para usar el componente

## Troubleshooting

### Error de CORS
Si tienes problemas de CORS, asegúrate de que tu API permita peticiones desde `http://localhost:4200`.

### Error de Conexión
Verifica que tu API esté corriendo en el puerto 3001:
```bash
curl http://localhost:3001/api/categories
```

### Error de Token
Si recibes errores 401, verifica que:
- El usuario esté logueado
- El token sea válido
- El interceptor esté funcionando correctamente

## Contribución

Para agregar nuevas funcionalidades:
1. Modifica el servicio `CategoryService`
2. Actualiza el componente según sea necesario
3. Prueba todas las operaciones CRUD
4. Documenta los cambios 
