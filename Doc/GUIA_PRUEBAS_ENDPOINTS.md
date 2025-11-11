# 🧪 GUÍA DE PRUEBAS DE ENDPOINTS - GREEN BIT

**Última actualización**: 10 de Noviembre 2025  
**Estado**: 🔧 EN EJECUCIÓN DE PRUEBAS

---

## INSTRUCCIONES PREVIAS

### Requisitos
- [ ] Backend ejecutándose en `http://localhost:3000`
- [ ] Frontend ejecutándose en `http://localhost:5173`
- [ ] Thunder Client, Postman, o similar para pruebas
- [ ] Base de datos MySQL sincronizada

### Pasos para Iniciar

```bash
# Terminal 1: Backend
cd back
npm install
npm start

# Terminal 2: Frontend  
cd front
npm install
npm run dev
```

---

## 1️⃣ PRUEBAS DE REGISTRO (CRÍTICAS)

### 1.1 Registro Básico (Reciclador)
```
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "email": "test.reciclador@example.com",
  "password": "TestPass123!",
  "roleId": 3,
  "firstName": "Juan",
  "lastName": "Pérez"
}
```

**Esperado**: 
- Status: 201 o 200
- Response: `{ success: true, userId: X, ... }`

**Si falla**: 
- 404: La ruta no está montada correctamente
- 500: Error en controlador `userController.createUser`

---

### 1.2 Registro Recolector
```
POST http://localhost:3000/api/users/collector
Content-Type: application/json

{
  "email": "collector@example.com",
  "password": "TestPass123!",
  "firstName": "Carlos",
  "lastName": "García",
  "institution_name": "Ejemplo Institución"
}
```

**Esperado**: 
- Status: 201 o 200
- Response: Usuario creado con rol recolector (roleId=2)

---

### 1.3 Registro Institución
```
POST http://localhost:3000/api/users/institution
Content-Type: application/json

{
  "email": "empresa@example.com",
  "password": "TestPass123!",
  "firstName": "Empresa",
  "lastName": "Test",
  "institution_name": "Empresa Test"
}
```

**Esperado**: 
- Status: 201 o 200
- Response: Usuario + institución creados

---

### 1.4 Registro Admin Institución
```
POST http://localhost:3000/api/users/institution-admin
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "TestPass123!",
  "firstName": "Admin",
  "lastName": "Company",
  "institution_name": "My Company"
}
```

---

## 2️⃣ PRUEBAS DE USUARIOS

### 2.1 Obtener Usuario con Institución (CRÍTICO)
```
GET http://localhost:3000/api/users/withInstitution/1
```

**Esperado**: 
- Status: 200
- Response: Usuario con datos de institución

**Si falla**: 
- 404: Ruta no existe (verificar Routes/index.js)
- 500: Revisar controlador

---

## 3️⃣ PRUEBAS DE CITAS

### 3.1 Crear Cita (Schedule Pickup)
```
POST http://localhost:3000/api/request/1/schedule
Content-Type: application/json

{
  "idRequest": 1,
  "acceptedDate": "2025-11-15",
  "acceptedHour": "10:00",
  "collectorId": 2
}
```

**Observar**:
- Primera vez: Esperar respuesta
- Segunda vez: Verificar si es 400, 409 (duplicado) o 500

---

### 3.2 Aceptar Cita (CRÍTICO - Error JSON)
```
PUT http://localhost:3000/api/appointments/1/accept
Content-Type: application/json

{
  "userId": 3
}
```

**Esperado**: 
- Status: 200
- Response: `{ success: true, message: "Cita aceptada..." }`

**Si devuelve HTML**:
- Backend está caído
- Hay error de sintaxis en controlador
- Tabla `appointmentconfirmation` no existe

---

### 3.3 Rechazar Cita (CRÍTICO - Error JSON)
```
PUT http://localhost:3000/api/appointments/1/reject
Content-Type: application/json

{
  "userId": 3
}
```

---

## 4️⃣ PRUEBAS DE RANKING

### 4.1 Cerrar Período (CRÍTICO)
```
POST http://localhost:3000/api/ranking/periods/close
Content-Type: application/json

{
  "periodo_id": 1
}
```

**Esperado**: 
- Status: 200
- Response: `{ success: true, ... }`

**Si falla**:
- 404: Ruta `/ranking/periods/:id/close` aún está montada
- 500: Revisar `rankingController.closePeriod`

---

## 5️⃣ PRUEBAS DE MATERIALES

