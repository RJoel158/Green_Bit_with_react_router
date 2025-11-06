# Sistema Globalizado de Estados - Green Bit

## 📋 Resumen de Cambios

Se ha implementado un sistema globalizado de manejo de estados para las entidades `Request` y `AppointmentConfirmation` en la aplicación Green Bit. Este sistema estandariza el flujo de trabajo completo desde que un reciclador publica material hasta que se completa la recolección.

---

## 🎯 Estados Definidos

### Request States (Solicitud de Reciclaje)

| Estado    | Valor | Nombre     | Descripción                                               |
| --------- | ----- | ---------- | --------------------------------------------------------- |
| REQUESTED | 0     | Solicitado | Un collector ha solicitado recoger el material (temporal) |
| OPEN      | 1     | Abierto    | Disponible para ser recogido (visible en mapa)            |
| ACCEPTED  | 2     | Aceptado   | Reciclador aceptó la solicitud del recolector             |
| REJECTED  | 3     | Rechazado  | Reciclador rechazó la solicitud del recolector            |
| CLOSED    | 4     | Cerrado    | Recolección completada exitosamente                       |
| CANCELLED | 5     | Cancelado  | Cancelado por alguna de las partes                        |

### Appointment States (Cita de Recolección)

| Estado      | Valor | Nombre      | Descripción                           |
| ----------- | ----- | ----------- | ------------------------------------- |
| PENDING     | 0     | Pendiente   | Esperando confirmación del reciclador |
| ACCEPTED    | 1     | Aceptado    | Reciclador aceptó la cita             |
| IN_PROGRESS | 2     | En Progreso | Recolección en progreso (opcional)    |
| REJECTED    | 3     | Rechazado   | Reciclador rechazó la cita            |
| COMPLETED   | 4     | Completado  | Recolección completada exitosamente   |
| CANCELLED   | 5     | Cancelado   | Cancelado por alguna de las partes    |

---

## 🔄 Flujo de Trabajo Completo

### 1. Creación de Request (Reciclador)

- **Acción**: Reciclador llena formulario y registra material
- **Estado Request**: `OPEN (1)`
- **Estado Appointment**: N/A
- **Visible en mapa**: ✅ SÍ

### 2. Solicitud de Recolección (Collector)

- **Acción**: Collector clickea marcador en el mapa y solicita recoger
- **Estado Request**: `OPEN (1)` → `REQUESTED (0)`
- **Estado Appointment**: `PENDING (0)` (se crea)
- **Visible en mapa**: ❌ NO (temporalmente bloqueado)
- **Notificación**: Se envía al reciclador

### 3a. Reciclador Acepta

- **Acción**: Reciclador acepta la solicitud
- **Estado Request**: `REQUESTED (0)` → `ACCEPTED (2)`
- **Estado Appointment**: `PENDING (0)` → `ACCEPTED (1)`
- **Visible en mapa**: ❌ NO
- **Notificación**: Se envía al collector

### 3b. Reciclador Rechaza

- **Acción**: Reciclador rechaza la solicitud
- **Estado Request**: `REQUESTED (0)` → `OPEN (1)`
- **Estado Appointment**: `PENDING (0)` → `REJECTED (3)`
- **Visible en mapa**: ✅ SÍ (vuelve a estar disponible)
- **Notificación**: Se envía al collector

### 4a. Cancelación (Cualquiera de las partes)

- **Acción**: Collector o Reciclador cancela la cita
- **Estado Request**: `ACCEPTED (2)` → `OPEN (1)`
- **Estado Appointment**: `ACCEPTED (1)` → `CANCELLED (5)`
- **Visible en mapa**: ✅ SÍ (vuelve a estar disponible)

### 4b. Completar Recolección

- **Acción**: Cualquiera marca como completado
- **Estado Request**: `ACCEPTED (2)` → `CLOSED (4)`
- **Estado Appointment**: `ACCEPTED (1)` → `COMPLETED (4)`
- **Visible en mapa**: ❌ NO (finalizado)

---

## 📁 Archivos Modificados

### Backend

1. **`back/shared/constants.js`** (NUEVO)

   - Definición centralizada de estados
   - Funciones helper para validación y etiquetas

2. **`back/Models/Forms/requestModel.js`**

   - Importa constantes globales
   - Estado por defecto: `OPEN (1)`

3. **`back/Models/appointmentModel.js`**

   - Importa constantes globales
   - `createAppointment()`: Request → REQUESTED (0), Appointment → PENDING (0)
   - `acceptAppointment()`: Request → ACCEPTED (2), Appointment → ACCEPTED (1)
   - `rejectAppointment()`: Request → OPEN (1), Appointment → REJECTED (3)
   - `cancelAppointment()`: Request → OPEN (1), Appointment → CANCELLED (5)
   - `completeAppointment()`: Request → CLOSED (4), Appointment → COMPLETED (4)

4. **`back/Controllers/requestController.js`**

   - Importa constantes
   - Usa `REQUEST_STATE.OPEN` como default

5. **`back/Controllers/appointmentController.js`**

   - Nuevos endpoints:
     - `POST /api/appointments/:id/accept`
     - `POST /api/appointments/:id/reject`
     - `POST /api/appointments/:id/complete`
     - `POST /api/appointments/:id/cancel` (actualizado)

6. **`back/Routes/requestAppointmentRoutes.js`**
   - Rutas para nuevos endpoints

### Frontend

