# 📋 ANÁLISIS DETALLADO DE PROBLEMAS RESTANTES

## Problema #1: Error al Crear Cita (SchedulePickupModal)
**Error Reportado**: "Error al crear la cita (at handleConfirm (SchedulePickupModal.tsx:303:15))"

### Análisis
- La ruta `POST /request/:id/schedule` existe y apunta a `appointmentController.createNewAppointment`
- El controlador valida entrada correctamente
- Segundo click devuelve "Request Failed with status 500"

### Diagnóstico
El error 500 sugiere:
1. Falta de transacción en BD
2. Validación de datos incompleta
3. Tabla `appointmentconfirmation` no tiene el campo esperado

### Verificar en `appointmentController.js` línea ~76-150:
- ¿Está usando transacciones correctamente?
- ¿Están todos los campos de `appointmentconfirmation` cubiertos?
- ¿La BD está devolviendo información correcta?

---

## Problema #2: Aceptar/Rechazar Cita (JSON Error)
**Error Reportado**: `(Unexpected token <!DOCTYPE "... is not valid JSON)`

### Análisis
Este error significa que el servidor devuelve HTML en lugar de JSON. Causas posibles:

1. **Servidor caído**: Si Express no está escuchando, devuelve HTML del sistema
2. **Ruta no encontrada**: Pero la ruta SÍ existe en Routes/index.js
3. **Error de sintaxis en controlador**: Que cause fallo antes de res.json()

### Verificar
Busca en `appointmentController.js` línea ~387-485:
- [ ] Función `acceptAppointmentEndpoint` devuelve JSON válido
- [ ] Función `rejectAppointmentEndpoint` devuelve JSON válido
- [ ] No hay `res.send()` o `res.sendFile()` accidental

### Solución Provisional
Agregar try-catch global en server.js:

```javascript
// Error handler middleware (al final de server.js)
app.use((err, req, res, next) => {
  console.error('[ERROR GLOBAL]:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Error interno del servidor' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Ruta no encontrada: ' + req.method + ' ' + req.path 
  });
});
```

---

## Problema #3: Tabla `appointmentconfirmation` vs `appointments`
**Posible Conflicto**

### Análisis
El código usa nombres inconsistentes:
- Rutas: `/appointments`
- Modelo: Aparentemente usa `appointmentconfirmation`

```javascript
// En appointmentController.js línea 460
SELECT ... FROM appointmentconfirmation WHERE ac.id = ?
```

### Verificar
¿Existe tabla `appointmentconfirmation`? ¿O debería ser `appointments`?

### Solución
Unificar nombre de tabla en toda la aplicación

---

## Soluciones Implementadas hasta ahora

✅ Cambio 1: POST /users/register → POST /users
✅ Cambio 2: POST /users/collector → POST /users (sin "register-")
✅ Cambio 3: POST /users/institution → POST /users/institution
✅ Cambio 4: POST /users/institution-admin → POST /users/institution-admin
✅ Cambio 5: GET /users/withInstitution/:userId (ruta nueva)
✅ Cambio 6: POST /ranking/periods/close (sin :id en URL)

---

## Próximas Acciones

1. **INMEDIATO**: Agregar error handler middleware en server.js
2. **CRÍTICO**: Revisar consultasSQL en `acceptAppointmentEndpoint` y `rejectAppointmentEndpoint`
3. **IMPORTANTE**: Unificar nombres de tablas (appointmentconfirmation vs appointments)
4. **TEST**: Hacer pruebas con Postman/Thunder Client para cada endpoint

