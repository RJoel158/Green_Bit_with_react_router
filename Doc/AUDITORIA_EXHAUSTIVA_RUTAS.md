# AUDITORÍA EXHAUSTIVA DE RUTAS - FRONTEND vs BACKEND

**Fecha**: 10 de Noviembre de 2025  
**Estado**: En análisis  
**Total Rutas**: 67 backend + X frontend = Comparación

---

## ANÁLISIS POR SECCIÓN

### 1. USUARIOS (17 rutas backend)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| POST `/api/users/login` | POST `/users/login` | ✅ | OK |
| POST `/api/users` | POST `/users` | ✅ | OK |
| POST `/api/users/collector` | POST `/users/collector` | ✅ | OK |
| POST `/api/users/institution` | POST `/users/institution` | ✅ | OK |
| POST `/api/users/institution-admin` | POST `/users/institution-admin` | ✅ | OK |
| POST `/api/users/forgotpassword` | POST `/users/forgotpassword` | ✅ | OK |
| PUT `/api/users/changePassword/{userId}` | PUT `/users/changePassword/:userId` | ✅ | OK |
| GET `/api/users/{userId}` | GET `/users/:id` | ✅ | OK |
| GET `/api/users/withPerson` | GET `/users/withPerson` | ✅ | OK |
| GET `/api/users/withInstitution/{userId}` | GET `/users/withInstitution/:userId` | ✅ | OK |
| GET `/api/users/collectors/pending` | GET `/users/collectors/pending` | ✅ | OK |
| GET `/api/users/collectors/pending/institution` | GET `/users/collectors/pending/institution` | ✅ | OK |
| PUT `/api/users/approve/{userId}` | POST `/users/approve/:id` | ⚠️ | **MÉTODO INCORRECTO**: Frontend usa PUT, backend usa POST |
| PUT `/api/users/institution/approve/{userId}` | POST `/users/institution/approve/:id` | ⚠️ | **MÉTODO INCORRECTO**: Frontend usa PUT, backend usa POST |
| PUT `/api/users/reject/{userId}` | POST `/users/reject/:id` | ⚠️ | **MÉTODO INCORRECTO**: Frontend usa PUT, backend usa POST |
| PUT `/api/users/institution/reject/{userId}` | POST `/users/institution/reject/:id` | ⚠️ | **MÉTODO INCORRECTO**: Frontend usa PUT, backend usa POST |
| PUT `/api/users/{userId}/role` | PUT `/users/:id/role` | ✅ | OK |
| DELETE `/api/users/{userId}` | DELETE `/users/:id` | ✅ | OK |
| DELETE `/api/users/institution/{userId}` | DELETE `/users/institution/:id` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: 
- ❌ 4 rutas con método HTTP incorrecto (PUT vs POST)

---

