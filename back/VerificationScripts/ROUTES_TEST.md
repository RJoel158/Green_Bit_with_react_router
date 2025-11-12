# 🧪 Test de Todas las Rutas Backend - GreenBit Recycling

**Base URL:** `http://localhost:3000`

---

## 📋 Índice de Rutas

- [USERS](#users)
- [RANKING](#ranking)
- [MATERIALS](#materials)
- [ANNOUNCEMENTS](#announcements)
- [APPOINTMENTS](#appointments)
- [REQUESTS](#requests)
- [SCORES](#scores)
- [REPORTS](#reports)
- [NOTIFICATIONS](#notifications)
- [UPLOADS](#uploads)
- [PERSON](#person)
- [INSTITUTIONS](#institutions)

---

## USERS

### 1. Login

```
POST /api/users/login
Headers: Content-Type: application/json
Body: {
  "email": "test@test.com",
  "password": "password123"
}
Expected: 200 OK | 401 Unauthorized
```

### 2. Forgot Password

```
POST /api/users/forgotPassword
Body: {
  "email": "test@test.com"
}
Expected: 200 OK
```

### 3. Change Password

```
PUT /api/users/changePassword/:userId
Body: {
  "newPassword": "newpass123",
  "oldPassword": "oldpass123"
}
Expected: 200 OK
```

### 4. Get All Users

```
GET /api/users
Expected: 200 OK
```

### 5. Get User by ID

```
GET /api/users/:id
Expected: 200 OK
```

### 6. Get Users with Person

```
GET /api/users/withPerson
Expected: 200 OK
```

### 7. Get Collectors Pending

```
GET /api/users/collectors/pending
Expected: 200 OK
```

### 8. Create User (Reciclador)

```
POST /api/users
Body: {
  "email": "reciclador@test.com",
  "password": "pass123",
  "phone": "+591 12345678",
  "role_id": 3
}
Expected: 201 Created
```

### 9. Create Collector User

```
POST /api/users/collector
Body: {
  "email": "recolector@test.com",
  "phone": "+591 87654321",
  "nombres": "Juan",
  "apellidos": "García"
}
Expected: 201 Created
```

### 10. Update User

```
PUT /api/users/:id
Body: {
  "email": "newemail@test.com",
  "phone": "+591 11111111"
}
Expected: 200 OK
```

### 11. Update User Role

```
PUT /api/users/:id/role
Body: {
  "role_id": 2
}
Expected: 200 OK
```

### 12. Approve User

```
POST /api/users/approve/:id
Expected: 200 OK
```

### 13. Reject User

```
POST /api/users/reject/:id
Body: {
  "message": "Documento inválido"
}
Expected: 200 OK
```

### 14. Delete User

```
DELETE /api/users/:id
Expected: 200 OK
```

### 15. Create Institution User

```
POST /api/users/institution
Body: {
  "email": "institucion@test.com",
  "password": "pass123",
  "phone": "+591 55555555",
  "companyName": "Mi Empresa",
  "nit": "123456789"
}
Expected: 201 Created
```

### 16. Get Users with Institution

```
GET /api/users/withInstitution
Expected: 200 OK
```

### 17. Get Institution Collectors Pending

```
GET /api/users/collectors/pending/institution
Expected: 200 OK
```

### 18. Get User with Institution by ID

```
GET /api/users/withInstitution/:id
Expected: 200 OK
```

### 19. Approve Institution

```
POST /api/users/institution/approve/:id
Expected: 200 OK
```

### 20. Reject Institution

```
POST /api/users/institution/reject/:id
Expected: 200 OK
```

---

## RANKING

### 1. Get Periods

```
GET /api/ranking/periods
Expected: 200 OK
```

### 2. Get Closed Periods

```
GET /api/ranking/periods/closed
Expected: 200 OK
```

### 3. Get Active or Last Period

```
GET /api/ranking/periods/active-or-last
Expected: 200 OK
```

### 4. Get Live Ranking by Period

```
GET /api/ranking/live/:periodo_id
Expected: 200 OK
```

### 5. Get Tops by Period

```
GET /api/ranking/tops/:periodo_id
Expected: 200 OK
```

### 6. Get History by Period

```
GET /api/ranking/history/:periodo_id
Expected: 200 OK
```

### 7. Create Period

```
POST /api/ranking/periods
Body: {
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-30"
}
Expected: 201 Created
```

### 8. Update Period

```
PUT /api/ranking/periods/:id
Body: {
  "fecha_fin": "2025-11-15"
}
Expected: 200 OK
```

### 9. Close Period

```
POST /api/ranking/periods/close
Body: {
  "periodo_id": 1
}
Expected: 200 OK
```

### 10. Delete Period

```
DELETE /api/ranking/periods/:id
Expected: 200 OK
```

---

## MATERIALS

### 1. Get All Materials

```
GET /api/material
Expected: 200 OK
```

### 2. Get Material by ID

```
GET /api/material/:id
Expected: 200 OK
```

### 3. Create Material

```
POST /api/material
Body: {
  "nombre": "Plástico",
  "descripcion": "Botellas de plástico",
  "precio_kilo": 0.50
}
Expected: 201 Created
```

### 4. Update Material

```
PUT /api/material/:id
Body: {
  "precio_kilo": 0.75
}
Expected: 200 OK
```

### 5. Delete Material

```
DELETE /api/material/:id
Expected: 200 OK
```

---

## ANNOUNCEMENTS

### 1. Get All Announcements

```
GET /api/announcements
Expected: 200 OK
```

### 2. Get Announcement by ID

```
GET /api/announcements/:id
Expected: 200 OK
```

### 3. Create Announcement

```
POST /api/announcements
Body: {
  "title": "Nuevo programa de reciclaje",
  "content": "Contenido del anuncio",
  "image": "url_imagen"
}
Expected: 201 Created
```

### 4. Update Announcement

```
PUT /api/announcements/:id
Body: {
  "title": "Título actualizado"
}
Expected: 200 OK
```

### 5. Delete Announcement

```
DELETE /api/announcements/:id
Expected: 200 OK
```

---

## APPOINTMENTS

### 1. Get All Appointments

```
GET /api/appointment
Expected: 200 OK
```

### 2. Get Appointment by ID

```
GET /api/appointment/:id
Expected: 200 OK
```

### 3. Create Appointment

```
POST /api/appointment
Body: {
  "request_id": 1,
  "fecha_cita": "2025-11-15",
  "hora_cita": "14:30"
}
Expected: 201 Created
```

### 4. Update Appointment

```
PUT /api/appointment/:id
Body: {
  "state": "2"
}
Expected: 200 OK
```

### 5. Delete Appointment

```
DELETE /api/appointment/:id
Expected: 200 OK
```

---

## REQUESTS

### 1. Get All Requests

```
GET /api/request
Expected: 200 OK
```

### 2. Get Request by ID

```
GET /api/request/:id
Expected: 200 OK
```

### 3. Create Request

```
POST /api/request
Body: {
  "user_id": 1,
  "material_id": 1,
  "cantidad": 10,
  "ubicacion": "Dirección"
}
Expected: 201 Created
```

### 4. Update Request

```
PUT /api/request/:id
Body: {
  "state": "1"
}
Expected: 200 OK
```

### 5. Delete Request

```
DELETE /api/request/:id
Expected: 200 OK
```

---

## SCORES

### 1. Get All Scores

```
GET /api/score
Expected: 200 OK
```

### 2. Get Score by ID

```
GET /api/score/:id
Expected: 200 OK
```

### 3. Create Score

```
POST /api/score
Body: {
  "user_id": 1,
  "puntaje": 100,
  "tipo": "recoleccion"
}
Expected: 201 Created
```

### 4. Update Score

```
PUT /api/score/:id
Body: {
  "puntaje": 150
}
Expected: 200 OK
```

### 5. Delete Score

```
DELETE /api/score/:id
Expected: 200 OK
```

---

## REPORTS

### 1. Get Materials Report

```
GET /api/reports/materials
Query: ?dateFrom=2025-11-01&dateTo=2025-11-30&userId=1
Expected: 200 OK
```

### 2. Get Collections Report

```
GET /api/reports/collections
Query: ?dateFrom=2025-11-01&dateTo=2025-11-30
Expected: 200 OK
```

### 3. Get Appointments Report

```
GET /api/reports/appointments
Query: ?dateFrom=2025-11-01&dateTo=2025-11-30
Expected: 200 OK
```

---

## NOTIFICATIONS

### 1. Get All Notifications

```
GET /api/notification
Expected: 200 OK
```

### 2. Get Notification by ID

```
GET /api/notification/:id
Expected: 200 OK
```

### 3. Get Notifications for User

```
GET /api/notification/user/:userId
Expected: 200 OK
```

### 4. Create Notification

```
POST /api/notification
Body: {
  "user_id": 1,
  "message": "Tu solicitud fue aprobada",
  "type": "approval"
}
Expected: 201 Created
```

### 5. Mark as Read

```
PUT /api/notification/:id/read
Expected: 200 OK
```

### 6. Delete Notification

```
DELETE /api/notification/:id
Expected: 200 OK
```

---

## UPLOADS

### 1. Upload Image

```
POST /api/upload/image
Content-Type: multipart/form-data
File: image.jpg
Expected: 200 OK | 201 Created
```

### 2. Upload Announcement Image

```
POST /api/upload/announcement
Content-Type: multipart/form-data
File: announcement.jpg
Expected: 200 OK | 201 Created
```

---

## PERSON

### 1. Get All Persons

```
GET /api/person
Expected: 200 OK
```

### 2. Get Person by ID

```
GET /api/person/:id
Expected: 200 OK
```

### 3. Get Person by User ID

```
GET /api/person/user/:userId
Expected: 200 OK
```

### 4. Create Person

```
POST /api/person
Body: {
  "userId": 1,
  "firstname": "Juan",
  "lastname": "Pérez",
  "cedula": "1234567"
}
Expected: 201 Created
```

### 5. Update Person

```
PUT /api/person/:id
Body: {
  "firstname": "Juan Carlos"
}
Expected: 200 OK
```

### 6. Delete Person

```
DELETE /api/person/:id
Expected: 200 OK
```

---

## INSTITUTIONS

### 1. Get All Institutions

```
GET /api/institution
Expected: 200 OK
```

### 2. Get Institution by ID

```
GET /api/institution/:id
Expected: 200 OK
```

### 3. Create Institution

```
POST /api/institution
Body: {
  "userId": 1,
  "companyName": "Mi Empresa",
  "nit": "123456789",
  "state": 1
}
Expected: 201 Created
```

### 4. Update Institution

```
PUT /api/institution/:id
Body: {
  "companyName": "Nuevo Nombre"
}
Expected: 200 OK
```

### 5. Delete Institution

```
DELETE /api/institution/:id
Expected: 200 OK
```

---

## 🧪 Instrucciones para Probar

### Opción 1: Usar Postman o Thunder Client

1. Importar colección desde `/Doc/THUNDER_CLIENT_COLLECTION.json`
2. Ejecutar requests en orden
3. Verificar que todas respondan con 200 OK (o estado esperado)

### Opción 2: Usar curl

```bash
# Ejemplo: Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Ejemplo: Get users
curl http://localhost:3000/api/users
```

### Opción 3: Script de Prueba Automática

```bash
bash scripts/test-all-routes.sh
```

---

## ✅ Checklist de Verificación

- [ ] USERS - Todos los endpoints responden
- [ ] RANKING - Todos los endpoints responden
- [ ] MATERIALS - Todos los endpoints responden
- [ ] ANNOUNCEMENTS - Todos los endpoints responden
- [ ] APPOINTMENTS - Todos los endpoints responden
- [ ] REQUESTS - Todos los endpoints responden
- [ ] SCORES - Todos los endpoints responden
- [ ] REPORTS - Todos los endpoints responden
- [ ] NOTIFICATIONS - Todos los endpoints responden
- [ ] UPLOADS - Todos los endpoints responden
- [ ] PERSON - Todos los endpoints responden
- [ ] INSTITUTIONS - Todos los endpoints responden

---

## 🚀 Próximos Pasos

Una vez verificado que todos los endpoints responden:

1. [ ] Revisar los status codes (200, 201, etc.)
2. [ ] Verificar estructura de respuestas
3. [ ] Probar con datos inválidos (errores 400, 404, 500)
4. [ ] Verificar autenticación y autorización
5. [ ] Deploy a producción

---

_Generado: 10 de Noviembre de 2025_
