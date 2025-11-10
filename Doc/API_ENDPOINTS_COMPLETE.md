# 📋 API ENDPOINTS - GREENBIT RECYCLING

**Base URL:** `http://localhost:3000`  
**Versión:** 1.0.0  
**Fecha:** Noviembre 2025

---

## 📑 Índice

1. [Autenticación](#1-autenticación)
2. [Gestión de Usuarios](#2-gestión-de-usuarios)
3. [Materiales](#3-materiales)
4. [Solicitudes](#4-solicitudes)
5. [Citas](#5-citas)
6. [Notificaciones](#6-notificaciones)
7. [Puntuaciones](#7-puntuaciones)
8. [Anuncios](#8-anuncios)
9. [Ranking](#9-ranking)
10. [Reportes](#10-reportes)
11. [Upload](#11-upload)
12. [Sistema](#12-sistema)

---

## 1. Autenticación

### Login

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Registro de Usuario

```http
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "roleId": 3
}
```

### Registro de Recolector

```http
POST /api/users/collector
Content-Type: application/json

{
  "email": "collector@example.com",
  "password": "password123",
  "nombre": "Juan",
  "apellido": "Perez",
  "telefono": "123456789"
}
```

### Registro de Institución

```http
POST /api/users/institution
Content-Type: application/json

{
  "email": "institution@example.com",
  "password": "password123",
  "nombre": "Eco Institute",
  "direccion": "Av. Principal 123",
  "telefono": "987654321"
}
```

### Recuperar Contraseña

```http
POST /api/users/forgotpassword
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Cambiar Contraseña

```http
PUT /api/users/changePassword/:userId
Content-Type: application/json

{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

## 2. Gestión de Usuarios

### Obtener Usuario por ID

```http
GET /api/users/:userId
```

### Obtener Usuarios con Persona

```http
GET /api/users/withPerson
```

### Obtener Usuario con Institución

```http
GET /api/users/withInstitution/:userId
```

### Obtener Recolectores Pendientes

```http
GET /api/users/collectors/pending
```

### Obtener Recolectores Pendientes (Institución)

```http
GET /api/users/collectors/pending/institution
```

### Aprobar Usuario

```http
PUT /api/users/approve/:userId
```

### Aprobar Institución

```http
PUT /api/users/institution/approve/:userId
```

### Rechazar Usuario

```http
PUT /api/users/reject/:userId
```

### Rechazar Institución

```http
PUT /api/users/institution/reject/:userId
```

### Actualizar Rol de Usuario

```http
PUT /api/users/:userId/role
Content-Type: application/json

{
  "roleId": 2
}
```

### Eliminar Usuario

```http
DELETE /api/users/:userId
```

### Eliminar Institución

```http
DELETE /api/users/institution/:userId
```

---

## 3. Materiales

### Obtener Todos los Materiales

```http
GET /api/material
```

### Obtener Material por ID

```http
GET /api/material/:materialId
```

### Crear Material

```http
POST /api/material
Content-Type: application/json

{
  "name": "Plástico PET",
  "description": "Botellas de plástico",
  "unit": "kg"
}
```

### Actualizar Material

```http
PUT /api/material/:materialId
Content-Type: application/json

{
  "name": "Plástico PET",
  "description": "Botellas de plástico actualizadas"
}
```

### Eliminar Material

```http
DELETE /api/material/:materialId
```

---

## 4. Solicitudes

### Obtener Todas las Solicitudes

```http
GET /api/request
```

### Obtener Solicitud por ID

```http
GET /api/request/:requestId
```

### Obtener Solicitudes por Usuario y Estado

```http
GET /api/request/user/:userId/state?state=1
```

**Parámetros de Query:**

- `state` (opcional): Estado de la solicitud (1=Abierta, 2=En proceso, 3=Completada, 4=Cancelada)

### Crear Solicitud

```http
POST /api/request
Content-Type: application/json

{
  "userId": 1,
  "materialId": 1,
  "quantity": 10,
  "description": "Solicitud de recolección"
}
```

### Actualizar Estado de Solicitud

```http
PUT /api/request/:requestId/state
Content-Type: application/json

{
  "state": 2
}
```

### Obtener Horarios de Solicitud

```http
GET /api/request/:requestId/schedule
```

### Eliminar Solicitud

```http
DELETE /api/request/:requestId
```

---

## 5. Citas

### Obtener Todas las Citas

```http
GET /api/appointments
```

### Obtener Cita por ID

```http
GET /api/appointments/:appointmentId
```

### Obtener Citas por Recolector

```http
GET /api/appointments/collector/:collectorId?state=1&limit=10
```

**Parámetros de Query:**

- `state` (opcional): Estado de la cita (0=Pendiente, 1=Aceptada, 2=Completada, 3=Cancelada, 4=Rechazada)
- `limit` (opcional): Número máximo de resultados

### Obtener Citas por Reciclador

```http
GET /api/appointments/recycler/:recyclerId?state=1&limit=10
```

**Parámetros de Query:**

- `state` (opcional): Estado de la cita
- `limit` (opcional): Número máximo de resultados

### Crear Cita

```http
POST /api/appointments
Content-Type: application/json

{
  "requestId": 1,
  "collectorId": 2,
  "date": "2025-11-10",
  "hour": "14:00"
}
```

### Agendar Cita

```http
POST /api/appointments/schedule
Content-Type: application/json

{
  "requestId": 1,
  "scheduleId": 5,
  "collectorId": 2
}
```

### Aceptar Cita

```http
PUT /api/appointments/:appointmentId/accept
```

### Rechazar Cita

```http
PUT /api/appointments/:appointmentId/reject
```

### Cancelar Cita

```http
PUT /api/appointments/:appointmentId/cancel
```

### Completar Cita

```http
PUT /api/appointments/:appointmentId/complete
Content-Type: application/json

{
  "weight": 15.5
}
```

---

## 6. Notificaciones

### Obtener Notificaciones de Usuario

```http
GET /api/notifications/user/:userId?limit=10
```

**Parámetros de Query:**

- `limit` (opcional): Número máximo de notificaciones

### Obtener Notificaciones No Leídas

```http
GET /api/notifications/unread/:userId
```

### Marcar como Leída

```http
PUT /api/notifications/read
Content-Type: application/json

{
  "notificationIds": [1, 2, 3]
}
```

### Crear Notificación

```http
POST /api/notifications
Content-Type: application/json

{
  "userId": 1,
  "title": "Nueva notificación",
  "message": "Mensaje de prueba",
  "type": "info"
}
```

---

## 7. Puntuaciones

### Crear Puntuación

```http
POST /api/scores
Content-Type: application/json

{
  "appointmentId": 1,
  "userId": 2,
  "score": 5,
  "comment": "Excelente servicio"
}
```

### Verificar si Existe Puntuación

```http
GET /api/scores/check/:appointmentId/:userId
```

### Obtener Puntuaciones por Cita

```http
GET /api/scores/appointment/:appointmentId
```

### Obtener Promedio de Usuario

```http
GET /api/scores/user/:userId/average
```

---

## 8. Anuncios

### Obtener Todos los Anuncios

```http
GET /api/announcement
```

### Obtener Anuncio por ID

```http
GET /api/announcement/:announcementId
```

### Crear Anuncio

```http
POST /api/announcement
Content-Type: application/json

{
  "title": "Nuevo anuncio",
  "content": "Contenido del anuncio",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Actualizar Anuncio

```http
PUT /api/announcement/:announcementId
Content-Type: application/json

{
  "title": "Anuncio actualizado",
  "content": "Nuevo contenido"
}
```

### Eliminar Anuncio

```http
DELETE /api/announcement/:announcementId
```

---

## 9. Ranking

### Obtener Todos los Períodos

```http
GET /api/ranking/periods
```

### Obtener Período Activo o Último

```http
GET /api/ranking/periods/active-or-last
```

### Crear Período

```http
POST /api/ranking/periods
Content-Type: application/json

{
  "nombre": "Período Noviembre 2025",
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-30"
}
```

### Cerrar Período

```http
POST /api/ranking/periods/close
Content-Type: application/json

{
  "periodo_id": 1
}
```

### Obtener Ranking en Vivo

```http
GET /api/ranking/live/:periodId?role=reciclador
```

**Parámetros de Query:**

- `role` (opcional): Filtrar por rol (reciclador, recolector)

### Obtener Tops del Ranking

```http
GET /api/ranking/tops/:periodId?role=recolector
```

**Parámetros de Query:**

- `role` (opcional): Filtrar por rol

### Obtener Historial del Ranking

```http
GET /api/ranking/history/:periodId
```

---

## 10. Reportes

### Reporte de Materiales

```http
GET /api/reports/materiales?startDate=2025-01-01&endDate=2025-12-31
```

**Parámetros de Query:**

- `startDate` (opcional): Fecha de inicio (formato: YYYY-MM-DD)
- `endDate` (opcional): Fecha de fin (formato: YYYY-MM-DD)

### Reporte de Puntuaciones

```http
GET /api/reports/scores?startDate=2025-01-01&endDate=2025-12-31&minScore=3
```

**Parámetros de Query:**

- `startDate` (opcional): Fecha de inicio
- `endDate` (opcional): Fecha de fin
- `minScore` (opcional): Puntuación mínima

### Reporte de Recolecciones

```http
GET /api/reports/recolecciones?startDate=2025-01-01&endDate=2025-12-31&state=2
```

**Parámetros de Query:**

- `startDate` (opcional): Fecha de inicio
- `endDate` (opcional): Fecha de fin
- `state` (opcional): Estado de la cita

---

## 11. Upload

### Subir Imagen

```http
POST /api/upload/image
Content-Type: multipart/form-data

FormData:
  - image: [archivo]
```

### Subir Imagen de Anuncio

```http
POST /api/upload/announcement
Content-Type: multipart/form-data

FormData:
  - image: [archivo]
```

---

## 12. Sistema

### Health Check

```http
GET /health
```

**Respuesta:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-06T10:00:00.000Z"
}
```

### Estado de la Base de Datos

```http
GET /api/db-status
```

**Respuesta:**

```json
{
  "database": {
    "connected": true,
    "host": "localhost",
    "status": "online"
  },
  "environment": "development",
  "timestamp": "2025-11-06T10:00:00.000Z"
}
```

---

## 📝 Notas

### Estados de Solicitudes (Request)

- `1` - Abierta
- `2` - En proceso
- `3` - Completada
- `4` - Cancelada

### Estados de Citas (Appointment)

- `0` - Pendiente
- `1` - Aceptada
- `2` - Completada
- `3` - Cancelada
- `4` - Rechazada

### Roles de Usuario

- `1` - Administrador
- `2` - Recolector
- `3` - Reciclador

---

## 🔧 Configuración

Para usar estos endpoints en tu aplicación:

1. **Variables de entorno** (.env):

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

2. **En código TypeScript**:

   ```typescript
   import { API_ENDPOINTS } from "@/config/endpoints";
   import api from "@/services/api";

   // Ejemplo de uso
   const response = await api.get(API_ENDPOINTS.USERS.GET_USER(userId));
   ```

---

**Última actualización:** Noviembre 6, 2025
