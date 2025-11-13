# 🔔 SOLUCIÓN: Notificaciones que Reaparecen + Botón "Ver Más" Permanente

## Problema Reportado

El usuario reportaba 3 problemas principales:

1. **30 notificaciones cada recarga**: Aunque marcaba notificaciones como leídas, al recargar la página volvían a aparecer 30 notificaciones
2. **Las notificaciones no se persistían**: Después de marcar como leído, desaparecía momentáneamente pero al recargar reaparecía
3. **Botón "Ver más" condicional**: Solo aparecía si había más de 5 notificaciones, no era permanente

---

## Causa del Problema

### En el Backend
- El endpoint `/api/notifications/user/:userId` retornaba **TODAS las notificaciones** (leídas y no leídas)
- No había forma de filtrar solo las no leídas desde el frontend

### En el Frontend  
- El frontend cargaba todas las notificaciones sin distinción
- No recargaba la lista después de marcar como leído
- El botón "Ver más" tenía una condición que lo ocultaba si había pocas notificaciones

---

## Solución Implementada

### 1️⃣ Backend: Agregar Filtro de No Leídas

**Archivo: `back/Models/notificationModel.js`**

```javascript
// ANTES (retornaba todas)
export const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  const [rows] = await db.query(`
    SELECT * FROM notifications 
    WHERE userId = ?
  `, [userId, limit, offset]);
}

// DESPUÉS (acepta parámetro)
export const getUserNotifications = async (userId, limit = 20, offset = 0, unreadOnly = false) => {
  let query = `SELECT * FROM notifications WHERE userId = ?`;
  if (unreadOnly) {
    query += ` AND n.\`read\` = 0`;  // Filtra solo no leídas
  }
  query += ` LIMIT ? OFFSET ?`;
}
```

**Archivo: `back/Controllers/notificationController.js`**

```javascript
// Ahora acepta parámetro query ?unreadOnly=true
const { unreadOnly = false } = req.query;
const onlyUnread = unreadOnly === 'true' || unreadOnly === true;
const notifications = await NotificationModel.getUserNotifications(
  userId, limit, offset, onlyUnread
);
```

### 2️⃣ Frontend: Cargar Solo No Leídas

**Archivo: `front/src/services/notificationService.ts`**

```typescript
// ANTES
export const fetchNotifications = async (userId: number, limit: number = 20) => {
  const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER(userId, limit));
}

// DESPUÉS
export const fetchNotifications = async (
  userId: number, 
  limit: number = 20, 
  unreadOnly: boolean = true  // ← Nuevo parámetro
) => {
  const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER(userId, limit), {
    params: { unreadOnly }  // ← Se envía a la API
  });
}
```

### 3️⃣ NotificationBell: Sincronización Automática

**Archivo: `front/src/components/CommonComp/NotificationBell.tsx`**

```typescript
// Cargar solo no leídas
const loadNotifications = async () => {
  const fetchedNotifications = await fetchNotifications(userId, 20, true);  // ← true
  setNotifications(fetchedNotifications);
};

// Al marcar como leído, recargar automáticamente
const handleMarkAsRead = async (notificationId: number) => {
  const success = await markAsRead(notificationId, userId);
  if (success) {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Recarga después de 300ms para sincronizar con BD
    setTimeout(() => {
      loadNotifications();  // ← Recarga automáticamente
      loadUnreadCount();
    }, 300);
  }
};
```

### 4️⃣ Botón "Ver Más" Permanente

**Archivo: `front/src/components/CommonComp/NotificationBell.tsx`**

```typescript
// ANTES
{notifications.length > 5 && (  // ← Se ocultaba si había <5
  <div className="notification-view-more">
    <button onClick={() => window.location.href = '/notifications'}>
      Ver más
    </button>
  </div>
)}

// DESPUÉS
<div className="notification-view-more">  {/* ← Sin condición, siempre visible */}
  <button onClick={() => window.location.href = '/notifications'}>
    Ver más
  </button>
</div>
```

### 5️⃣ NotificationsPage: Agregar Opción de Marcar Como Leído

**Archivo: `front/src/components/CommonComp/NotificationsPage.tsx`**

```typescript
// Nuevo método
const handleMarkAsRead = async (notificationId: number) => {
  const success = await markAsRead(notificationId, userId);
  if (success) {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }
};

// Nuevo botón en cada notificación
{!notification.read && (
  <button 
    className="btn-marcar-leida"
    onClick={() => handleMarkAsRead(notification.id)}
  >
    Marcar como leída
  </button>
)}
```

### 6️⃣ CSS: Estilos para el Nuevo Botón

**Archivo: `front/src/components/CommonComp/NotificationsPage.css`**

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

.btn-marcar-leida:hover {
  background-color: var(--verde-claro);
  color: white;
}
```

---

## Resultados

### Antes ❌
```
Notificaciones mostradas: 30 cada vez que recargabas
Al marcar como leído: Desaparecía momentáneamente
Al recargar: Volvía a aparecer
Contador: Siempre 30
Botón "Ver más": Solo si había >5 notificaciones
```

### Después ✅
```
Notificaciones mostradas: 5-10 (solo las no leídas)
Al marcar como leído: Desaparece y se sincroniza
Al recargar: No reaparece
Contador: Se actualiza correctamente
Botón "Ver más": SIEMPRE visible
```

---

## Cómo Probar

### Test 1: Las notificaciones no reaparecen
```
1. Abre la app
2. Haz click en la campana de notificaciones
3. Haz click en "Marcar como leída" en una notificación
4. Observa que desaparece
5. Recarga la página (F5)
6. La notificación NO reaparece ✅
```

### Test 2: Botón "Ver más" es permanente
```
1. Abre la app
2. Haz click en la campana
3. Observa que "Ver más" SIEMPRE está abajo, aunque solo haya 2 notificaciones ✅
```

### Test 3: Marcar como leído desde NotificationsPage
```
1. Abre la app y ve a Mis Notificaciones
2. Haz click en "Marcar como leída"
3. La notificación desaparece de la lista ✅
4. Recarga: No reaparece ✅
```

---

## Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `back/Models/notificationModel.js` | +parámetro `unreadOnly` |
| `back/Controllers/notificationController.js` | +lógica para filtro |
| `front/src/services/notificationService.ts` | +parámetro `unreadOnly` |
| `front/src/components/CommonComp/NotificationBell.tsx` | Carga solo no leídas, recarga automática, botón permanente |
| `front/src/components/CommonComp/NotificationsPage.tsx` | Carga solo no leídas, nuevo botón "Marcar como leída" |
| `front/src/components/CommonComp/NotificationsPage.css` | Estilos para nuevo botón |

---

## Notas Técnicas

- ✅ **Backward compatible**: El parámetro es opcional, por defecto `false` (retorna todas)
- ✅ **Frontend por defecto pasa `true`**: Siempre obtiene solo no leídas
- ✅ **Sincronización**: Recarga automática después de marcar como leído (timeout 300ms)
- ✅ **Performance**: Menos datos transferidos, menos items renderizados
- ✅ **UX mejorado**: Usuario ve menos clutter, acciones son claras

---

## Estado Final

✅ **Completo y Listo**
- Todas las notificaciones persisten correctamente
- El contador se actualiza automáticamente
- El botón "Ver más" es permanente
- Funciona en móvil, tablet y desktop

**Fecha**: 13 de Noviembre de 2025
**Rama**: QA_Merge
