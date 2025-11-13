# 🧪 GUÍA DE PRUEBAS DE RUTAS - Green Bit Backend

## 📋 Descripción

He creado dos scripts de prueba completos para verificar que **TODAS las rutas** que usa el frontend funcionan correctamente en el backend antes de hacer el hosting.

- **68 rutas totales** testeadas
- Validación de métodos HTTP (GET, POST, PUT, DELETE)
- Cobertura de todas las categorías del API

## 🚀 Scripts Disponibles

### 1️⃣ `test-all-routes.js` - Pruebas en Consola

**Propósito:** Pruebas rápidas con salida colorida en la consola.

```bash
cd back
node test-all-routes.js
```

**Características:**
- ✅ Salida coloreada en consola
- ✅ Prueba cada ruta con datos de muestra
- ✅ Resumen final con estadísticas
- ✅ Lista de errores encontrados
- ✅ Tiempo de ejecución

**Ejemplo de salida:**
```
════════════════════════════════════════════════════════════════════════════════
█ SISTEMA Y HEALTH CHECK (1 ruta)
════════════════════════════════════════════════════════════════════════════════

✓ GET    /health                                            [200] Health check del servidor

════════════════════════════════════════════════════════════════════════════════
█ USUARIOS (17 rutas)
════════════════════════════════════════════════════════════════════════════════

✓ POST   /users/login                                       [200] Login de usuario
✓ POST   /users                                             [400] Crear usuario
✗ POST   /users/collector                                   [500] Crear usuario reciclador
...
```

### 2️⃣ `test-routes-report.js` - Reporte HTML Visual

**Propósito:** Generar un reporte visual en HTML para análisis detallado.

```bash
cd back
node test-routes-report.js
```

**Genera:** `routes-test-report.html`

**Características:**
- 📊 Gráficas visuales de estadísticas
- 📁 Organización por categorías
- ⏱️ Tiempos de respuesta por ruta
- 📈 Tasa de éxito porcentual
- 🎨 Interfaz moderna y responsiva
- 📱 Compatible con móviles

**Abre el reporte en tu navegador:**
```bash
# En Windows
start routes-test-report.html

# En macOS
open routes-test-report.html

# En Linux
xdg-open routes-test-report.html
```

## 📊 Rutas Cubiertas

### Sistema (1 ruta)
- ✅ Health check

### Usuarios (17 rutas)
- ✅ Login
- ✅ Registro (usuario normal, recolector, institución)
- ✅ Recuperar contraseña
- ✅ Cambiar contraseña
- ✅ Gestión de recolectores pendientes
- ✅ Gestión de usuarios e instituciones
- ✅ Aprobación/rechazo de usuarios
- ✅ Consulta de usuarios por rol/tipo

### Materiales (5 rutas)
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Obtener por ID

### Solicitudes (7 rutas)
- ✅ CRUD de solicitudes
- ✅ Solicitudes por usuario y estado
- ✅ Solicitudes con horario
- ✅ Actualizar estado
- ✅ Programar cita desde solicitud

### Citas (12 rutas)
- ✅ CRUD de citas
- ✅ Citas por recolector/reciclador
- ✅ Aceptar, rechazar, cancelar, completar
- ✅ Programar nueva cita

### Notificaciones (3 rutas)
- ✅ Obtener notificaciones del usuario
- ✅ Contar no leídas
- ✅ Marcar como leída

### Puntuaciones (5 rutas)
- ✅ Crear puntuación
- ✅ Verificar si usuario calificó
- ✅ Obtener puntuaciones de cita
- ✅ Promedio de calificación del usuario

### Anuncios (6 rutas)
- ✅ CRUD de anuncios
- ✅ Anuncios por rol

### Upload (3 rutas)
- ✅ Subir imagen de anuncio
- ✅ Obtener info de imagen
- ✅ Eliminar imagen

### Ranking (7 rutas)
- ✅ Gestión de períodos
- ✅ Ranking en vivo
- ✅ Tops y histórico

### Reportes (3 rutas)
- ✅ Reporte de materiales
- ✅ Reporte de puntuaciones
- ✅ Reporte de recolecciones

## 🔧 Cómo Usar en tu Workflow

### Opción 1: Pruebas Rápidas Locales (Desarrollo)

```bash
# 1. Asegurate que el servidor esté corriendo
cd back
npm start

# 2. En otra terminal, ejecuta las pruebas
node test-all-routes.js

# 3. Revisa la consola para errores
```

### Opción 2: Pruebas Antes de Deploy (Recomendado)

```bash
# 1. Inicia el servidor
cd back
npm start

# 2. Espera a que esté completamente iniciado
# (Deberías ver "✅ Servidor completamente iniciado")

# 3. En otra terminal, genera el reporte HTML
node test-routes-report.js

# 4. Abre el reporte en tu navegador
# Windows: start routes-test-report.html
# macOS: open routes-test-report.html
# Linux: xdg-open routes-test-report.html

# 5. Revisa que TODOS los puntos sean verdes (✓)
# Si hay rojos (✗), corrige antes de hacer deploy
```

### Opción 3: Integración en CI/CD

