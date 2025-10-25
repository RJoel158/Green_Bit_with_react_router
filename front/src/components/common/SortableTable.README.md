# SortableTable - Componente Reutilizable de Tabla

## Descripción
Componente genérico de tabla con las siguientes características:
- ✅ **Ordenamiento** por columnas (ascendente/descendente/sin orden)
- ✅ **Paginación** automática
- ✅ **Selección** de filas (opcional)
- ✅ **Renderizado personalizado** por columna
- ✅ **Estilos consistentes** con el diseño de UserManagement

## Uso Básico

```tsx
import SortableTable from '../common/SortableTable';
import type { ColumnDef } from '../common/SortableTable';

interface MyData {
  id: number;
  name: string;
  email: string;
  date: string;
}

const columns: ColumnDef<MyData>[] = [
  {
    key: 'name',
    label: 'Nombre',
    sortable: true, // Permite ordenar por esta columna
  },
  {
    key: 'email',
    label: 'Correo',
    sortable: true,
  },
  {
    key: 'date',
    label: 'Fecha',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Acciones',
    sortable: false, // No permite ordenar
    render: (item) => (
      <button onClick={() => handleEdit(item.id)}>Editar</button>
    ),
  },
];

<SortableTable
  data={myData}
  columns={columns}
  onRowClick={(item) => console.log('Clicked:', item)}
  selectedItemKey={selectedId}
  itemsPerPage={10}
  emptyMessage="No hay datos"
  getRowKey={(item) => item.id}
/>
```

## Props

### `data: T[]` (requerido)
Array de datos a mostrar en la tabla.

### `columns: ColumnDef<T>[]` (requerido)
Definición de las columnas. Cada columna puede tener:
- `key`: string - Nombre de la propiedad del objeto
- `label`: string - Texto a mostrar en el encabezado
- `sortable?: boolean` - Si se puede ordenar (default: true)
- `render?: (item: T) => React.ReactNode` - Función personalizada para renderizar la celda
- `className?: string` - Clases CSS adicionales

### `getRowKey: (item: T) => string | number` (requerido)
Función que retorna un identificador único para cada fila.

### `onRowClick?: (item: T) => void` (opcional)
Callback que se ejecuta al hacer click en una fila.

### `selectedItemKey?: string | number` (opcional)
ID del item seleccionado actualmente (para resaltarlo).

### `itemsPerPage?: number` (opcional, default: 10)
Número de items por página.

### `emptyMessage?: string` (opcional, default: 'No hay datos disponibles')
Mensaje a mostrar cuando no hay datos.

## Ejemplo con Renderizado Personalizado

```tsx
const columns: ColumnDef<User>[] = [
  {
    key: 'fullName',
    label: 'Usuario',
    sortable: true,
    render: (user) => (
      <div className="user-cell">
        <div className="avatar">{user.fullName.charAt(0)}</div>
        <span>{user.fullName}</span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    sortable: true,
    render: (user) => (
      <span className={`badge ${user.status === 'active' ? 'green' : 'red'}`}>
        {user.status}
      </span>
    ),
  },
];
```

## Estilos

El componente usa las clases CSS de `UserManagement.css`:
- `.user-management-table-container`
- `.user-management-table`
- `.user-management-table-head-cell`
- `.user-management-table-body-row`
- `.user-management-table-pagination`

Las columnas ordenables tienen hover effect y muestran iconos:
- `⇅` - Columna sin ordenar
- `▲` - Ordenado ascendente
- `▼` - Ordenado descendente

## Módulos que ya lo usan

1. ✅ **UserManagement** - Tabla de usuarios con selección
2. ✅ **CollectorRequests** - Tabla de solicitudes con acciones

## Próximos módulos a migrar

- [ ] **MaterialesAdmin** - Tabla de materiales
- [ ] **AnnouncementsAdmin** - Tabla de anuncios
- [ ] Cualquier otro módulo con tablas
