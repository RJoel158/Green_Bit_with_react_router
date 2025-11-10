# Diagnóstico y Fixes de Rutas Backend - Noviembre 10, 2025

## 🔍 Problemas Identificados

Durante la inspección del admin dashboard se encontraron varios errores de conexión:

### 1. **Solicitudes de Recolectores - Error 500**
   - Componente: `CollectorRequests.tsx`
   - Endpoint solicitado: `/api/users/collectors/pending`
   - **PROBLEMA**: Ruta no estaba en `Routes/index.js`

### 2. **Administrar Usuarios - Error de conexión**
   - Componente: `UserManagement.tsx`  
   - Endpoints solicitados:
     - `/api/users/collectors/pending/institution`
     - `/api/users/approve/:id`
     - `/api/users/reject/:id`
     - `/api/users/institution/approve/:id`
     - `/api/users/institution/reject/:id`
   - **PROBLEMA**: Ninguna de estas rutas estaba en `Routes/index.js`

### 3. **createRequest - Error "Cannot destructure property 'idUser'"**
   - Archivo: `back/Controllers/requestController.js:74`
   - Error completo: `Cannot destructure property 'idUser' of 'req.body' as it is undefined`
   - **CAUSA**: La ruta POST `/request` no tenía el middleware `multer` para procesar FormData
   - Frontend envía FormData, pero Express no procesaba los datos sin middleware

---

## ✅ Soluciones Implementadas

### Fix 1: Agregar middleware multer a la ruta de crear solicitudes

**Archivo**: `back/Routes/index.js` (línea 74)

**Antes:**
```javascript
router.post('/request', requestController.createRequest);
```

**Después:**
```javascript
router.post('/request', requestController.upload.array('photos'), requestController.createRequest);
```

**Impacto**: Ahora el middleware `upload` de multer procesa los archivos de FormData correctamente antes de pasarlos a `createRequest`.

---

### Fix 2: Agregar rutas faltantes de usuarios (approve/reject)

**Archivo**: `back/Routes/index.js` (líneas 40-71)

**Rutas Agregadas:**

1. **Obtener recolectores pendientes (personas)**
   ```javascript
   router.get('/users/collectors/pending', userController.getCollectorsPendingWithPerson);
   ```

2. **Obtener recolectores pendientes (instituciones)**
   ```javascript
   router.get('/users/collectors/pending/institution', userController.getCollectorsPendingWithInstitution);
   ```

3. **Aprobar usuarios (personas)**
   ```javascript
   router.post('/users/approve/:id', userController.approveUser);
   ```

4. **Rechazar usuarios (personas)**
   ```javascript
   router.post('/users/reject/:id', userController.rejectUser);
   ```

5. **Aprobar instituciones**
   ```javascript
   router.post('/users/institution/approve/:id', userController.approveInstitution);
   ```

6. **Rechazar instituciones**
   ```javascript
   router.post('/users/institution/reject/:id', userController.rejectInstitution);
   ```

---

## 📊 Resumen de Cambios

| Aspecto | Antes | Después |
|--------|-------|---------|
| Rutas de USUARIOS | 11 | 17 |
| Rutas POST request | Sin multer | Con upload.array('photos') |
| Rutas en `/users/approve` | 0 | 4 |
| Rutas en `/users/collectors/pending` | 0 | 2 |
| **Total de Rutas** | 43 | **49** |

---

## 🧪 Validación

✅ Backend inicia sin errores  
✅ Base de datos conectada  
✅ Socket.IO activo  
✅ Email SMTP listo  
✅ Todos los controllers importados correctamente  
✅ Multer configurado para uploads  

---

## 📝 Archivos Modificados

```
back/Routes/index.js
  - Línea 10-24: Actualizado comentario de conteo (43 → 49 rutas)
  - Línea 40-71: Agregadas 6 nuevas rutas de usuarios
  - Línea 74: Agregado middleware multer.upload.array('photos')
```

---

## 🎯 Próximos Pasos

1. ✅ Reiniciar backend (npm run dev)
2. ⏳ Probar todas las rutas del admin panel
3. ⏳ Verificar que los datos se reciben correctamente en el backend
4. ⏳ Hacer commit de los cambios a git

---

## 📌 Controllers Utilizados (Verificados)

Todos los controllers usados ya existían y están correctamente implementados:

- `userController.getCollectorsPendingWithPerson()` ✅
- `userController.getCollectorsPendingWithInstitution()` ✅  
- `userController.approveUser()` ✅
- `userController.rejectUser()` ✅
- `userController.approveInstitution()` ✅
- `userController.rejectInstitution()` ✅
- `requestController.upload` (multer instance) ✅
- `requestController.createRequest()` ✅

**Nota**: Solo faltaban las RUTAS en `Routes/index.js`, los controllers ya estaban implementados.

---

## 🔐 Seguridad

⚠️ **Recomendación**: Estas rutas de approve/reject deberían tener protección de autenticación.  
Actualmente no tienen middleware de verificación de token/rol.

Sugiero agregar en el futuro:
```javascript
router.post('/users/approve/:id', 
  authenticateToken,           // Verificar token
  checkAdminRole,             // Verificar que sea admin
  userController.approveUser
);
```

---

**Timestamp**: 2025-11-10 17:52 UTC  
**Branch**: apiChanges  
**Status**: ✅ Fixes implementados y backend funcionando
