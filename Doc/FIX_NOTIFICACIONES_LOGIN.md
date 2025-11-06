# 🔧 FIX: Redirección a Login en NotificationsPage

## ❓ El Problema

Cuando presionabas "Ver más" en el NotificationBell, te mandaba a `/notifications`, pero luego te redirigía a `/login`. 

### ¿Por qué sucedía?

El problema estaba en cómo se obtenía el `userId` en **NotificationsPage.tsx**:

```typescript
// ❌ ANTES (INCORRECTO)
const userId = parseInt(localStorage.getItem('userId') || '0');
```

Pero en tu aplicación, el usuario se guarda como:

```typescript
// ✅ CORRECTO
localStorage.setItem('user', JSON.stringify(data.user));
// El objeto guardado contiene: { id, email, role, state, avatar }
```

### Resultado
- `localStorage.getItem('userId')` retornaba `null`
- `parseInt(null || '0')` = `0`
- `if (!userId)` = verdadero
- Se ejecutaba `navigate('/login')`

---

## ✅ La Solución

Actualicé **NotificationsPage.tsx** para obtener el userId correctamente:

```typescript
// ✅ DESPUÉS (CORRECTO)
const getUserId = (): number => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user?.id || 0;
    }
    return 0;
  } catch (error) {
    console.error('Error getting userId:', error);
    return 0;
  }
};

const userId = getUserId();

useEffect(() => {
  if (!userId || userId === 0) {
    navigate('/login');
    return;
  }
  // ... resto del código
}, [userId, navigate]);
```

### ¿Qué hace este código?

1. **Obtiene el string del usuario** desde localStorage
2. **Lo convierte a objeto** usando `JSON.parse()`
3. **Extrae el id** del objeto
4. **Maneja errores** por si el JSON está corrupto
5. **Valida que el userId sea válido** (no 0)
6. **Solo redirige a login si no hay usuario**

---

## 🔄 Cómo Funciona Ahora

```
Usuario hace clic en "Ver más"
    ↓
window.location.href = '/notifications'
    ↓
NotificationsPage.tsx se carga
    ↓
getUserId() busca en localStorage['user']
    ↓
Extrae user.id correctamente
    ↓
userId > 0 ✅
    ↓
Se cargan las notificaciones
    ↓
Usuario ve la página de notificaciones
```

---

## 📝 Comparativa

### ANTES ❌
```typescript
const userId = parseInt(localStorage.getItem('userId') || '0');
// Busca 'userId' directamente
// Encuentra: null
// Resultado: userId = 0 → Redirige a login
```

### DESPUÉS ✅
```typescript
const userId = getUserId();
// Busca 'user' (objeto completo)
// Parsea el JSON
// Extrae el .id
// Resultado: userId = 123 → Carga notificaciones
```

---

## 🔍 Prueba

Ahora cuando presiones "Ver más":

1. ✅ Se abre `/notifications`
2. ✅ El userId se obtiene correctamente
3. ✅ Las notificaciones se cargan
4. ✅ No hay redirección a login

---

## 📂 Archivos Modificados

### NotificationsPage.tsx
- ✅ Nueva función `getUserId()`
- ✅ Obtiene correctamente el usuario desde localStorage
- ✅ Manejo de errores integrado
- ✅ Validación robusta

---

## 🎯 Punto Clave

**Tu aplicación guarda el usuario así:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "role": "recycler",
  "state": 1,
  "avatar": "url"
}
```

**Bajo la clave:** `"user"`

**NotificationsPage ahora busca correctamente en esa ubicación.**

---

**Estado**: ✅ Solucionado
**Tested**: En desarrollo local
