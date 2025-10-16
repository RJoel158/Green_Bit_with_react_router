# 🔄 Diagrama de Flujo - Estados Green Bit

## Flujo Visual Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE TRABAJO GREEN BIT                               │
└─────────────────────────────────────────────────────────────────────────────┘

1️⃣  RECICLADOR CREA REQUEST
    ┌──────────────────┐
    │ Request: OPEN(1) │  ✅ Visible en mapa
    │ Appointment: N/A │
    └──────────────────┘
            │
            ▼
    ┌────────────────────────────────┐
    │ 🗺️  Aparece en el mapa         │
    │ (Collectors pueden verlo)     │
    └────────────────────────────────┘
            │
            │
            ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  2️⃣  COLLECTOR SOLICITA RECOGER                                          │
│      ┌──────────────────────────┐                                        │
│      │ Request: REQUESTED (0)   │  ❌ Oculto temporalmente               │
│      │ Appointment: PENDING (0) │                                        │
│      └──────────────────────────┘                                        │
│                 │                                                         │
│                 │  📩 Notificación al Reciclador                         │
│                 ▼                                                         │
│      ┌────────────────────────┐                                          │
│      │ Reciclador recibe      │                                          │
│      │ notificación y decide  │                                          │
│      └────────────────────────┘                                          │
│                 │                                                         │
│      ┌──────────┴──────────┐                                            │
│      ▼                     ▼                                             │
│  ┌─────────┐         ┌──────────┐                                       │
│  │ ACEPTA  │         │ RECHAZA  │                                       │
│  └─────────┘         └──────────┘                                       │
│      │                     │                                             │
└──────┼─────────────────────┼─────────────────────────────────────────────┘
       │                     │
       ▼                     ▼

3️⃣a ACEPTADO                3️⃣b RECHAZADO
┌────────────────────┐      ┌──────────────────────┐
│ Request: ACCEPTED  │      │ Request: OPEN (1)    │  ✅ Vuelve al mapa
│ Appointment:       │      │ Appointment:         │
│   ACCEPTED (1)     │      │   REJECTED (3)       │
└────────────────────┘      └──────────────────────┘
       │                           │
       │ 📩 Notifica Collector     │ 📩 Notifica Collector
       ▼                           ▼
                             ┌──────────────────┐
                             │ 🔄 Disponible    │
                             │ para otros       │
                             └──────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│  4️⃣  OPCIONES DESPUÉS DE ACEPTAR                                         │
│                                                                           │
│      ┌─────────────────────┐                                             │
│      │  Request: ACCEPTED  │                                             │
│      │  Appointment:       │                                             │
│      │    ACCEPTED (1)     │                                             │
│      └─────────────────────┘                                             │
│              │                                                            │
│    ┌─────────┴──────────┐                                               │
│    ▼                    ▼                                                │
│ ┌─────────┐       ┌──────────┐                                          │
│ │CANCELAR │       │COMPLETAR │                                          │
│ └─────────┘       └──────────┘                                          │
│    │                    │                                                │
│    ▼                    ▼                                                │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

5️⃣a CANCELADO                  5️⃣b COMPLETADO
┌──────────────────────┐        ┌──────────────────────┐
│ Request: OPEN (1)    │ ✅     │ Request: CLOSED (4)  │ 🏁
│ Appointment:         │        │ Appointment:         │
│   CANCELLED (5)      │        │   COMPLETED (4)      │
└──────────────────────┘        └──────────────────────┘
       │                               │
       ▼                               ▼
