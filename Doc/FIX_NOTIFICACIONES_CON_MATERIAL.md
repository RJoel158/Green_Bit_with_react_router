# 📝 FIX: Notificaciones Muestran el Nombre del Material

## 🎯 Problema

Las notificaciones de solicitud de recolección decían "tu material" sin especificar qué material se estaba solicitando recoger.

**Antes:**

```
"El usuario collector@mail.com ha solicitado recoger tu material el 17/11/2025"
```

**Ahora:**

```
"El usuario collector@mail.com ha solicitado recoger Tetrabrik el 17/11/2025"
```

---

## ✅ Solución Implementada

Se modificaron **3 notificaciones** para incluir el nombre del material:

### **1. Notificación de Solicitud Recibida (createNewAppointment)**

**Antes:**

```javascript
body: `El usuario ${collectorEmail} ha solicitado recoger tu material el ${acceptedDate}`;
```

**Después:**

```javascript
body: `El usuario ${collectorEmail} ha solicitado recoger ${materialName} el ${acceptedDate}`;
```

**Query actualizada:**

```sql
SELECT r.idUser as recyclerId, u.email as recyclerEmail,
       uc.email as collectorEmail, m.name as materialName  -- ← NUEVO
FROM request r
JOIN users u ON u.id = r.idUser
JOIN users uc ON uc.id = ?
LEFT JOIN material m ON m.id = r.materialId  -- ← NUEVO
WHERE r.id = ?
```

---

### **2. Notificación de Solicitud Aceptada (acceptAppointmentEndpoint)**

**Antes:**

```javascript
body: `${recyclerEmail} ha aceptado tu solicitud de recolección`;
```

**Después:**

```javascript
body: `${recyclerEmail} ha aceptado tu solicitud de recolección de ${materialName}`;
```

**Query actualizada:**

```sql
SELECT ac.collectorId, ac.idRequest, u.email as collectorEmail, m.name as materialName  -- ← NUEVO
FROM appointmentconfirmation ac
JOIN users u ON u.id = ac.collectorId
JOIN request r ON r.id = ac.idRequest
LEFT JOIN material m ON m.id = r.materialId  -- ← NUEVO
WHERE ac.id = ?
```

---

### **3. Notificación de Solicitud Rechazada (rejectAppointmentEndpoint)**

**Antes:**

```javascript
body: `Tu solicitud de recolección a ${recyclerEmail} fue rechazada`;
```

**Después:**

```javascript
body: `Tu solicitud de recolección de ${materialName} a ${recyclerEmail} fue rechazada`;
```

**Query actualizada:**

```sql
SELECT ac.idRequest, ac.collectorId, ac.state,
       u.email as recyclerEmail, r.idUser as recyclerId, m.name as materialName  -- ← NUEVO
FROM appointmentconfirmation ac
JOIN request r ON r.id = ac.idRequest
JOIN users u ON u.id = r.idUser
LEFT JOIN material m ON m.id = r.materialId  -- ← NUEVO
WHERE ac.id = ?
```

---

## 📊 Ejemplo de Notificaciones Mejoradas

```
📬 SOLICITUD RECIBIDA
   "El usuario recolector@mail.com ha solicitado recoger Tetrabrik el 17/11/2025"

📬 SOLICITUD ACEPTADA
   "reciclador@mail.com ha aceptado tu solicitud de recolección de Acero"

📬 SOLICITUD RECHAZADA
   "Tu solicitud de recolección de Cartón a reciclador@mail.com fue rechazada"
```

---

## 🔒 Validación

Si no hay material especificado (materialId es NULL):

```javascript
const materialName = rows[0].materialName || "material de reciclaje";
```

Se usa un fallback: **"material de reciclaje"**

---

## 🧪 Testing

Para verificar que funciona correctamente:

1. **Crear una solicitud** con un material específico (ej: Tetrabrik)
2. **Recibir notificación** diciendo el nombre (Tetrabrik)
3. **Aceptar/Rechazar** la solicitud
4. **Ver notificación** con el nombre del material

---

## 📂 Archivos Modificados

**Archivo:** `back/Controllers/appointmentController.js`

**Funciones actualizadas:**

1. ✅ `createNewAppointment()` - Notificación inicial
2. ✅ `acceptAppointmentEndpoint()` - Notificación de aceptación
3. ✅ `rejectAppointmentEndpoint()` - Notificación de rechazo

**Cambios totales:** 3 funciones, 3 queries mejoradas

---

## 💡 Beneficios

- ✅ Notificaciones más informativas
- ✅ Usuario sabe exactamente qué material se solicita recoger
- ✅ Menos confusión en el historial de notificaciones
- ✅ Mejor experiencia de usuario

---

**¡Listo para probar!** 🎉
