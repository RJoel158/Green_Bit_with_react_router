# GUÍA DE DEBUGGING - ERRORES REPORTADOS

**Fecha**: 10 de Noviembre de 2025  
**Estado**: En investigación

---

## ERRORES REPORTADOS Y ANÁLISIS

### 1. ❌ Registro de usuario correcto reciclador
**Error**: "Mensaje de no se pudo conectar al servidor"
**Ruta**: POST `/api/users`
**Controlador**: `createUser` en `userController.js`

#### Debugging:
- [ ] Verificar que el backend está corriendo en puerto 3000
- [ ] Revisar logs del servidor para ver si recibe la petición
- [ ] Validar CORS en server.js
- [ ] Verificar que el body enviado cumple con las validaciones
- [ ] Validar esquema de base de datos para tabla usuarios

#### Posibles Causas:
1. **CORS no configurado**: Frontend en diferente puerto/dominio
2. **Servidor no está corriendo**: Iniciar con `npm start` en `/back`
3. **Validación fallida**: El body no tiene todos los campos requeridos
4. **Base de datos**: Conexión no inicializada

---

### 2. ❌ Registro de usuario recolector (persona y empresa)
**Error**: "Mensaje de no se pudo conectar al servidor"
**Rutas**: 
- POST `/api/users/collector` (recolector persona)
- POST `/api/users/institution` (recolector empresa)

**Controladores**: 
- `createCollectorUser`
- `createUserWithInstitution`

#### Debugging:
- [ ] Mismo análisis que error #1
- [ ] Revisar validación específica de recolectores
- [ ] Verificar relaciones con tabla personas/instituciones

---

### 3. ❌ Detalle de usuario tipo empresa
**Error**: "Los datos no cargan para la empresa (Error al obtener institución: AxiosError)"
**Ruta**: GET `/api/users/withInstitution/{userId}`
**Controlador**: `getUserWithInstitutionById` en `userController.js`

#### Debugging:
```javascript
// Verificar que esta función existe y está exportada
export const getUserWithInstitutionById = async (req, res) => {
  // Debe retornar user + institution + person data
};
```

- [ ] Validar que el usuario existe en BD
- [ ] Validar que el usuario tiene institución asociada
- [ ] Revisar joins en la consulta SQL
- [ ] Validar estructura de datos retornada

#### Posible Causa:
- Query SQL devuelve NULL o campos no encontrados

---

### 4. ❌ Solicitud de recolección
**Error Primer Click**: "Error al crear la cita (at handleConfirm (SchedulePickupModal.tsx:303:15))"
**Error Segundo Click**: "Request Failed with status 500" pero sí se crea la cita

**Rutas**:
- POST `/api/request/:id/schedule` (crear cita)
- POST `/api/appointments/schedule` (alternativa)

**Controlador**: `createNewAppointment` en `appointmentController.js`

#### Debugging:
```javascript
// El problema es: la cita se crea PERO hay error en la respuesta
// Probablemente:
// 1. Respuesta es HTML (error 500) en lugar de JSON
// 2. El status es 200 pero hay error en algún lado
// 3. Hay excepción no capturada
```

- [ ] Revisar middleware de error global
- [ ] Verificar try-catch en `createNewAppointment`
- [ ] Validar que devuelve JSON válido
- [ ] Revisar logs del servidor

#### Solución Posible:
```javascript
// Agregar middleware de error global en server.js
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ 
    error: err.message,
    code: err.code 
  });
});
```

---

### 5. ❌ Aceptar solicitud y rechazar solicitud
**Error**: "Unexpected token <!DOCTYPE ... is not valid JSON"
**Rutas**:
- PUT `/api/appointments/:id/accept`
- PUT `/api/appointments/:id/reject`

**Controladores**:
- `acceptAppointmentEndpoint`
- `rejectAppointmentEndpoint`

#### Debugging:
```javascript
// Error "<!DOCTYPE" significa que la respuesta es HTML
// Probablemente una página de error del servidor
// Verificar que estos endpoints existen:
router.put('/appointments/:id/accept', appointmentController.acceptAppointmentEndpoint);
router.put('/appointments/:id/reject', appointmentController.rejectAppointmentEndpoint);
```