```bash
# En tu pipeline de CI/CD (GitHub Actions, etc.)
cd back
npm install
npm start &  # Inicia el servidor en background

# Espera a que inicie
sleep 5

# Ejecuta las pruebas
node test-all-routes.js

# Captura el código de salida
if [ $? -eq 0 ]; then
  echo "✅ Todas las rutas funcionan"
else
  echo "❌ Algunas rutas fallaron"
  exit 1
fi
```

## 📈 Interpretando Resultados

### Códigos de Status Esperados

| Status | Significado | Acción |
|--------|------------|--------|
| 2xx (200-299) | ✅ Ruta funciona | Todo bien |
| 400 | ⚠️ Datos inválidos | Normal (datos de test no existen) |
| 404 | ⚠️ Recurso no encontrado | Normal (datos de test no existen) |
| 5xx (500-599) | ❌ Error del servidor | **REVISAR** |

### Rutas "Fallidas" que son Normales

Algunas rutas mostrarán como "fallidas" porque los datos de prueba no existen en tu base de datos. **ESTO ES NORMAL**. Lo importante es:

- ✅ La ruta **responde** (status 400 o 404)
- ✅ **No hay error 500** (error del servidor)
- ✅ El endpoint **existe** y es accesible

Ejemplos normales:
```
✗ POST /users/login [400]              ← Credenciales inválidas
✗ GET  /users/1 [404]                  ← Usuario no existe
✗ PUT  /material/999 [404]              ← Material no existe
```

### Rutas que Podrían Fallar

Si ves estos **SI necesita investigación**:

```
✗ POST /users/login [500]               ← Error interno
✗ GET  /health [500]                    ← Error del servidor
✗ POST /material [500]                  ← Error en creación
```

## 🔍 Debugging si Encuentras Errores

### Paso 1: Revisar Logs del Servidor

```bash
# En la terminal donde corre el servidor, busca mensajes de error
# Por ejemplo:
# [ERROR GLOBAL]: { message: '...', status: 500 }
```

### Paso 2: Verificar Conexión a BD

```bash
# Ejecuta este script para verificar la BD
cd back
node test-connection.js
```

### Paso 3: Revisar Variables de Entorno

```bash
# Asegúrate que tu .env tiene todas las variables requeridas
cat .env | grep -E "^(PORT|DB_|NODE_ENV|FRONTEND_URL)"
```

### Paso 4: Verificar Logs en Detail

```bash
# Los scripts generan logs detallados
# Busca en la salida:
# - [ERROR GLOBAL]: Errores del servidor
# - [Socket.IO]: Problemas de conexión
# - Stack traces: Pinchazos de código
```

## 📝 Formato de Reporte HTML

El reporte HTML incluye:

1. **Header con Estadísticas**
   - Total de rutas
   - Rutas exitosas
   - Rutas fallidas
   - Tiempo promedio de respuesta

2. **Tarjetas por Categoría**
   - Lista de rutas en cada categoría
   - Estado (✓ o ✗)
   - Método HTTP
   - Path del endpoint
   - Tiempo de respuesta

3. **Pie con Resumen**
   - Tasa de éxito
   - Fecha y hora de ejecución
   - URL del API testeado

## 🎯 Pre-Deploy Checklist

Antes de hacer deploy a hosting:

```
□ ¿Todas las rutas muestran ✓ o status 400/404 (aceptable)?
□ ¿No hay errores 500 en rutas críticas (login, health)?
□ ¿El tiempo de respuesta es <500ms en promedio?
□ ¿La conexión a BD está confirmada?
□ ¿Las variables de entorno están correctas?
□ ¿El archivo .env tiene todos los valores requeridos?
□ ¿Socket.IO está conectando correctamente?
□ ¿El sistema de notificaciones funciona?
□ ¿Los uploads de archivos funcionan?
□ ¿Todas las categorías de rutas (17 tipos) están funcionando?
```

## 🚨 Si Algo Falla

### "No se puede conectar al servidor"

```bash
# Verifica que el servidor está corriendo
netstat -an | grep 3000  # Windows: netstat -ano | findstr :3000

# Si no está, inicia el servidor
cd back
npm start
```

### "Error 500 en una ruta"

```bash
# 1. Revisa los logs del servidor
# 2. Verifica la BD está conectada
# 3. Revisa el código del controller para esa ruta
# 4. Busca en los archivos de logs si existen
```

### "Algunas rutas devuelven 404"

```bash
# Verifica que las rutas estén definidas en:
# back/Routes/index.js

# Y que los controllers estén importados correctamente
```

## 📞 Más Información

Los scripts generan salida detallada. Si necesitas investigar más:

1. **Para ver más detalles**, abre el código del script
2. **Agrega console.log()** en los controllers si necesitas debuggear
3. **Usa Thunder Client** o **Postman** para pruebas manuales
4. **Revisa el archivo**: `/back/Routes/index.js` para lista de rutas

---

## Resumen Rápido

```bash
# OPCIÓN 1: Test rápido en consola
cd back && npm start  # Terminal 1
node test-all-routes.js  # Terminal 2

# OPCIÓN 2: Reporte visual (RECOMENDADO)
cd back && npm start  # Terminal 1
node test-routes-report.js  # Terminal 2
start routes-test-report.html  # Abre el reporte
```

**¡Éxito con tus pruebas! 🚀**
