# 🔧 FIX: Notificaciones que Reaparecen al Recargar - Persistencia Correcta

## ❌ El Problema

Cuando el usuario marcaba una notificación como leída en el dropdown del NotificationBell, la notificación desaparecía momentáneamente. Sin embargo:

1. **Al recargar la página**, las notificaciones volvían a aparecer (incluso las marcadas como leídas)
2. **El contador mostraba 30 nuevas notificaciones cada vez**, sin importar cuántas se hubieran marcado como leídas
3. **El botón "Ver más" no era permanente**, solo aparecía si había más de 5 notificaciones

### Causa Raíz

- El backend devolvía **TODAS las notificaciones** (leídas y no leídas) indiscriminadamente
- El frontend no estaba pasando parámetros para filtrar solo no leídas
- No había sincronización entre el estado marcado como leído y las futuras cargas

---

## ✅ La Solución

Se realizaron cambios en 5 archivos para asegurar:
1. ✅ Solo se cargan notificaciones **no leídas** por defecto
2. ✅ Al marcar como leído, la notificación se **elimina de la UI inmediatamente**
3. ✅ Se recarga la lista después de marcar como leído para sincronizar con BD
4. ✅ El botón "Ver más" es **permanente** y siempre visible
5. ✅ Se agregó funcionalidad de "Marcar como leída" en NotificationsPage también

---

## 📁 Archivos Modificados

### Backend

#### 1. **back/Models/notificationModel.js**
- ✅ Agregado parámetro `unreadOnly` a la función `getUserNotifications()`
- ✅ Ahora acepta un booleano que filtra solo notificaciones no leídas si es `true`

```javascript
export const getUserNotifications = async (userId, limit = 20, offset = 0, unreadOnly = false) => {
  // Si unreadOnly es true, agrega: AND n.`read` = 0
}
```

#### 2. **back/Controllers/notificationController.js**
- ✅ Agregado manejo del parámetro `unreadOnly` en query string
- ✅ Pasa el parámetro al modelo automáticamente
- ✅ Convierte string `"true"` a booleano correctamente

```javascript
const { unreadOnly = false } = req.query;
const onlyUnread = unreadOnly === 'true' || unreadOnly === true;
const notifications = await NotificationModel.getUserNotifications(
  parseInt(userId),
  parseInt(limit),
  parseInt(offset),
  onlyUnread
);
```

### Frontend

#### 3. **front/src/services/notificationService.ts**
- ✅ Agregado parámetro `unreadOnly: boolean = true` a `fetchNotifications()`
- ✅ Pasa el parámetro en query string a la API

```typescript
export const fetchNotifications = async (
  userId: number, 
  limit: number = 20, 
  unreadOnly: boolean = true
): Promise<Notification[]> => {
  const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER(userId, limit), {
    params: {
      unreadOnly
    }
  });
}
```

#### 4. **front/src/components/CommonComp/NotificationBell.tsx**
- ✅ `loadNotifications()` ahora pasa `true` para obtener solo no leídas
- ✅ `handleMarkAsRead()` recarga la lista después de marcar como leído
- ✅ Botón "Ver más" es **permanente** (eliminada la condición `notifications.length > 5`)

```typescript
const loadNotifications = async () => {
  const fetchedNotifications = await fetchNotifications(userId, 20, true);
  setNotifications(fetchedNotifications);
};

const handleMarkAsRead = async (notificationId: number) => {
  const success = await markAsRead(notificationId, userId);
  if (success) {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Recarga después de 300ms para sincronizar
    setTimeout(() => {
      loadNotifications();
      loadUnreadCount();
    }, 300);
  }
};
```

#### 5. **front/src/components/CommonComp/NotificationsPage.tsx**
- ✅ `loadNotifications()` ahora pasa `true` para obtener solo no leídas
- ✅ Agregado `markAsRead` en las importaciones
- ✅ Agregado método `handleMarkAsRead()` 
- ✅ Agregado botón "Marcar como leída" en cada notificación no leída
- ✅ Cada notificación tiene su propio botón de acción

```typescript
const handleMarkAsRead = async (notificationId: number) => {
  const success = await markAsRead(notificationId, userId);
  if (success) {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }
};
```

