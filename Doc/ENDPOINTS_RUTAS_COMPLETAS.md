# 📡 ENDPOINTS Y RUTAS - GREEN BIT API

## 📍 Ubicaciones

### **Frontend**

📄 **Definición de Endpoints:**

```
front/src/config/endpoints.ts
```

Este archivo contiene TODOS los endpoints del API en un único lugar, organizados por módulo.

### **Backend**

📄 **Rutas Centralizadas:**

```
back/Routes/index.js
```

Este archivo MONTA todas las rutas y las registra con Express.

---

## 📋 ENDPOINTS POR MÓDULO

### **1️⃣ USUARIOS (17 rutas) - `/api/users`**

#### Autenticación

```
POST   /api/users/login                        - Login de usuario
POST   /api/users                              - Registro básico
POST   /api/users/collector                    - Registro recolector
POST   /api/users/institution                  - Registro institución
POST   /api/users/institution-admin            - Registro admin institución
```

#### Contraseña

```
POST   /api/users/forgotpassword               - Recuperar contraseña
PUT    /api/users/changePassword/:userId       - Cambiar contraseña
```

#### Consultas

```
GET    /api/users/:id                          - Obtener usuario por ID
GET    /api/users/withPerson                   - Usuarios con datos de persona
GET    /api/users/withInstitution/:id          - Usuarios con institución
GET    /api/users/check-email/:email           - Verificar si existe email
```

#### Gestión de Recolectores

```
GET    /api/users/collectors/pending           - Recolectores pendientes
GET    /api/users/collectors/pending/institution - Recolectores pending institución
POST   /api/users/approve/:id                  - Aprobar usuario
POST   /api/users/reject/:id                   - Rechazar usuario
```

#### Gestión de Instituciones

```
GET    /api/users/institution                  - Obtener instituciones
POST   /api/users/institution/approve/:id      - Aprobar institución
POST   /api/users/institution/reject/:id       - Rechazar institución
DELETE /api/users/institution/:id              - Eliminar institución
```

#### Otros

```
PUT    /api/users/:id/role                     - Actualizar rol de usuario
DELETE /api/users/:id                          - Eliminar usuario
```

---

### **2️⃣ MATERIALES (5 rutas) - `/api/material`**

```
GET    /api/material                           - Obtener todos los materiales
POST   /api/material                           - Crear material
GET    /api/material/:id                       - Obtener material por ID
PUT    /api/material/:id                       - Actualizar material
DELETE /api/material/:id                       - Eliminar material
```

---

### **3️⃣ SOLICITUDES (7 rutas) - `/api/request`**

```
POST   /api/request                            - Crear solicitud (con fotos)
GET    /api/request                            - Obtener todas las solicitudes
GET    /api/request/:id                        - Obtener solicitud por ID
GET    /api/request/user/:userId/state         - Solicitudes del usuario filtradas por estado
PUT    /api/request/:id/state                  - Actualizar estado de solicitud
POST   /api/request/:id/schedule               - Agendar recolección (crear appointment)
GET    /api/request/:id/schedule               - Obtener horarios disponibles
```

---

### **4️⃣ CITAS (12 rutas) - `/api/appointments`**

#### Consultas

```
GET    /api/appointments                       - Obtener todas las citas
GET    /api/appointments/:id                   - Obtener cita por ID
GET    /api/appointments/collector/:collectorId - Citas de recolector
GET    /api/appointments/recycler/:recyclerId - Citas de reciclador
```

#### Acciones

```
POST   /api/appointments                       - Crear cita
POST   /api/appointments/schedule              - Agendar cita (crear appointment)
PUT    /api/appointments/:id                   - Actualizar cita
PUT    /api/appointments/:id/accept            - Aceptar cita
PUT    /api/appointments/:id/reject            - Rechazar cita
PUT    /api/appointments/:id/cancel            - Cancelar cita
PUT    /api/appointments/:id/complete          - Marcar como completada ✅
```

---

### **5️⃣ NOTIFICACIONES (3 rutas) - `/api/notifications`**

```
GET    /api/notifications/user/:userId        - Obtener notificaciones del usuario
GET    /api/notifications/unread/:userId      - Obtener contador de no leídas
PUT    /api/notifications/read                - Marcar notificación como leída
```

---

### **6️⃣ PUNTUACIONES (4 rutas) - `/api/score`**

