# 🚀 QUICK START - PRUEBAS DE RUTAS

## ¿Qué necesitas hacer?

Tienes **dos formas** de probar todas las rutas del backend:

---

## 📋 OPCIÓN 1: Consola Rápida (Recomendado para desarrollo)

### Paso 1: Abre una terminal y ve a la carpeta backend
```bash
cd back
```

### Paso 2: Inicia el servidor
```bash
npm start
```

Verás algo como:
```
🚀 GreenBit v1.0.0
🌐 Servidor + Socket.IO escuchando en puerto 3000
✅ Servidor completamente iniciado
```

### Paso 3: Abre OTRA terminal y ejecuta las pruebas
```bash
cd back
npm run test:routes
```

### Verás un resultado como:
```
════════════════════════════════════════════════════════════════════════════════
█ SISTEMA Y HEALTH CHECK (1 ruta)
════════════════════════════════════════════════════════════════════════════════

✓ GET    /health                                            [200] Health check del servidor

════════════════════════════════════════════════════════════════════════════════
█ USUARIOS (17 rutas)
════════════════════════════════════════════════════════════════════════════════

✓ POST   /users/login                                       [400] Login de usuario
✓ GET    /users/1                                           [404] Usuario por ID
...
```

**Si ves ✓** = Funciona ✅
**Si ves ✗** = Revisar error ❌

---

## 📊 OPCIÓN 2: Reporte Visual en HTML (Recomendado para pre-deploy)

### Paso 1: Asegúrate que el servidor esté corriendo
```bash
cd back
npm start
```

### Paso 2: En OTRA terminal, genera el reporte
```bash
cd back
npm run test:report
```

### Paso 3: Se abre automáticamente en tu navegador

Si no se abre, abre manualmente el archivo:
```bash
# Windows
start routes-test-report.html

# macOS
open routes-test-report.html

# Linux
xdg-open routes-test-report.html
```

**El reporte mostrará:**
- ✅ Total de rutas probadas
- ✅ Cuáles pasaron (green ✓)
- ✅ Cuáles fallaron (red ✗)
- ✅ Tiempo de respuesta
- ✅ Organizado por categorías

---

## 🎯 Checklist Antes de Hostear

Ejecuta las pruebas y verifica:

```
[ ] npm run test:report generó un HTML
[ ] El reporte abre en el navegador
[ ] La mayoría de rutas muestran ✓ (green)
[ ] No hay errores 500 (esos son críticos)
[ ] Errores 400/404 son aceptables (datos no existen)
[ ] Tiempo promedio de respuesta < 500ms
```

Si todo está ✅ → **Puedes hostear con confianza**

---

## 🆘 Si Algo Falla

### "Error: connect ECONNREFUSED"
→ El servidor no está corriendo. Ejecuta primero: `npm start`

### "Error 500 en varias rutas"
→ Revisar que la BD está conectada: `node test-connection.js`

### "Reporte no abre"
→ Abre manualmente: `routes-test-report.html`

---

## 📚 Más información

Ver archivo completo: `TEST_ROUTES_GUIDE.md`

---

## Resumen de Comandos

```bash
# Terminal 1 (servidor)
cd back && npm start

# Terminal 2 (pruebas - elige una)
cd back && npm run test:routes      # Consola rápida
cd back && npm run test:report      # Reporte HTML (visual)
```

---

**¡Listo! Ya puedes probar todas tus rutas antes de hostear 🚀**