#### 6. **front/src/components/CommonComp/NotificationsPage.css**
- ✅ Agregada clase `.notification-item-actions` para contenedor de botones
- ✅ Agregado botón `.btn-marcar-leida` con estilos visual diferenciado
- ✅ Responsive y consistente con el diseño existente

```css
.notification-item-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-marcar-leida {
  padding: 10px 20px;
  background-color: #f5f5dc;
  color: var(--verde-principal);
  border: 2px solid var(--verde-medio);
  border-radius: 6px;
  transition: all 0.3s ease;
}
```

---

## 🔄 Flujo de Sincronización

### Antes (❌ Incorrecto)
```
1. API retorna todas las notificaciones (leídas + no leídas)
2. Usuario marca como leído → Se elimina de la UI
3. Usuario recarga página → API retorna TODAS de nuevo
4. Las marcadas como leídas reaparecen ❌
```

### Después (✅ Correcto)
```
1. API retorna SOLO no leídas ✅
2. Usuario marca como leído → 
   a. Se elimina de la UI inmediatamente
   b. Se hace UPDATE en BD
   c. Se recarga la lista (sincronización)
3. Usuario recarga página → API retorna SOLO no leídas ✅
4. Las marcadas como leídas NO reaparecen ✅
```

---

## 📊 Resultado

### Antes
```
Notificaciones mostradas: 30 (todas, leídas + no leídas)
Al marcar como leído: Desaparece
Al recargar: Vuelve a aparecer ❌
Contador: Siempre 30
```

### Después
```
Notificaciones mostradas: Solo no leídas (ej: 5-10)
Al marcar como leído: Desaparece y se recarga la lista
Al recargar: No reaparece ✅
Contador: Se actualiza correctamente
Botón "Ver más": Siempre visible ✅
```

---

## 🧪 Cómo Probar

### Test 1: Verificar que solo se cargan no leídas
```
1. Abre la app
2. Click en campana de notificaciones
3. Verifica que el número sea pequeño (ej: 5-10, no 30)
4. Recarga la página
5. El número sigue siendo el mismo ✅
```

### Test 2: Marcar como leído
```
1. Click en "Marcar como leída" en cualquier notificación
2. Desaparece inmediatamente ✅
3. Recarga la página
4. La notificación NO reaparece ✅
```

### Test 3: Botón "Ver más"
```
1. Click en campana
2. El botón "Ver más" siempre está visible ✅
3. Click en "Ver más" → Abre NotificationsPage con todas
```

### Test 4: NotificationsPage
```
1. Abre /notifications
2. Verifica que solo muestra no leídas por defecto
3. Click en "Marcar como leída"
4. Se elimina de la lista
5. Recarga página → No reaparece ✅
```

---

## 🔗 Endpoints Afectados

### GET /api/notifications/user/:userId
**Cambios:**
- Nuevo parámetro query: `unreadOnly` (boolean)
- Por defecto: devuelve TODAS (backward compatible)
- Con `?unreadOnly=true`: devuelve SOLO no leídas

**Ejemplo:**
```
GET /api/notifications/user/123?unreadOnly=true&limit=20
```

### PUT /api/notifications/read
**Sin cambios** - Mantiene la misma funcionalidad

---

## ✨ Beneficios

1. **Mejora UX**: El usuario ve menos notificaciones (solo las importantes)
2. **Consistencia**: Lo que marca como leído no reaparece
3. **Performance**: Menos datos en la API
4. **Usabilidad**: Botón "Ver más" siempre disponible
5. **Sincronización**: La UI siempre refleja el estado real de la BD

---

## 📝 Notas Técnicas

- ✅ Backward compatible: parámetro `unreadOnly` es opcional
- ✅ Parámetros query: Convertidos correctamente de string a boolean
- ✅ Recarga automática: Usa timeout de 300ms para evitar race conditions
- ✅ CSS responsive: Funciona en móvil, tablet y desktop

---

## 🚀 Estado

**Status**: ✅ COMPLETO
**Tested**: Local en desarrollo
**Ready**: Para QA y Producción

---

**Fecha**: 13 de Noviembre de 2025
**Rama**: QA_Merge
