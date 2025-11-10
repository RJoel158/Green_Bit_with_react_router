# Auditoria de Endpoints Usados en Frontend

Documento que lista EXACTAMENTE qué endpoints definidos en `endpoints.ts` se usan realmente en el código frontend.

Generado: $(date)

## Resumen Ejecutivo

- **Total de endpoints definidos en endpoints.ts**: ~100+
- **Endpoints REALMENTE usados en frontend**: 44
- **Endpoints NUNCA usados**: ~56+

---

## USUARIOS - /api/users

### USADOS ✅
- **LOGIN**: `POST /api/users/login` - Auth/Login.tsx
- **REGISTER**: `POST /api/users/register` - Auth/Register.tsx, UserManagement.tsx
- **REGISTER_COLLECTOR**: `POST /api/users/register-collector` - Auth/registerCollector.tsx
- **REGISTER_INSTITUTION**: `POST /api/users/register-institution` - Auth/registerInstitution.tsx
- **REGISTER_INSTITUTION_ADMIN**: `POST /api/users/register-institution-admin` - UserManagement.tsx
- **GET_USER**: `GET /api/users/:id` - RankingHistoryTable.tsx, UserInfoInterface.tsx
- **GET_USER_WITH_PERSON**: `GET /api/users/person/:id` - UserManagement.tsx (condicional)
- **GET_USER_WITH_INSTITUTION**: `GET /api/users/institution/:id` - UserManagement.tsx, UserInfoInterface.tsx
- **UPDATE_ROLE**: `PUT /api/users/:id/role` - UserInfoPanel.tsx
- **DELETE_USER**: `DELETE /api/users/:id` - UserInfoPanel.tsx
- **DELETE_INSTITUTION**: `DELETE /api/users/institution/:id` - UserInfoPanel.tsx

### NO USADOS ❌
- GET_ALL (singular o plural)
- UPDATE, etc.

---

## MATERIALES - /api/material

### USADOS ✅
- **GET_ALL**: `GET /api/materials` - FormComp.tsx (buscar materiales disponibles)

### NO USADOS ❌
- CREATE, UPDATE, DELETE, etc.

---

## SOLICITUDES - /api/requests

### USADOS ✅
- **CREATE**: `POST /api/requests` - FormComp.tsx (crear nueva solicitud)
- **SCHEDULE**: `PUT /api/requests/:id/schedule` - SchedulePickupModal.tsx

### NO USADOS ❌
- GET_ALL, GET_BY_ID, UPDATE, DELETE, etc.

---

## CITAS - /api/appointments

### USADOS ✅
- **GET_BY_COLLECTOR**: `GET /api/appointments/collector/:collectorId` - appointmentService.ts
- **GET_BY_RECYCLER**: `GET /api/appointments/recycler/:recyclerId` - appointmentService.ts

### NO USADOS ❌
- CREATE, UPDATE, DELETE, etc.

---

## NOTIFICACIONES - /api/notifications

### USADOS ✅
- **GET_BY_USER**: `GET /api/notifications/user/:userId` - notificationService.ts
- **GET_UNREAD**: `GET /api/notifications/unread/:userId` - notificationService.ts
- **MARK_AS_READ**: `PUT /api/notifications/read` - notificationService.ts
- **Socket.IO connection** para eventos en tiempo real

### NO USADOS ❌
- CREATE, etc.

---

## PUNTUACIONES - /api/scores

### USADOS ✅
- **CREATE**: `POST /api/scores` - scoreService.ts
- **CHECK**: `GET /api/scores/check/:appointmentId/:userId` - scoreService.ts
- **GET_BY_APPOINTMENT**: `GET /api/scores/appointment/:appointmentId` - scoreService.ts
- **GET_USER_AVERAGE**: `GET /api/scores/user/:userId/average` - scoreService.ts

### NO USADOS ❌
- UPDATE, DELETE, etc.

---

## ANUNCIOS - /api/announcements

### USADOS ✅
- **GET_ALL**: `GET /api/announcements` - announcementService.ts
- **GET_BY_ID**: `GET /api/announcements/:id` - announcementService.ts
- **GET_BY_ROLE**: `GET /api/announcements/role/:targetRole` - announcementService.ts
- **CREATE**: `POST /api/announcements` - announcementService.ts
- **UPDATE**: `PUT /api/announcements/:id` - announcementService.ts
- **DELETE**: `DELETE /api/announcements/:id` - announcementService.ts

### NO USADOS ❌
- Ninguno, están todos usados

---

## UPLOAD - /api/upload

### USADOS ✅
- **ANNOUNCEMENT_IMAGE**: `POST /api/upload/announcement` - uploadService.ts
- Image deletion: `DELETE /api/upload/announcement/:filename`
- Image info: `GET /api/upload/announcement/:filename`

