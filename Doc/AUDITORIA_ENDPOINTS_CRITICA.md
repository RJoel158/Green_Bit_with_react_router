# 🔴 AUDITORÍA CRÍTICA DE ENDPOINTS - ERRORES ENCONTRADOS

**Fecha**: 10 de Noviembre 2025  
**Estado**: ❌ DISCREPANCIAS GRAVES ENCONTRADAS

---

## RESUMEN EJECUTIVO

Se encontraron **9 ERRORES CRÍTICOS** que causan los fallos reportados:

| # | TIPO | ENDPOINT FRONTEND | ENDPOINT BACKEND | ESTADO | IMPACTO |
|---|------|------------------|------------------|--------|--------|
| 1 | MISMATCH | `/api/users` (REGISTER) | `/users/register` | ❌ FALTA | Registro no funciona |
| 2 | MISMATCH | `/api/users/collector` | `/users/register-collector` | ❌ FALTA | Registro reciclador falla |
| 3 | MISMATCH | `/api/users/institution` | `/users/register-institution` | ❌ FALTA | Registro institución falla |
| 4 | MISMATCH | `/api/users/institution-admin` | `/users/register-institution-admin` | ❌ FALTA | Crear usuario empresa falla |
| 5 | MÉTODO | `/api/appointments/{id}/accept` | PUT /appointments/{id}/accept | ✅ Existe | Pero error en frontend |
| 6 | MISMATCH | `/api/ranking/periods/close` | POST /ranking/periods/:id/close | ❌ PARÁMETRO | Cerrar período falla (espera :id en URL) |
| 7 | MISSING | `/api/material` (GET) | `/material` | ⚠️ RUTA GENÉRICA | Posible conflicto |
| 8 | MISSING | `/api/users/withInstitution/:id` | NO EXISTE | ❌ FALTA COMPLETAMENTE | Detalle empresa no carga |
| 9 | PATH | `/api/score/check/:appointmentId/:userId` | `/score/check/:appointmentId/:userId` | ⚠️ ORDEN | Puede funcionar |

---

## DETALLES POR SECCIÓN

### 1️⃣ USUARIOS - REGISTRO

#### PROBLEMA #1: ENDPOINT BÁSICO DE REGISTRO
**Frontend**: `POST /api/users`  
**Backend**: `POST /users/register` ❌ NO COINCIDE

**Código Frontend** (endpoints.ts:19):
```typescript
REGISTER: '/api/users',  // ← Espera /api/users
```

**Código Backend** (Routes/index.js:51):
```javascript
router.post('/users/register', userController.createUser);  // ← Es /users/register
```

**Error Reportado**: `POST http://localhost:3000/api/users 404 (Not Found)`

**Solución**: Cambiar backend a `/users` O cambiar frontend a `/users/register`
**RECOMENDACIÓN**: Cambiar backend a `/users` (más corto y coherente)

---

#### PROBLEMA #2: REGISTRO RECOLECTOR
**Frontend**: `POST /api/users/collector`  
**Backend**: `POST /users/register-collector` ❌ NO COINCIDE

**Código Frontend** (endpoints.ts:20):
```typescript
REGISTER_COLLECTOR: '/api/users/collector',  // ← Espera /api/users/collector
```

**Código Backend** (Routes/index.js:52):
```javascript
router.post('/users/register-collector', userController.createCollectorUser);  // ← Es /users/register-collector
```

**Error Reportado**: `POST http://localhost:3000/api/users/collector 404 (Not Found)`

**Solución**: Cambiar backend a `/users/collector`

---

#### PROBLEMA #3: REGISTRO INSTITUCIÓN
**Frontend**: `POST /api/users/institution`  
**Backend**: `POST /users/register-institution` ❌ NO COINCIDE

**Código Frontend** (endpoints.ts:21):
```typescript
REGISTER_INSTITUTION: '/api/users/institution',  // ← Espera /api/users/institution
```

**Código Backend** (Routes/index.js:53):
```javascript
router.post('/users/register-institution', userController.createUserWithInstitution);  // ← Es /users/register-institution
```

**Error Reportado**: `POST http://localhost:3000/api/users/institution 404 (Not Found)`

