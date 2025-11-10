# 🌿 Sistema de Gestión de APIs - GreenBit Recycling

## 📁 Archivos Creados

### 1. **Sistema Centralizado de APIs**

#### `front/src/services/api.ts`

- Instancia configurada de axios con:
  - BaseURL desde variables de entorno
  - Interceptors para autenticación automática
  - Manejo centralizado de errores
  - Helper functions para peticiones

#### `front/src/config/endpoints.ts`

- **Todos los endpoints del backend organizados**
- Type-safe con TypeScript
- Fácil de mantener y actualizar
- Incluye:
  - Usuarios y Autenticación
  - Materiales
  - Solicitudes
  - Citas
  - Notificaciones
  - Puntuaciones
  - Anuncios
  - Ranking
  - Reportes
  - Upload
  - Sistema

### 2. **Documentación**

#### `API_ENDPOINTS_COMPLETE.md`

- 📋 Documentación completa de todos los endpoints
- Ejemplos de peticiones HTTP
- Parámetros y respuestas
- Estados y códigos
- Listo para compartir con el equipo

#### `MIGRATION_GUIDE.md`

- 🔄 Guía paso a paso para migrar código
- Ejemplos antes/después
- Lista de componentes pendientes
- Mejores prácticas

#### `THUNDER_CLIENT_COLLECTION.json`

- ⚡ Colección completa para Thunder Client / Postman
- 90+ endpoints listos para probar
- Variables configuradas
- Organizado por categorías

---

## 🚀 Cómo Usar

### En tu Código TypeScript

```typescript
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/endpoints";

// GET simple
const users = await api.get(API_ENDPOINTS.USERS.GET_USER_WITH_PERSON);

// GET con parámetros
const user = await api.get(API_ENDPOINTS.USERS.GET_USER(userId));

// POST
const response = await api.post(API_ENDPOINTS.USERS.LOGIN, {
  email: "user@example.com",
  password: "password123",
});

// PUT
await api.put(API_ENDPOINTS.USERS.APPROVE_USER(userId));

// DELETE
await api.delete(API_ENDPOINTS.USERS.DELETE_USER(userId));
```

### En Thunder Client

1. Abre Thunder Client en VS Code
2. Importa `THUNDER_CLIENT_COLLECTION.json`
3. Configura la variable `{{baseUrl}}` si es necesario
4. ¡Listo para probar todos los endpoints!

---

## ✅ Ventajas del Sistema

### 1. **Centralización**

- Un solo lugar para todas las URLs
- Cambio de entorno solo en `.env`
- Fácil de mantener

### 2. **Type Safety**

- TypeScript detecta errores en desarrollo
- Autocompletado de endpoints
- Menos bugs en producción

### 3. **Consistencia**

- Todas las peticiones usan el mismo patrón
- Manejo uniforme de errores
- Código más limpio y legible

### 4. **Seguridad**

- Autenticación automática con interceptors
- Manejo centralizado de tokens
- Renovación automática de sesión

### 5. **Testing**

- Fácil de mockear para tests
- Todos los endpoints documentados
- Colección lista para QA

---

## 📋 Servicios Disponibles

### ✅ Ya Actualizados

- `rankingService.ts` - Gestión de rankings
- `appointmentService.ts` - Gestión de citas
- `Login.tsx` - Autenticación (ejemplo)

### 🔄 Pendientes de Migración

Ver lista completa en `MIGRATION_GUIDE.md`

---

## 🔧 Configuración

### Variables de Entorno (`front/.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
```

### Para Producción

```env
VITE_API_BASE_URL=https://api.greenbit.com
VITE_API_TIMEOUT=30000
```

---

## 📚 Documentación de Referencia

| Archivo                          | Descripción                         |
| -------------------------------- | ----------------------------------- |
| `API_ENDPOINTS_COMPLETE.md`      | Documentación completa de endpoints |
| `MIGRATION_GUIDE.md`             | Guía de migración                   |
| `THUNDER_CLIENT_COLLECTION.json` | Colección Thunder Client            |
| `front/src/config/endpoints.ts`  | Definiciones TypeScript             |
| `front/src/services/api.ts`      | Configuración de axios              |

---

## 🎯 Próximos Pasos

1. **Migrar componentes restantes** (ver `MIGRATION_GUIDE.md`)
2. **Probar todos los endpoints** con Thunder Client
3. **Actualizar tests** para usar el sistema centralizado
4. **Documentar endpoints custom** si se agregan nuevos

---

## 👥 Para el Equipo

### Backend

- Todos los endpoints están listados en `server.js`
- Documentados en `API_ENDPOINTS_COMPLETE.md`
- Colección Thunder listo para pruebas

### Frontend

- Importa `api` y `API_ENDPOINTS`
- Sigue los ejemplos en `MIGRATION_GUIDE.md`
- No uses URLs hardcodeadas

### QA/Testing

- Usa `THUNDER_CLIENT_COLLECTION.json`
- Consulta `API_ENDPOINTS_COMPLETE.md` para casos de prueba
- Variables configurables en colección

---

## 🐛 Solución de Problemas

### Error 404 en endpoints

- Verifica que el endpoint esté en `API_ENDPOINTS`
- Comprueba que el backend tenga la ruta montada
- Revisa `server.js` para confirmar el path

### Error de CORS

- Verifica `VITE_API_BASE_URL` en `.env`
- Comprueba configuración CORS en `server.js`

### Token no se envía

- El interceptor en `api.ts` lo hace automáticamente
- Verifica que el usuario esté en localStorage

---

**Creado:** Noviembre 6, 2025  
**Versión:** 1.0.0  
**Autor:** Sistema de Globalización de APIs