```
POST   /api/score                              - Crear puntuación
GET    /api/score/check/:appointmentId/:userId - Verificar si usuario ya calificó
GET    /api/score/appointment/:appointmentId - Obtener puntuaciones de cita
GET    /api/score/user/:userId/average       - Obtener promedio de usuario
```

---

### **7️⃣ ANUNCIOS (6 rutas) - `/api/announcements`**

```
GET    /api/announcements                      - Obtener todos los anuncios
POST   /api/announcements                      - Crear anuncio
GET    /api/announcements/:id                 - Obtener anuncio por ID
GET    /api/announcements/role/:role          - Obtener anuncios por rol
PUT    /api/announcements/:id                 - Actualizar anuncio
DELETE /api/announcements/:id                 - Eliminar anuncio
```

---

### **8️⃣ UPLOAD (3 rutas) - `/api/upload`**

```
POST   /api/upload/announcement                - Subir imagen de anuncio
GET    /api/upload/announcement/:filename     - Obtener info de imagen
DELETE /api/upload/announcement/:filename     - Eliminar imagen
```

---

### **9️⃣ RANKING (7 rutas) - `/api/ranking`**

```
GET    /api/ranking/periods                    - Obtener períodos de ranking
POST   /api/ranking/periods                    - Crear nuevo período
GET    /api/ranking/periods/active-or-last     - Período activo o último
POST   /api/ranking/periods/close              - Cerrar período
GET    /api/ranking/live/:periodId             - Ranking en vivo del período
GET    /api/ranking/tops/:periodId             - Top histórico del período
GET    /api/ranking/history/:periodId          - Historial de período
```

---

### **🔟 REPORTES (3 rutas) - `/api/reports`**

```
GET    /api/reports/materiales                - Reporte de materiales
GET    /api/reports/scores                    - Reporte de puntuaciones
GET    /api/reports/recolecciones             - Reporte de recolecciones
```

---

### **1️⃣1️⃣ SISTEMA (1 ruta)**

```
GET    /api/health                             - Estado de salud del servidor
```

---

## 📊 RESUMEN

| Módulo             | Rutas        | Archivo                   |
| ------------------ | ------------ | ------------------------- |
| **Usuarios**       | 17           | userController.js         |
| **Materiales**     | 5            | materialController.js     |
| **Solicitudes**    | 7            | requestController.js      |
| **Citas**          | 12           | appointmentController.js  |
| **Notificaciones** | 3            | notificationController.js |
| **Puntuaciones**   | 4            | scoreController.js        |
| **Anuncios**       | 6            | announcementController.js |
| **Upload**         | 3            | uploadController.js       |
| **Ranking**        | 7            | rankingController.js      |
| **Reportes**       | 3            | reportController.js       |
| **Sistema**        | 1            | server.js                 |
| **TOTAL**          | **68 rutas** | 10 controllers            |

---

## 🔗 Cómo están Organizados

### **Frontend** (`endpoints.ts`)

```typescript
export const API_ENDPOINTS = {
  USERS: { ... },
  MATERIALS: { ... },
  REQUESTS: { ... },
  APPOINTMENTS: { ... },
  // etc...
}
```

**Uso en componentes:**

```typescript
import { API_ENDPOINTS } from '../config/endpoints';

// Usar
const url = API_ENDPOINTS.APPOINTMENTS.COMPLETE(appointmentId);
fetch(url, { method: 'PUT', ... })
```

### **Backend** (`Routes/index.js`)

```javascript
router.post("/users/login", userController.loginUser);
router.get("/appointments/:id", appointmentController.getAppointmentById);
// etc...

export default router;

// En server.js se monta:
app.use("/api", router);
```

---

## 🎯 Flujo Completo

```
Frontend
  ↓
API_ENDPOINTS.APPOINTMENTS.COMPLETE(id)
  ↓
"/api/appointments/{id}/complete"
  ↓
Backend Routes/index.js
  ↓
PUT /appointments/:id/complete
  ↓
appointmentController.completeAppointmentEndpoint()
```

---

## 📝 Notas Importantes

✅ **Base URL:** `http://localhost:3000/api`  
✅ **Prefijo `/api/`:** Se agrega automáticamente en server.js  
✅ **Rutas específicas PRIMERO:** En index.js, las rutas específicas van ANTES de las genéricas  
✅ **Controllers:** Cada módulo tiene su archivo de controller separado  
✅ **Endpoints centralizados:** Todos definidos en `endpoints.ts` para fácil mantenimiento

---

**¡68 endpoints listos para usar! 🚀**