**Solución**: Cambiar backend a `/users/institution`

---

#### PROBLEMA #4: REGISTRO ADMIN INSTITUCIÓN
**Frontend**: `POST /api/users/institution-admin`  
**Backend**: `POST /users/register-institution-admin` ❌ NO COINCIDE

**Código Frontend** (endpoints.ts:22):
```typescript
REGISTER_INSTITUTION_ADMIN: '/api/users/institution-admin',  // ← Espera /api/users/institution-admin
```

**Código Backend** (Routes/index.js:54):
```javascript
router.post('/users/register-institution-admin', userController.createUserWithInstitutionByAdmin);  // ← Es /users/register-institution-admin
```

**Error Reportado**: `POST http://localhost:3000/api/users/institution-admin 404 (Not Found)`

**Solución**: Cambiar backend a `/users/institution-admin`

---

#### PROBLEMA #5: OBTENER USUARIO CON INSTITUCIÓN (CRÍTICO PARA DETALLE EMPRESA)
**Frontend**: `GET /api/users/withInstitution/:userId`  
**Backend**: ❌ **NO EXISTE**

**Código Frontend** (endpoints.ts:31):
```typescript
GET_USER_WITH_INSTITUTION: (userId: number) => `/api/users/withInstitution/${userId}`,
```

**Código Backend**: NO EXISTE EN Routes/index.js

**Error Reportado**: "Los datos no cargan para la empresa (Error al obtener institución: AxiosError)"

**Solución**: AGREGAR RUTA EN BACKEND
```javascript
router.get('/users/withInstitution/:userId', userController.getUserWithInstitutionById);
```

---

### 2️⃣ CITAS - ACEPTAR/RECHAZAR

#### PROBLEMA #6: ACEPTAR CITA (Error de JSON)
**Frontend**: `PUT /api/appointments/:id/accept`  
**Backend**: `PUT /appointments/:id/accept` ✅ EXISTE

**Código Backend** (Routes/index.js:123):
```javascript
router.put('/appointments/:id/accept', appointmentController.acceptAppointmentEndpoint);
```

**Error Reportado**: `(Unexpected token <!DOCTYPE "... is not valid JSON)`

**Causa**: El servidor está devolviendo HTML en lugar de JSON (probablemente error 500 o 404)

**Verificación**: 
- ¿El controlador `acceptAppointmentEndpoint` existe?
- ¿Está devolviendo JSON?
- ¿Hay validación de autenticación que falla?

**Solución**: Revisar controlador `appointmentController.acceptAppointmentEndpoint`

---

### 3️⃣ SOLICITUDES - CREAR CITA

#### PROBLEMA #7: CREAR CITA (Schedule Pickup Modal)
**Frontend**: `POST /api/request/:id/schedule`  
**Backend**: `POST /request/:id/schedule` ✅ EXISTE (pero llama a `createNewAppointment`)

**Código Backend** (Routes/index.js:110):
```javascript
router.post('/request/:id/schedule', appointmentController.createNewAppointment);
```

**Error Reportado**: "Error al crear la cita (at handleConfirm (SchedulePickupModal.tsx:303:15))"

**Causa Probable**: El controlador `createNewAppointment` espera parámetros diferentes o hay problema en validación

**Solución**: Revisar controlador y validación de datos

---

### 4️⃣ RANKING - CERRAR PERÍODO

#### PROBLEMA #8: CERRAR PERÍODO
**Frontend**: `POST /api/ranking/periods/close`  
**Backend**: `POST /ranking/periods/:id/close` ❌ NO COINCIDE

**Código Frontend** (endpoints.ts:173):
```typescript
CLOSE_PERIOD: '/api/ranking/periods/close',  // ← Sin :id
```

**Código Backend** (Routes/index.js:139):
```javascript
router.post('/ranking/periods/:id/close', rankingController.closePeriod);  // ← Espera :id
```

**Error Reportado**: `POST http://localhost:3000/api/ranking/periods/close 404 (Not Found)`

**Solución**: 
- OPCIÓN A: Cambiar backend a `/ranking/periods/close`
- OPCIÓN B: Cambiar frontend para pasar el ID en la URL