1. **`front/src/shared/constants.ts`** (NUEVO)

   - Definición TypeScript de estados
   - Funciones helper tipadas

2. **`front/src/components/FormComps/FormComp.tsx`**

   - Usa `REQUEST_STATE.OPEN` al crear request

3. **`front/src/components/CollectorMapComps/Map.tsx`**

   - Filtra solo requests con estado `OPEN (1)`
   - Importa constantes globales

4. **`front/src/components/PickupDetailsComp/PickupInfo.tsx`**
   - Importa constantes y funciones de etiquetas
   - Muestra etiquetas dinámicas con `getRequestStateLabel()` y `getAppointmentStateLabel()`
   - Nuevas funciones:
     - `handleAcceptAppointment()`
     - `handleRejectAppointment()`
     - `handleCompleteAppointment()`
     - `handleCancelAppointment()` (actualizado)
   - Botones condicionales según estado:
     - **PENDING**: Aceptar / Rechazar
     - **ACCEPTED**: Completar / Cancelar
     - **REJECTED/CANCELLED/COMPLETED**: Solo mensaje informativo

---

## 🔧 Uso de las Constantes

### Backend (JavaScript)

```javascript
import { REQUEST_STATE, APPOINTMENT_STATE } from "../shared/constants.js";

// Crear request en estado OPEN
const state = REQUEST_STATE.OPEN; // 1

// Validar estado
if (appointment.state === APPOINTMENT_STATE.PENDING) {
  // Lógica para estado pendiente
}
```

### Frontend (TypeScript)

```typescript
import {
  REQUEST_STATE,
  APPOINTMENT_STATE,
  getRequestStateLabel,
} from "../../shared/constants";

// Mostrar etiqueta legible
const label = getRequestStateLabel(request.state); // "Abierto"

// Filtrar requests abiertas
const openRequests = requests.filter((r) => r.state === REQUEST_STATE.OPEN);
```

---

## 🎨 UI/UX - Estados en la Interfaz

### Mapa (Collector)

- ✅ Solo muestra marcadores de requests en estado `OPEN (1)`
- 🔄 Se ocultan automáticamente cuando cambian a `REQUESTED (0)`
- 🔄 Reaparecen si son rechazadas o canceladas

### Modal de Detalles (PickupInfo)

#### Vista PENDING (Reciclador)

```
┌─────────────────────────────────┐
│  Estado: Pendiente              │
│  ✓ Aceptar Solicitud            │
│  ✕ Rechazar Solicitud           │
└─────────────────────────────────┘
```

#### Vista ACCEPTED (Ambos)

```
┌─────────────────────────────────┐
│  Estado: Aceptado               │
│  ✓ Marcar como Completado       │
│  Cancelar Recojo                │
└─────────────────────────────────┘
```

#### Vista COMPLETED

```
┌─────────────────────────────────┐
│  Estado: Completado             │
│  ✓ Recolección completada       │
│  [Cerrar]                       │
└─────────────────────────────────┘
```

---

## 🧪 Testing Recomendado

### Caso 1: Flujo Completo Exitoso

1. Reciclador crea request → Estado OPEN
2. Verificar que aparece en mapa
3. Collector solicita recoger → Estado REQUESTED, Appointment PENDING
4. Verificar que desaparece del mapa
5. Reciclador acepta → Estado ACCEPTED, Appointment ACCEPTED
6. Cualquiera marca completado → Estado CLOSED, Appointment COMPLETED

### Caso 2: Rechazo

1. Reciclador crea request → Estado OPEN
2. Collector solicita recoger → Estado REQUESTED
3. Reciclador rechaza → Estado OPEN, Appointment REJECTED
4. Verificar que reaparece en mapa

### Caso 3: Cancelación

1. Request en estado ACCEPTED
2. Cualquiera cancela → Estado OPEN, Appointment CANCELLED
3. Verificar que reaparece en mapa

---

## ⚠️ Notas Importantes

1. **Base de Datos**: Asegúrate de que las columnas `state` en las tablas `request` y `appointmentconfirmation` sean de tipo `INT` o `TINYINT`.

2. **Migraciones**: Si hay datos existentes con estados antiguos, considera una migración:

   ```sql
   -- Convertir estados antiguos de Request
   UPDATE request SET state = 1 WHERE state = 0; -- OPEN
   UPDATE request SET state = 0 WHERE state = 2; -- REQUESTED

   -- Convertir estados antiguos de Appointment
   -- Ajustar según tu lógica anterior
   ```

3. **Notificaciones**: Las notificaciones se envían automáticamente en cada transición de estado.

4. **Permisos**: Actualmente no hay validación estricta de permisos para cancelar/completar. Ambas partes pueden hacerlo.

---

## 🚀 Próximos Pasos

- [ ] Probar flujo completo en ambiente de desarrollo
- [ ] Verificar notificaciones en tiempo real
- [ ] Ajustar estilos CSS según diseño
- [ ] Implementar validaciones de permisos si es necesario
- [ ] Documentar endpoints en README o Swagger

---

## 📞 Soporte

Si encuentras algún problema con el nuevo sistema de estados, verifica:

1. Que los estados en BD coincidan con las constantes
2. Que el backend y frontend usen las mismas constantes
3. Los logs de la consola para transiciones de estado

---

**Fecha de Implementación**: $(date)
**Versión**: 2.0.0
**Autor**: Sistema de Estados Globalizados