### 5.1 Obtener Todos los Materiales
```
GET http://localhost:3000/api/material
```

**Esperado**: 
- Status: 200
- Response: Array de materiales

---

### 5.2 Obtener Material por ID
```
GET http://localhost:3000/api/material/1
```

**Esperado**: 
- Status: 200
- Response: Un material

---

## 6️⃣ PRUEBAS EN FRONTEND

### Test 1: Registro de Usuario Reciclador
1. Ir a página de registro
2. Seleccionar rol "Reciclador"
3. Llenar formulario
4. Hacer click en "Registrar"

**Esperado**: Registrado sin error "no se pudo conectar"

---

### Test 2: Detalle de Usuario Empresa
1. Ir a "Gestión de Usuarios"
2. Buscar usuario de tipo Empresa
3. Hacer click en "Ver Detalle"

**Esperado**: Cargan datos de la empresa sin error "Error al obtener institución"

---

### Test 3: Solicitud de Recolección
1. Crear solicitud de reciclaje
2. Hacer click en "Confirmar recojo"
3. Esperar respuesta

**Esperado**: Cita creada sin error 500 en segundo click

---

### Test 4: Aceptar/Rechazar Cita
1. Ir a Citas (como recolector)
2. Ver cita pendiente
3. Hacer click en "Aceptar" o "Rechazar"

**Esperado**: Acción completada sin error `Unexpected token <!DOCTYPE`

---

### Test 5: Cerrar Período Ranking
1. Ir a Ranking
2. Hacer click en "Cerrar Período"
3. Confirmar

**Esperado**: Período cerrado sin error 404

---

## 📊 MATRIZ DE VALIDACIÓN

| Funcionalidad | GET | POST | PUT | Status |
|---------------|-----|------|-----|--------|
| Registro Básico | - | ✅ TEST | - | CRÍTICO |
| Registro Collector | - | ✅ TEST | - | CRÍTICO |
| Registro Institution | - | ✅ TEST | - | CRÍTICO |
| Registro Admin | - | ✅ TEST | - | CRÍTICO |
| Get User w/ Institution | ✅ TEST | - | - | CRÍTICO |
| Create Appointment | - | ✅ TEST | - | ALTA |
| Accept Appointment | - | - | ✅ TEST | CRÍTICO |
| Reject Appointment | - | - | ✅ TEST | CRÍTICO |
| Close Ranking Period | - | ✅ TEST | - | CRÍTICO |
| Get Materials | ✅ TEST | - | - | NORMAL |
| Get Material by ID | ✅ TEST | - | - | NORMAL |

---

## 🔧 TROUBLESHOOTING

### Error: "POST ... 404 (Not Found)"
**Causa**: Ruta no existe en Routes/index.js  
**Solución**: Verificar que la ruta esté montada correctamente con `router.post(...)`

### Error: "Unexpected token <!DOCTYPE"
**Causa**: Servidor devolviendo HTML en lugar de JSON  
**Solución**: 
1. Verificar que backend está ejecutándose
2. Revisar si hay error en controlador
3. Buscar `res.sendFile()` o `res.send()` en lugar de `res.json()`

### Error: "500 Internal Server Error"
**Causa**: Error en controlador o BD  
**Solución**:
1. Ver logs de terminal del backend
2. Verificar que BD está conectada
3. Revisar sentencias SQL

### Error: "400 Bad Request"
**Causa**: Datos inválidos enviados  
**Solución**: Verificar payload JSON contra especificación

---

## ✅ CHECKLIST FINAL

- [ ] Todos los registros funcionan sin error
- [ ] Detalle de usuario empresa carga datos
- [ ] Crear cita no da error 500
- [ ] Aceptar cita devuelve JSON
- [ ] Rechazar cita devuelve JSON  
- [ ] Cerrar período no devuelve 404
- [ ] Obtener materiales funciona
- [ ] Frontend sin errores 404 en red

---

## 📝 NOTAS

**Cambios Realizados Hoy**:
1. ✅ Rutas de registro corregidas (POST /users, /users/collector, etc)
2. ✅ Ruta de obtener usuario con institución agregada
3. ✅ Ruta de cerrar período corregida (sin :id en URL)
4. ✅ Middleware global de error handling agregado

**Próximas Acciones si hay Errores**:
1. Revisar logs de Backend
2. Usar Thunder Client/Postman para aislar problema
3. Revisar tablas de BD (particularmente `appointmentconfirmation`)
4. Verificar controladores en Controllers/