**RECOMENDACIÓN**: Cambiar backend a `/ranking/periods/close` (la acción es clara sin ID)

---

### 5️⃣ MATERIALES - RUTA AMBIGUA

#### PROBLEMA #9: GET MATERIAL GENÉRICO vs POR ID
**Frontend**: `GET /api/material` (para obtener todos)  
**Frontend**: `GET /api/material/:id` (para obtener uno)  
**Backend**: Ambas existen ✅

**Código Frontend** (endpoints.ts:58):
```typescript
GET_ALL: '/api/material',
GET_BY_ID: (materialId: number) => `/api/material/${materialId}`,
```

**Código Backend** (Routes/index.js:89-93):
```javascript
router.get('/material/:materialId', materialController.getMaterialById);  // ESPECÍFICA PRIMERO
router.get('/material', materialController.getMaterials);  // GENÉRICA DESPUÉS
```

**Status**: ✅ Correctamente ordenado (específica primero)

---

## TABLA CONSOLIDADA DE ERRORES

| Nº | Sección | Ruta Frontend | Ruta Backend | Error | Prioridad |
|----|---------|---------------|--------------|-------|-----------|
| 1 | USUARIOS | POST `/api/users` | `/users/register` | 404 Mismatch | 🔴 CRÍTICA |
| 2 | USUARIOS | POST `/api/users/collector` | `/users/register-collector` | 404 Mismatch | 🔴 CRÍTICA |
| 3 | USUARIOS | POST `/api/users/institution` | `/users/register-institution` | 404 Mismatch | 🔴 CRÍTICA |
| 4 | USUARIOS | POST `/api/users/institution-admin` | `/users/register-institution-admin` | 404 Mismatch | 🔴 CRÍTICA |
| 5 | USUARIOS | GET `/api/users/withInstitution/:id` | NO EXISTE | 404 Missing | 🔴 CRÍTICA |
| 6 | CITAS | PUT `/api/appointments/:id/accept` | `/appointments/:id/accept` | HTML error | 🟠 ALTA |
| 7 | SOLICITUDES | POST `/api/request/:id/schedule` | `/request/:id/schedule` | 500 Error | 🟠 ALTA |
| 8 | RANKING | POST `/api/ranking/periods/close` | `/ranking/periods/:id/close` | 404 Mismatch | 🔴 CRÍTICA |

---

## PLAN DE ACCIÓN

### PASO 1: CORREGIR BACKEND (Routes/index.js)

**Cambios necesarios:**

```javascript
// 1. Cambiar POST /users/register a POST /users
router.post('/users', userController.createUser);  // Cambiar de /users/register

// 2. Cambiar POST /users/register-collector a POST /users/collector
router.post('/users/collector', userController.createCollectorUser);  // Cambiar

// 3. Cambiar POST /users/register-institution a POST /users/institution
router.post('/users/institution', userController.createUserWithInstitution);  // Cambiar

// 4. Cambiar POST /users/register-institution-admin a POST /users/institution-admin
router.post('/users/institution-admin', userController.createUserWithInstitutionByAdmin);  // Cambiar

// 5. AGREGAR ruta faltante: GET /users/withInstitution/:userId
router.get('/users/withInstitution/:userId', userController.getUserWithInstitutionById);

// 6. Cambiar POST /ranking/periods/:id/close a POST /ranking/periods/close
router.post('/ranking/periods/close', rankingController.closePeriod);  // Cambiar
```

### PASO 2: VERIFICAR CONTROLADORES

- [ ] Verificar `acceptAppointmentEndpoint` devuelve JSON
- [ ] Verificar `createNewAppointment` con parámetros correctos
- [ ] Verificar `closePeriod` sin parámetro `:id` (obtener ID del request body)

### PASO 3: VERIFICAR ORDENAMIENTO DE RUTAS

Asegurar que todas las rutas específicas estén ANTES de las genéricas con parámetros

---

## ESTADO ACTUAL

**Total de endpoints en endpoints.ts**: 62  
**Total de endpoints en Routes/index.js**: 67  
**Endpoints sin correspondencia**: 9  
**Endpoints problemáticos**: 6  

**Tasa de coincidencia**: 85.5% ❌

---