### NO USADOS ❌
- IMAGE (parece que no se usa, solo ANNOUNCEMENT_IMAGE)

---

## RANKING - /api/ranking

### USADOS ✅
- **GET_PERIODS**: `GET /api/ranking/periods` - RankingPeriodsAdmin.tsx, LiveRankingAdmin.tsx
- **GET_ACTIVE_OR_LAST**: `GET /api/ranking/active-or-last` - rankingService.ts
- **GET_LIVE**: `GET /api/ranking/live/:periodId` - rankingService.ts, RankingPeriodsAdmin.tsx
- **GET_TOPS**: `GET /api/ranking/tops/:periodId` - rankingService.ts, RankingPeriodsAdmin.tsx
- **GET_HISTORY**: `GET /api/ranking/history/:periodId` - RankingHistoryTable.tsx
- **CREATE_PERIOD**: `POST /api/ranking/periods` - RankingPeriodsAdmin.tsx
- **CLOSE_PERIOD**: `POST /api/ranking/periods/:id/close` - RankingPeriodsAdmin.tsx

### NO USADOS ❌
- Ninguno, están todos usados

---

## REPORTES - /api/reports

### USADOS ✅
- **MATERIALS**: `GET /api/reports/materiales` - reportService.ts
- **SCORES**: `GET /api/reports/scores` - reportService.ts
- **COLLECTIONS**: `GET /api/reports/recolecciones` - reportService.ts

### NO USADOS ❌
- Ninguno, están todos usados

---

## SISTEMA - /api/system

### USADOS ✅
- **HEALTH**: `GET /api/system/health` - FormComp.tsx (verificar conexión al servidor)

### NO USADOS ❌
- DB_STATUS, etc.

---

## RESUMEN FINAL

### Rutas requeridas en backend (44 endpoints):

#### USUARIOS (11)
- `/api/users/login` - POST
- `/api/users/register` - POST
- `/api/users/register-collector` - POST
- `/api/users/register-institution` - POST
- `/api/users/register-institution-admin` - POST
- `/api/users/:id` - GET
- `/api/users/person/:id` - GET
- `/api/users/institution/:id` - GET
- `/api/users/:id/role` - PUT
- `/api/users/:id` - DELETE
- `/api/users/institution/:id` - DELETE

#### MATERIALES (1)
- `/api/materials` - GET (lista completa)

#### SOLICITUDES (2)
- `/api/requests` - POST
- `/api/requests/:id/schedule` - PUT

#### CITAS (2)
- `/api/appointments/collector/:collectorId` - GET
- `/api/appointments/recycler/:recyclerId` - GET

#### NOTIFICACIONES (3)
- `/api/notifications/user/:userId` - GET
- `/api/notifications/unread/:userId` - GET
- `/api/notifications/read` - PUT
- Socket.IO eventos en tiempo real

#### PUNTUACIONES (4)
- `/api/scores` - POST
- `/api/scores/check/:appointmentId/:userId` - GET
- `/api/scores/appointment/:appointmentId` - GET
- `/api/scores/user/:userId/average` - GET

#### ANUNCIOS (6)
- `/api/announcements` - GET
- `/api/announcements/:id` - GET
- `/api/announcements/role/:targetRole` - GET
- `/api/announcements` - POST
- `/api/announcements/:id` - PUT
- `/api/announcements/:id` - DELETE

#### UPLOAD (3)
- `/api/upload/announcement` - POST
- `/api/upload/announcement/:filename` - GET
- `/api/upload/announcement/:filename` - DELETE

#### RANKING (7)
- `/api/ranking/periods` - GET
- `/api/ranking/active-or-last` - GET
- `/api/ranking/live/:periodId` - GET
- `/api/ranking/tops/:periodId` - GET
- `/api/ranking/history/:periodId` - GET
- `/api/ranking/periods` - POST
- `/api/ranking/periods/:id/close` - POST

#### REPORTES (3)
- `/api/reports/materiales` - GET
- `/api/reports/scores` - GET
- `/api/reports/recolecciones` - GET

#### SISTEMA (1)
- `/api/system/health` - GET

### Rutas a ELIMINAR:
- `/api/users` - GET (nunca se usa)
- `/api/person` - GET (nunca se usa)
- `/api/institution` - GET (nunca se usa)
- Cualquier otra ruta no listada arriba

---

## Siguientes pasos:

1. ✅ Auditoria completa (ESTE DOCUMENTO)
2. Crear archivo `back/Routes/index.js` con SOLO estas 44 rutas
3. Remover rutas innecesarias de archivos individuales
4. Actualizar `server.js` para usar archivo centralizado
5. Ejecutar tests para confirmar