┌──────────────────┐          ┌──────────────────────┐
│ 🔄 Vuelve al     │          │ ✅ Proceso finalizado│
│    mapa          │          │    exitosamente      │
└──────────────────┘          └──────────────────────┘
```

---

## 🎯 Tabla Resumen de Transiciones

| Desde Estado    | Acción             | Request         | Appointment     | En Mapa |
| --------------- | ------------------ | --------------- | --------------- | ------- |
| -               | Crear Request      | `OPEN (1)`      | -               | ✅ SÍ   |
| `OPEN (1)`      | Collector solicita | `REQUESTED (0)` | `PENDING (0)`   | ❌ NO   |
| `REQUESTED (0)` | Reciclador acepta  | `ACCEPTED (2)`  | `ACCEPTED (1)`  | ❌ NO   |
| `REQUESTED (0)` | Reciclador rechaza | `OPEN (1)`      | `REJECTED (3)`  | ✅ SÍ   |
| `ACCEPTED (2)`  | Cancelar           | `OPEN (1)`      | `CANCELLED (5)` | ✅ SÍ   |
| `ACCEPTED (2)`  | Completar          | `CLOSED (4)`    | `COMPLETED (4)` | ❌ NO   |

---

## 🎨 Colores de Estados (UI)

```
REQUEST STATES:
├─ REQUESTED (0)  🟡 Amarillo  (Temporal/Bloqueado)
├─ OPEN (1)       🟢 Verde     (Disponible)
├─ ACCEPTED (2)   🔵 Azul      (En proceso)
├─ REJECTED (3)   🔴 Rojo      (Rechazado)
├─ CLOSED (4)     ⚫ Gris      (Finalizado)
└─ CANCELLED (5)  🟠 Naranja   (Cancelado)

APPOINTMENT STATES:
├─ PENDING (0)     🟡 Amarillo  (Esperando)
├─ ACCEPTED (1)    🔵 Azul      (Confirmado)
├─ IN_PROGRESS (2) 🟣 Púrpura   (En curso)
├─ REJECTED (3)    🔴 Rojo      (Rechazado)
├─ COMPLETED (4)   🟢 Verde     (Completado)
└─ CANCELLED (5)   🟠 Naranja   (Cancelado)
```

---

## 📱 Acciones por Rol

### RECICLADOR (Dueño del material)

```
┌────────────────────────────────────────┐
│ Estado PENDING (0)                     │
│ ✅ Aceptar solicitud                   │
│ ❌ Rechazar solicitud                  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Estado ACCEPTED (1)                    │
│ ✓  Completar recolección               │
│ 🚫 Cancelar cita                       │
└────────────────────────────────────────┘
```

### COLLECTOR (Recolector)

```
┌────────────────────────────────────────┐
│ Ver Mapa                               │
│ 🗺️  Clickear marcador OPEN             │
│ 📝 Agendar fecha/hora                  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ Estado ACCEPTED (1)                    │
│ ✓  Completar recolección               │
│ 🚫 Cancelar cita                       │
└────────────────────────────────────────┘
```

---

## 🔐 Permisos Actuales

| Acción                | Reciclador | Collector | Admin |
| --------------------- | ---------- | --------- | ----- |
| Crear Request         | ✅         | ❌        | ✅    |
| Solicitar Recoger     | ❌         | ✅        | ✅    |
| Aceptar Solicitud     | ✅         | ❌        | ✅    |
| Rechazar Solicitud    | ✅         | ❌        | ✅    |
| Cancelar Cita         | ✅         | ✅        | ✅    |
| Completar Recolección | ✅         | ✅        | ✅    |

---

## 🔔 Sistema de Notificaciones

```
EVENTO                    │ NOTIFICA A      │ MENSAJE
──────────────────────────┼─────────────────┼────────────────────────────
Collector solicita        │ Reciclador      │ "Solicitud de recolección"
Reciclador acepta         │ Collector       │ "Tu solicitud fue aceptada"
Reciclador rechaza        │ Collector       │ "Tu solicitud fue rechazada"
Cualquiera cancela        │ Ambos           │ "La cita fue cancelada"
Cualquiera completa       │ Ambos           │ "Recolección completada"
```

---

## 🐛 Debugging - Checkpoints

### Backend

```javascript
// En appointmentModel.js
console.log("[INFO] createAppointment - request state:", requestState);
console.log("[INFO] acceptAppointment - transitions:", { from, to });
```

### Frontend

```typescript
// En PickupInfo.tsx
console.log("Current appointment state:", appointmentData.state);
console.log("Action triggered:", actionName);
```

### Base de Datos

```sql
-- Ver estados actuales
SELECT
  r.id as request_id,
  r.state as request_state,
  ac.id as appointment_id,
  ac.state as appointment_state
FROM request r
LEFT JOIN appointmentconfirmation ac ON ac.idRequest = r.id
ORDER BY r.registerDate DESC
LIMIT 10;
```

---

**Nota**: Este flujo garantiza que ninguna request se pierda y que siempre haya trazabilidad completa del proceso.
