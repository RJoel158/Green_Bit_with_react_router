# Sistema de Protección de Rutas por Roles

## 📋 Descripción

Sistema de autorización basado en roles que protege las rutas de la aplicación, asegurando que cada usuario solo pueda acceder a las páginas correspondientes a su rol.

## 🔐 Roles y Permisos

### Roles Definidos

| roleId | Nombre | Descripción |
|--------|--------|-------------|
| 1 | Administrador | Acceso completo a todas las funcionalidades |
| 2 | Recolector | Acceso a funcionalidades de recolección |
| 3 | Reciclador | Acceso a funcionalidades de reciclaje |

### Matriz de Permisos

| Ruta | Admin (1) | Recolector (2) | Reciclador (3) |
|------|-----------|----------------|----------------|
| `/recicladorIndex` | ✅ | ❌ | ✅ |
| `/recycle-form` | ✅ | ❌ | ✅ |
| `/recolectorIndex` | ✅ | ✅ | ❌ |
| `/recycling-points` | ✅ | ✅ | ❌ |
| `/adminDashboard` | ✅ | ❌ | ❌ |
| `/adminUserManagement` | ✅ | ❌ | ❌ |
| `/adminCollectorRequests` | ✅ | ❌ | ❌ |
| `/userInfo` | ✅ | ✅ | ✅ |
| `/pickupDetails/:id` | ✅ | ✅ | ✅ |
| `/notifications` | ✅ | ✅ | ✅ |

## 🛡️ Funcionamiento

### Componente ProtectedRoute

El componente `ProtectedRoute` envuelve las rutas que requieren autorización:

```tsx
<Route 
  path="/recicladorIndex" 
  element={
    <ProtectedRoute allowedRoles={[3]}>
      <RecicladorIndex />
    </ProtectedRoute>
  } 
/>
```

### Flujo de Validación

1. **Lectura del Usuario**: Lee el usuario del `localStorage`
2. **Validación de Sesión**: Verifica que exista un usuario autenticado
3. **Validación de Rol**: Comprueba si el `roleId` está en los roles permitidos
4. **Privilegios Admin**: El administrador (roleId: 1) tiene acceso automático a todo
5. **Redirección**: Si no tiene permisos, redirige a su página principal según su rol

### Redirecciones Automáticas

Si un usuario intenta acceder a una ruta no permitida:

- **Recolector (2)** → Redirige a `/recolectorIndex`
- **Reciclador (3)** → Redirige a `/recicladorIndex`
- **Sin sesión** → Redirige a `/login`

## 📱 Páginas por Rol

### Reciclador (roleId: 3)

Puede acceder a:
- ✅ `/recicladorIndex` - Interfaz principal
- ✅ `/recycle-form` - Formulario para programar recolección
- ✅ `/pickupDetails/:id` - Detalles de sus citas
- ✅ `/notifications` - Notificaciones
- ✅ `/userInfo` - Información de perfil

### Recolector (roleId: 2)

Puede acceder a:
- ✅ `/recolectorIndex` - Interfaz principal
- ✅ `/recycling-points` - Mapa de puntos de reciclaje
- ✅ `/pickupDetails/:id` - Detalles de solicitudes/citas
- ✅ `/notifications` - Notificaciones
- ✅ `/userInfo` - Información de perfil

### Administrador (roleId: 1)

Puede acceder a:
- ✅ **Todas las páginas anteriores** (Reciclador + Recolector)
- ✅ `/adminDashboard` - Panel de control administrativo
- ✅ `/adminUserManagement` - Gestión de usuarios
- ✅ `/adminCollectorRequests` - Aprobación de recolectores

## 🔧 Implementación

### 1. Estructura del Usuario en localStorage

```typescript
{
  id: number;
  email: string;
  roleId: number;  // 1, 2, o 3
  role: string;    // "Administrador", "Recolector", "Reciclador"
  state: number;
}
```

### 2. Uso en App.tsx

```tsx
import ProtectedRoute from "./components/common/ProtectedRoute";

// Ruta solo para Reciclador
<Route 
  path="/recycle-form" 
  element={
    <ProtectedRoute allowedRoles={[3]}>
      <FormComp />
    </ProtectedRoute>
  } 
/>

// Ruta para múltiples roles
<Route 
  path="/notifications" 
  element={
    <ProtectedRoute allowedRoles={[1, 2, 3]}>
      <NotificationsPage />
    </ProtectedRoute>
  } 
/>
```

## 🚨 Seguridad

### Validaciones Implementadas

1. ✅ Verificación de sesión activa
2. ✅ Validación de roleId válido
3. ✅ Control de acceso por rol
4. ✅ Redirecciones automáticas
5. ✅ Mensajes de advertencia en consola

### Logs de Seguridad

El sistema registra intentos de acceso no autorizados:

```
[ProtectedRoute] Access denied. 
User role: 2 (Recolector), Allowed roles: [3]
```

## ⚠️ Importante

- El administrador **siempre** tiene acceso a todas las rutas
- Si el usuario no tiene sesión, se redirige a `/login`
- Las rutas públicas (`/`, `/login`, `/register`) no requieren protección
- El `roleId` se obtiene del backend durante el login

## 🧪 Testing

Para probar el sistema:

1. Iniciar sesión como cada tipo de usuario
2. Intentar acceder a rutas de otros roles escribiendo la URL directamente
3. Verificar que se redirige correctamente
4. Comprobar los logs en la consola del navegador

## 📝 Mantenimiento

Para agregar nuevas rutas protegidas:

1. Definir los roles permitidos
2. Envolver la ruta con `<ProtectedRoute>`
3. Actualizar esta documentación

```tsx
<Route 
  path="/nueva-ruta" 
  element={
    <ProtectedRoute allowedRoles={[1, 2]}> {/* Admin y Recolector */}
      <NuevoComponente />
    </ProtectedRoute>
  } 
/>
```
