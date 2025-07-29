# Interfaces del Sistema

Este directorio contiene todas las interfaces TypeScript utilizadas en el sistema.

## Estructura de Archivos

### `category.interfaces.ts`
Interfaces relacionadas con el módulo de categorías:

- **`Category`**: Interfaz principal para una categoría
  ```typescript
  interface Category {
    id?: string;
    name?: string;
    description?: string;
    active?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  ```

- **`CategoryResponse`**: Respuesta estándar de la API
  ```typescript
  interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category | Category[];
    total?: number;
  }
  ```

- **`CategoryCreateRequest`**: Datos requeridos para crear una categoría
  ```typescript
  interface CategoryCreateRequest {
    name: string;           // Requerido
    description?: string;   // Opcional
    active?: boolean;       // Opcional
  }
  ```

- **`CategoryUpdateRequest`**: Datos opcionales para actualizar una categoría
  ```typescript
  interface CategoryUpdateRequest {
    name?: string;          // Opcional
    description?: string;   // Opcional
    active?: boolean;       // Opcional
  }
  ```

### `oauth.interfaces.ts`
Interfaces relacionadas con la autenticación OAuth (ubicado en `src/app/interfaces/oauth.interfaces.ts`).

### `index.ts`
Archivo índice que exporta todas las interfaces para facilitar las importaciones.

## Uso

### Importación desde el archivo índice:
```typescript
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../interfaces';
```

### Importación directa:
```typescript
import { Category } from '../interfaces/category.interfaces';
```

## Beneficios de esta Organización

1. **Separación de Responsabilidades**: Cada módulo tiene sus propias interfaces
2. **Reutilización**: Las interfaces pueden ser compartidas entre componentes
3. **Mantenibilidad**: Fácil de mantener y actualizar
4. **Tipado Fuerte**: Mejor control de tipos en TypeScript
5. **Documentación**: Interfaces bien documentadas y organizadas

## Agregar Nuevas Interfaces

Para agregar nuevas interfaces:

1. Crea un nuevo archivo `nombre.interfaces.ts`
2. Define las interfaces necesarias
3. Exporta las interfaces desde `index.ts`
4. Documenta las interfaces en este README

### Ejemplo:
```typescript
// user.interfaces.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// index.ts
export * from './user.interfaces';
``` 