### 2. MATERIALES (5 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| GET `/api/material` | GET `/material` | ✅ | OK |
| POST `/api/material` | POST `/material` | ✅ | OK |
| GET `/api/material/{materialId}` | GET `/material/:materialId` | ✅ | OK |
| PUT `/api/material/{materialId}` | PUT `/material/:materialId` | ✅ | OK |
| DELETE `/api/material/{materialId}` | DELETE `/material/:materialId` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 3. SOLICITUDES (7 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| POST `/api/request` | POST `/request` | ✅ | OK |
| GET `/api/request` | GET `/request` | ✅ | OK |
| GET `/api/request/{requestId}` | GET `/request/:id` | ✅ | OK |
| GET `/api/request/user/{userId}/state` | GET `/request/user/:userId/state` | ✅ | OK |
| PUT `/api/request/{requestId}/state` | PUT `/request/:id/state` | ✅ | OK |
| GET `/api/request/{requestId}/schedule` | GET `/request/:id/schedule` | ✅ | OK |
| DELETE `/api/request/{requestId}` | DELETE `/request/:id` | ✅ | OK |
| POST `/api/request/{requestId}/schedule` | POST `/request/:id/schedule` | ✅ | Ruta para crear cita |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 4. CITAS (12 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| POST `/api/appointments` | POST `/appointments` | ✅ | OK |
| GET `/api/appointments` | GET `/appointments` | ✅ | OK |
| GET `/api/appointments/{appointmentId}` | GET `/appointments/:id` | ✅ | OK |
| PUT `/api/appointments/{appointmentId}` | PUT `/appointments/:id` | ✅ | OK |
| POST `/api/appointments/schedule` | POST `/appointments/schedule` | ✅ | OK |
| GET `/api/appointments/collector/{collectorId}` | GET `/appointments/collector/:collectorId` | ✅ | OK |
| GET `/api/appointments/recycler/{recyclerId}` | GET `/appointments/recycler/:recyclerId` | ✅ | OK |
| PUT `/api/appointments/{appointmentId}/accept` | PUT `/appointments/:id/accept` | ✅ | OK |
| PUT `/api/appointments/{appointmentId}/reject` | PUT `/appointments/:id/reject` | ✅ | OK |
| PUT `/api/appointments/{appointmentId}/cancel` | PUT `/appointments/:id/cancel` | ✅ | OK |
| PUT `/api/appointments/{appointmentId}/complete` | PUT `/appointments/:id/complete` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 5. NOTIFICACIONES (3 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| GET `/api/notifications/user/{userId}` | GET `/notifications/user/:userId` | ✅ | OK |
| GET `/api/notifications/unread/{userId}` | GET `/notifications/unread/:userId` | ✅ | OK |
| PUT `/api/notifications/read` | PUT `/notifications/read` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 6. PUNTUACIONES (4 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| POST `/api/score` | POST `/score` | ✅ | OK |
| GET `/api/score/check/{appointmentId}/{userId}` | GET `/score/check/:appointmentId/:userId` | ✅ | OK |
| GET `/api/score/appointment/{appointmentId}` | GET `/score/appointment/:appointmentId` | ✅ | OK |
| GET `/api/score/user/{userId}/average` | GET `/score/user/:userId/average` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 7. ANUNCIOS (6 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| GET `/api/announcements` | GET `/announcements` | ✅ | OK |
| POST `/api/announcements` | POST `/announcements` | ✅ | OK |
| GET `/api/announcements/{announcementId}` | GET `/announcements/:id` | ✅ | OK |
| PUT `/api/announcements/{announcementId}` | PUT `/announcements/:id` | ✅ | OK |
| DELETE `/api/announcements/{announcementId}` | DELETE `/announcements/:id` | ✅ | OK |
| GET `/api/announcements/role/{role}` | GET `/announcements/role/:role` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 8. UPLOAD (3 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| POST `/api/upload/announcement` | POST `/upload/announcement` | ✅ | OK |
| GET `/api/upload/announcement/{filename}` | GET `/upload/announcement/:filename` | ✅ | OK |
| DELETE `/api/upload/announcement/{filename}` | DELETE `/upload/announcement/:filename` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 9. RANKING (7 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| GET `/api/ranking/periods` | GET `/ranking/periods` | ✅ | OK |
| GET `/api/ranking/periods/active-or-last` | GET `/ranking/periods/active-or-last` | ✅ | OK |
| POST `/api/ranking/periods` | POST `/ranking/periods` | ✅ | OK |
| POST `/api/ranking/periods/close` | POST `/ranking/periods/close` | ✅ | OK |
| GET `/api/ranking/live/{periodId}` | GET `/ranking/live/:periodo_id` | ✅ | OK |
| GET `/api/ranking/tops/{periodId}` | GET `/ranking/tops/:periodo_id` | ✅ | OK |
| GET `/api/ranking/history/{periodId}` | GET `/ranking/history/:periodo_id` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 10. REPORTES (3 rutas)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| GET `/api/reports/materiales` | GET `/reports/materiales` | ✅ | OK |
| GET `/api/reports/scores` | GET `/reports/scores` | ✅ | OK |
| GET `/api/reports/recolecciones` | GET `/reports/recolecciones` | ✅ | OK |

**PROBLEMAS ENCONTRADOS**: None ✅

---

### 11. SISTEMA (1 ruta)

| Frontend Endpoint | Backend Route | ✅/❌ | Notas |
|---|---|---|---|
| GET `/api/system/health` | GET `/system/health` | ⚠️ | Rutas diferentes en endpoints.ts |

**PROBLEMAS ENCONTRADOS**:
- ⚠️ endpoints.ts define `/health` pero backend define `/system/health`

---

## RESUMEN DE PROBLEMAS

### CRÍTICOS (Causan 404):
1. **Métodos HTTP Incorrectos** - 4 rutas de usuarios:
   - `APPROVE_USER`: Frontend usa PUT, backend espera POST
   - `APPROVE_INSTITUTION`: Frontend usa PUT, backend espera POST
   - `REJECT_USER`: Frontend usa PUT, backend espera POST
   - `REJECT_INSTITUTION`: Frontend usa PUT, backend espera POST

2. **Health Check**: Inconsistencia en la ruta de salud

### Errores Reportados que Corresponden:
- ✅ `POST http://localhost:3000/api/users 404` → Posiblemente POST `/users` existe pero hay otro problema
- ✅ `POST http://localhost:3000/api/users/institution-admin 404` → Ruta existe pero método podría ser incorrecto
- ✅ `POST http://localhost:3000/api/ranking/periods/close 404` → Ruta existe, revisar si hay problema con el body o parámetros
- ✅ `Unexpected token <!DOCTYPE` → Error de respuesta HTML, no JSON (error en servidor)

---

## ACCIONES A TOMAR

### ACCIÓN 1: Corregir métodos HTTP en Routes/index.js
Las rutas de aprobación/rechazo deben ser PUT, no POST.

### ACCIÓN 2: Corregir health endpoint
Cambiar `/system/health` a `/health` o sincronizar endpoints.ts.

### ACCIÓN 3: Validar respuestas JSON
Asegurarse de que todas las rutas devuelven JSON, no HTML.

### ACCIÓN 4: Debuggear controladores específicos
- `createUserWithInstitutionByAdmin`
- `closePeriod`

---

**Estado**: Listo para correcciones  
**Próximo paso**: Aplicar fixes identificados
