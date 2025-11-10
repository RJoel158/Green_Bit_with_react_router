# 🔄 GUÍA DE MIGRACIÓN - URLs Hardcodeadas a API Centralizada

## 📌 Objetivo

Reemplazar todas las llamadas hardcodeadas a la API por el sistema centralizado de endpoints.

---

## ✅ Pasos Completados

1. ✅ Creado `src/services/api.ts` con configuración de axios
2. ✅ Creado `src/config/endpoints.ts` con todos los endpoints
3. ✅ Actualizados servicios: `rankingService.ts`, `appointmentService.ts`
4. ✅ Creada documentación completa en `API_ENDPOINTS_COMPLETE.md`
5. ✅ Creada colección Thunder Client en `THUNDER_CLIENT_COLLECTION.json`
6. ✅ Actualizado `Login.tsx` como ejemplo

---

## 🔧 Cómo Migrar Componentes

### ❌ ANTES (Hardcoded con fetch)

```typescript
const response = await fetch("http://localhost:3000/api/users/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const data = await response.json();
```

### ✅ DESPUÉS (Centralizado con axios)

```typescript
import api from "../services/api";
import { API_ENDPOINTS } from "../config/endpoints";

const response = await api.post(API_ENDPOINTS.USERS.LOGIN, { email, password });
const data = response.data;
```

---

## 📝 Ejemplos por Tipo de Petición

### GET Simple

**Antes:**

```typescript
const res = await fetch("http://localhost:3000/api/users/collectors/pending");
const data = await res.json();
```

**Después:**

```typescript
const res = await api.get(API_ENDPOINTS.USERS.GET_COLLECTORS_PENDING);
const data = res.data;
```

### GET con Parámetros de Ruta

**Antes:**

```typescript
const res = await fetch(`http://localhost:3000/api/users/${userId}`);
const data = await res.json();
```

**Después:**

```typescript
const res = await api.get(API_ENDPOINTS.USERS.GET_USER(userId));
const data = res.data;
```

### GET con Query Params

**Antes:**

```typescript
const url = `http://localhost:3000/api/appointments/collector/${collectorId}?state=${state}&limit=${limit}`;
const res = await fetch(url);
```

**Después:**

```typescript
const res = await api.get(
  API_ENDPOINTS.APPOINTMENTS.GET_BY_COLLECTOR(collectorId),
  {
    params: { state, limit },
  }
);
```

### POST con Body

**Antes:**

```typescript
const res = await fetch("http://localhost:3000/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(userData),
});
```

**Después:**

```typescript
const res = await api.post(API_ENDPOINTS.USERS.REGISTER, userData);
```

### PUT

**Antes:**

```typescript
const res = await fetch(`http://localhost:3000/api/users/approve/${userId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
});
```

**Después:**

```typescript
const res = await api.put(API_ENDPOINTS.USERS.APPROVE_USER(userId));
```

### DELETE

**Antes:**

```typescript
const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
  method: "DELETE",
});
```

**Después:**

```typescript
const res = await api.delete(API_ENDPOINTS.USERS.DELETE_USER(userId));
```

---

## 📦 Componentes Pendientes de Migración

### Alta Prioridad

- [ ] `src/Auth/Register.tsx`
- [ ] `src/Auth/registerCollector.tsx`
- [ ] `src/Auth/registerInstitution.tsx`
- [ ] `src/components/UserManagementComp/UserManagement.tsx`
- [ ] `src/components/UserManagementComp/UserInfoPanel.tsx`
- [ ] `src/components/UserManagementComp/CreateUserModal.tsx`
- [ ] `src/components/CollectorRequestsComp/CollectorRequests.tsx`

### Media Prioridad

- [ ] `src/components/FormComps/FormComp.tsx`
- [ ] `src/components/SchedulePickupComp/SchedulePickupModal.tsx`
- [ ] `src/components/UserInfoComp/UserInfoInterface.tsx`
- [ ] `src/components/PasswordComp/ForgotPasswordModal.tsx`
- [ ] `src/components/PasswordComp/ChangePasswordModal.tsx`

### Baja Prioridad

- [ ] `src/components/AdminDashboardComp/PendingApprovals.tsx`
- [ ] `src/components/AdminDashboardComp/TopRecyclers.tsx`
- [ ] `src/components/AdminDashboardComp/TopCollectors.tsx`
- [ ] `src/components/AdminDashboardComp/RankingPeriodsAdmin.tsx`
- [ ] `src/components/AdminDashboardComp/RankingHistoryTable.tsx`

---

## 🎯 Beneficios

1. **Centralización**: Un solo lugar para cambiar URLs
2. **Type Safety**: TypeScript detecta errores en tiempo de desarrollo
3. **Consistencia**: Todas las llamadas usan el mismo patrón
4. **Interceptors**: Manejo automático de autenticación y errores
5. **Testing**: Más fácil de probar con URLs centralizadas
6. **Deployment**: Cambio de entorno solo en `.env`

---

## 🚀 Cómo Empezar

1. **Importa los módulos necesarios:**

```typescript
import api from "../services/api";
import { API_ENDPOINTS } from "../config/endpoints";
```

2. **Busca y reemplaza las llamadas fetch/axios hardcodeadas**

3. **Actualiza el manejo de respuestas:**

   - `response.json()` → `response.data`
   - `response.ok` → `response.status === 200`

4. **Usa try-catch para manejar errores** (axios lanza excepciones en errores HTTP)

---

## 🔍 Buscar URLs Hardcodeadas

Usa este comando en VS Code (Ctrl+Shift+F):

```
http://localhost:3000
```

O en terminal:

```bash
grep -r "http://localhost:3000" src/
```

---

## 📚 Referencias

- **Documentación completa:** `API_ENDPOINTS_COMPLETE.md`
- **Colección Thunder:** `THUNDER_CLIENT_COLLECTION.json`
- **Endpoints TypeScript:** `src/config/endpoints.ts`
- **Servicio API:** `src/services/api.ts`

---

**Última actualización:** Noviembre 6, 2025
