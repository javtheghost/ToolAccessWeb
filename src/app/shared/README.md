# Estilos Globales para Componentes CRUD

Este documento describe los estilos globales disponibles para los componentes CRUD que han sido centralizados en `src/styles.scss` para evitar duplicación y facilitar el mantenimiento.

## Clases CSS Disponibles

### Botones

#### Botón Cancelar
```html
<button class="custom-cancel-btn">Cancelar</button>
```
- Borde azul (#002e6d)
- Fondo blanco
- Hover: fondo azul claro (#e6f0ff)

#### Botones de Confirmación
```html
<!-- Para acciones de eliminar (rojo) -->
<button class="custom-confirm-accept-danger">Eliminar</button>

<!-- Para acciones de advertencia (ámbar) -->
<button class="custom-confirm-accept-warning">Actualizar</button>
```

### Toggle Switch Personalizado
```html
<input type="checkbox" class="custom-toggle" [(ngModel)]="item.active" />
```
- Toggle switch personalizado con color verde (#12A883) cuando está activo
- Transiciones suaves
- Compatible con PrimeNG InputSwitch

### Colores de Texto
```html
<span class="text-danger">Texto en rojo</span>
<span class="text-warning">Texto en ámbar</span>
```

### Modal Personalizado
```html
<div class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
    <!-- Contenido del modal -->
  </div>
</div>
```

## Estructura Recomendada para Modales de Confirmación

```html
<!-- MODAL PERSONALIZADO DE CONFIRMACIÓN -->
<div *ngIf="showCustomConfirm" class="fixed inset-0 z-modal-confirm flex items-center justify-center bg-black bg-opacity-40">
  <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
    <!-- Botón de cerrar -->
    <button type="button" (click)="onCustomConfirmReject()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl">
      <span class="material-symbols-outlined">close</span>
    </button>
    
    <div class="flex flex-col items-start">
      <!-- Icono -->
      <i class="material-symbols-outlined text-6xl mb-4"
        [ngClass]="{
          'text-danger': confirmIcon === 'delete',
          'text-warning': confirmIcon === 'warning'
        }"
      >{{ confirmIcon }}</i>
      
      <!-- Mensaje -->
      <div class="text-left mb-6">
        <div [innerHTML]="confirmMessage"></div>
      </div>
      
      <!-- Botones -->
      <div class="flex gap-4 self-end">
        <button type="button" class="custom-cancel-btn px-4 py-2 font-semibold" (click)="onCustomConfirmReject()">
          Cancelar
        </button>
        <button type="button" 
          [ngClass]="confirmIcon === 'delete' ? 'custom-confirm-accept-danger' : 'custom-confirm-accept-warning'"
          class="px-4 py-2 rounded font-semibold"
          (click)="onCustomConfirmAccept()">
          Aceptar
        </button>
      </div>
    </div>
  </div>
</div>
```

## Variables CSS Disponibles

Los siguientes colores están definidos como variables CSS:
- `--primary-color`: Color principal de la aplicación
- `--color-danger`: Color rojo para acciones peligrosas (#d9534f)
- `--color-warning`: Color ámbar para advertencias (#ffa726)

## Convenciones de Uso

1. **Botones de Cancelar**: Siempre usar `custom-cancel-btn`
2. **Botones de Eliminar**: Usar `custom-confirm-accept-danger`
3. **Botones de Advertencia/Actualizar**: Usar `custom-confirm-accept-warning`
4. **Toggles**: Usar `custom-toggle` para checkboxes personalizados
5. **Modales**: Usar las clases de utilidad definidas para el modal personalizado

## Beneficios

- **Consistencia**: Todos los componentes CRUD tienen la misma apariencia
- **Mantenimiento**: Los cambios se hacen en un solo lugar
- **Rendimiento**: Menos CSS duplicado
- **Escalabilidad**: Fácil agregar nuevos estilos globales 