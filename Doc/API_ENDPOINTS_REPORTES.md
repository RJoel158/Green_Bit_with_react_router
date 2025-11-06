# API Endpoints Necesarios para ReportesAdmin

## Descripción General
El componente `ReportesAdmin` consume endpoints dinámicos desde el backend para generar 5 tipos de reportes con datos reales. Todos los endpoints deben estar autenticados (usar `credentials: 'include'`).

---

## Endpoints Requeridos

### 1. **Reporte de Materiales Reciclados**
```
GET /api/reports/materiales?dateFrom=2025-12-01&dateTo=2025-12-06
```

**Descripción:** Obtiene la distribución de materiales reciclados en un período

**Query Parameters:**
- `dateFrom` (string, formato ISO): Fecha inicio del reporte
- `dateTo` (string, formato ISO): Fecha fin del reporte

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Papeles",
      "percentage": 40,
      "kg": 1250,
      "color": "#22c55e"
    },
    {
      "name": "Cartón",
      "percentage": 32,
      "kg": 1000,
      "color": "#10b981"
    },
    {
      "name": "Plásticos",
      "percentage": 18,
      "kg": 562,
      "color": "#6ee7b7"
    },
    {
      "name": "Otros",
      "percentage": 10,
      "kg": 312,
      "color": "#d1fae5"
    }
  ]
}
```

---

### 2. **Reporte de Recolectores Top**
```
GET /api/reports/recolectores?dateFrom=2025-12-01&dateTo=2025-12-06&limit=5
```

**Descripción:** Obtiene el ranking de mejores recolectores por kg reciclados

**Query Parameters:**
- `dateFrom` (string, formato ISO): Fecha inicio
- `dateTo` (string, formato ISO): Fecha fin
- `limit` (number, default: 5): Cantidad de top recolectores

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "name": "Juan Pérez",
      "kg": 450,
      "percentage": 15
    },
    {
      "rank": 2,
      "name": "María García",
      "kg": 380,
      "percentage": 13
    },
    {
      "rank": 3,
      "name": "Carlos López",
      "kg": 320,
      "percentage": 11
    }
  ]
}
```

---

### 3. **Reporte de Citas/Solicitudes**
```
GET /api/reports/citas?dateFrom=2025-12-01&dateTo=2025-12-06
```

**Descripción:** Obtiene solicitudes de reciclaje agrupadas por día con estados

**Query Parameters:**
- `dateFrom` (string, formato ISO): Fecha inicio
- `dateTo` (string, formato ISO): Fecha fin

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "day": "Lun",
      "completed": 45,
      "pending": 12,
      "cancelled": 3
    },
    {
      "day": "Mar",
      "completed": 52,
      "pending": 8,
      "cancelled": 2
    },
    {
      "day": "Mié",
      "completed": 48,
      "pending": 15,
      "cancelled": 4
    }
  ]
}
```

---

### 4. **Reporte de Puntuaciones**
```
GET /api/reports/puntuaciones?dateFrom=2025-12-01&dateTo=2025-12-06
```

**Descripción:** Obtiene distribución de calificaciones de recolectores

**Query Parameters:**
- `dateFrom` (string, formato ISO): Fecha inicio
- `dateTo` (string, formato ISO): Fecha fin

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "stars": 5,
      "count": 245,
      "percentage": 42,
      "label": "Excelente"
    },
    {
      "stars": 4,
      "count": 180,
      "percentage": 31,
      "label": "Bueno"
    },
    {
      "stars": 3,
      "count": 95,
      "percentage": 16,
      "label": "Normal"
    },
    {
      "stars": 2,
      "count": 35,
      "percentage": 6,
      "label": "Malo"
    },
    {
      "stars": 1,
      "count": 10,
      "percentage": 5,
      "label": "Muy Malo"
    }
  ]
}
```

---

### 5. **Reporte de Instituciones**
```
GET /api/reports/instituciones?dateFrom=2025-12-01&dateTo=2025-12-06
```

**Descripción:** Obtiene comparativa de reciclaje por institución vs meta establecida