- [ ] Verificar que estas funciones exportan correctamente
- [ ] Revisar si hay un middleware que devuelve HTML antes
- [ ] Validar que las rutas están en el orden correcto

---

### 6. ❌ Gestión de usuarios (crear usuario desde panel admin)
**Error 1**: "POST http://localhost:3000/api/users 404 (Not Found)"
**Error 2**: "POST http://localhost:3000/api/users/institution-admin 404"

#### Análisis:
- POST `/api/users` debe existir → ✅ Existe en Routes/index.js línea 60
- POST `/api/users/institution-admin` debe existir → ✅ Existe en Routes/index.js línea 62

#### Problema Posible:
Las rutas EXISTEN pero:
1. El controlador lanza excepción
2. No hay middleware de error que capture
3. El servidor devuelve HTML en lugar de JSON
4. Body validation falla silenciosamente

#### Debugging:
- [ ] Revisar console.error en userController
- [ ] Agregar logging detallado
- [ ] Validar body enviado desde frontend
- [ ] Verificar que campos de entrada son correctos

---

### 7. ❌ Ranking: No permite cerrar período
**Error**: "POST http://localhost:3000/api/ranking/periods/close 404 (Not Found)"

#### Análisis:
```javascript
// Backend tiene:
router.post('/ranking/periods/close', rankingController.closePeriod);

// Frontend espera:
CLOSE_PERIOD: '/api/ranking/periods/close'
```

Ambas coinciden. El problema probablemente es que:
1. El body no tiene el `periodo_id`
2. El controlador falla sin captura de error
3. Hay excepción antes de devolver respuesta

#### Verificar en rankingController:
```javascript
export const closePeriod = async (req, res) => {
  try {
    const { periodo_id } = req.body;
    if (!periodo_id) {
      return res.status(400).json({ error: 'periodo_id es requerido' });
    }
    // ... resto del código
  } catch (error) {
    console.error('[ERROR] closePeriod:', error);
    res.status(500).json({ error: error.message });
  }
};
```

---

## PLAN DE ACCIÓN INTEGRAL

### PASO 1: Agregar Middleware de Error Global
**Archivo**: `back/server.js`
```javascript
// Al final, DESPUÉS de todas las rutas:
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    status: err.status || 500
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Error del servidor',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});
```

### PASO 2: Validar Todas las Respuestas Devuelven JSON
Revisar que TODAS las rutas tienen `res.json()` o `res.status().json()`

### PASO 3: Agregar Logs Detallados
```javascript
console.log('[INFO] Request:', {
  method: req.method,
  path: req.path,
  body: req.body,
  params: req.params,
  query: req.query
});
```

### PASO 4: Testear Cada Endpoint
Usar Postman/ThunderClient para verificar:
- Status 200/201/400 correcto
- Body es JSON válido
- Headers son application/json

### PASO 5: Verificar Variables de Entorno
```bash
# Verificar que .env tiene:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=greenbit
DB_USER=root
DB_PASSWORD=...
JWT_SECRET=...
```

---

## CHECKLIST DE DEBUGGING

- [ ] Backend corre en puerto 3000
- [ ] CORS está habilitado
- [ ] Base de datos está conectada
- [ ] Middleware de error global está implementado
- [ ] Todas las respuestas devuelven JSON
- [ ] Validaciones lanzan errores HTTP correctos (400, 404, 500)
- [ ] Logs muestran exactamente qué falla
- [ ] Variables de entorno están configuradas
- [ ] Esquema de BD coincide con queries

---

## COMANDOS DE DEBUGGING

```bash
# 1. Revisar logs en tiempo real
cd back
npm start

# 2. En otra terminal, testear endpoints
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","nombre":"Test"}'

# 3. Revisar base de datos
mysql -u root -p greenbit
SELECT * FROM usuarios LIMIT 5;
```

---

**Estado**: Listo para implementar  
**Próximo paso**: Agregar middleware de error global y logs detallados