**Query Parameters:**
- `dateFrom` (string, formato ISO): Fecha inicio
- `dateTo` (string, formato ISO): Fecha fin

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "name": "Colegio Central",
      "kg": 1200,
      "meta": 1000,
      "percentage": 18
    },
    {
      "rank": 2,
      "name": "Universidad Tech",
      "kg": 980,
      "meta": 1000,
      "percentage": 15
    },
    {
      "rank": 3,
      "name": "Hospital Regional",
      "kg": 850,
      "meta": 800,
      "percentage": 13
    }
  ]
}
```

---

### 6. **Descargar Reporte en PDF** (Opcional)
```
GET /api/reports/{reportType}/pdf?dateFrom=2025-12-01&dateTo=2025-12-06
```

**Descripción:** Genera y descarga un PDF del reporte

**Path Parameters:**
- `reportType` (string): `materiales | recolectores | citas | puntuaciones | instituciones`

**Query Parameters:**
- `dateFrom` (string, formato ISO): Fecha inicio
- `dateTo` (string, formato ISO): Fecha fin

**Response (200 OK):**
- Content-Type: `application/pdf`
- Body: Archivo PDF descargable

---

## Estructura del Proyecto

### Frontend (React/TypeScript)
```
src/
├── services/
│   └── reportService.ts        # Llamadas a los endpoints
├── components/
│   └── AdminDashboardComp/
│       └── ReportesAdmin.tsx    # Componente que consume los datos
└── config/
    └── environment.ts          # Configuración base de URLs
```

### Backend (Node.js)
```
back/
├── Routes/
│   └── reportRoutes.js         # NUEVO: Rutas de reportes
├── Controllers/
│   └── reportController.js     # NUEVO: Lógica de reportes
└── Models/
    ├── appointmentModel.js     # Ya existe
    ├── materialModel.js        # Ya existe
    └── scoreModel.js           # Ya existe
```

---

## Funcionalidades Dinámicas Implementadas

### ✅ En el Frontend:

1. **useEffect Hook** - Carga automática de datos cuando:
   - Cambia `selectedReport`
   - Cambia `dateFrom`
   - Cambia `dateTo`

2. **Estados Dinámicos** - Cada tipo de reporte mantiene su propio estado:
   - `materialesData`
   - `recolectoresData`
   - `citasData`
   - `puntuacionesData`
   - `institucionesData`

3. **Manejo de Errores**:
   - Banner de error visible
   - Logging en consola
   - Fallback a arrays vacíos si falla la API

4. **Loading State**:
   - Spinner animado mientras carga
   - Deshabilitación de botones durante carga

5. **Resumen Dinámico**:
   - Calcula estadísticas en tiempo real
   - Actualiza según datos obtenidos
   - Muestra información relevante por tipo de reporte

6. **Descarga de PDF**:
   - Llamada a endpoint `/api/reports/{type}/pdf`
   - Descarga automática del archivo

---

## Ejemplo de Implementación en Backend (Node.js)

### `/back/Routes/reportRoutes.js`
```javascript
router.get('/reports/materiales', authenticate, reportController.getMateriales);
router.get('/reports/recolectores', authenticate, reportController.getRecolectores);
router.get('/reports/citas', authenticate, reportController.getCitas);
router.get('/reports/puntuaciones', authenticate, reportController.getPuntuaciones);
router.get('/reports/instituciones', authenticate, reportController.getInstituciones);
router.get('/reports/:type/pdf', authenticate, reportController.downloadReportPDF);
```

### `/back/Controllers/reportController.js`
```javascript
exports.getMateriales = async (req, res) => {
  const { dateFrom, dateTo } = req.query;
  // Lógica: consultar BD, agrupar por material, calcular kg y porcentajes
  res.json({ success: true, data: [...] });
};
```

---

## Testing

Para probar localmente sin backend:

1. Los datos mock están comentados en `ReportesAdmin.tsx`
2. El servicio `reportService.ts` está listo para recibir datos
3. La UI ya está completamente funcional

Para activar el backend:
1. Implementar los endpoints listados arriba
2. El frontend automáticamente usará los datos reales

---

## Notas Importantes

- ✅ Todos los gráficos (Donut, Pirámide, Barras) ya están implementados en SVG
- ✅ Las tablas se actualizan automáticamente con los datos
- ✅ El resumen lateral calcula dinámicamente estadísticas
- ✅ Manejo de estados de carga y error integrado
- ⏳ Backend endpoints aún no implementados (esta es la siguiente fase)

