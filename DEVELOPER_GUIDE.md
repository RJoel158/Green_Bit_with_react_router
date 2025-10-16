# 💻 Guía de Desarrollo - Sistema de Estados

## 🎯 Para Desarrolladores Backend

### 1. Importar Constantes

```javascript
import {
  REQUEST_STATE,
  APPOINTMENT_STATE,
  getRequestStateLabel,
  getAppointmentStateLabel,
  isValidRequestState,
  isValidAppointmentState,
} from "../shared/constants.js";
```

### 2. Crear un Request

```javascript
// En un controller
const requestId = await RequestModel.create(
  conn,
  userId,
  description,
  materialId,
  latitude,
  longitude,
  REQUEST_STATE.OPEN // ← Usar constante en lugar de número
);
```

### 3. Cambiar Estado de Request

```javascript
// Verificar estado actual
const request = await RequestModel.getById(requestId);

if (request.state === REQUEST_STATE.OPEN) {
  // Cambiar a REQUESTED
  await RequestModel.updateState(conn, requestId, REQUEST_STATE.REQUESTED);
}
```

### 4. Validar Estados

```javascript
// Antes de guardar en BD
if (!isValidRequestState(newState)) {
  throw new Error(`Estado inválido: ${newState}`);
}
```

### 5. Crear Endpoint con Estados

```javascript
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    // Validar
    if (!isValidRequestState(state)) {
      return res.status(400).json({
        success: false,
        error: "Estado inválido",
      });
    }

    // Lógica de negocio según el estado
    switch (parseInt(state)) {
      case REQUEST_STATE.OPEN:
        // Lógica para estado OPEN
        break;
      case REQUEST_STATE.ACCEPTED:
        // Lógica para estado ACCEPTED
        break;
      // ... más casos
    }

    await RequestModel.updateState(conn, id, state);

    res.json({
      success: true,
      message: `Request actualizado a ${getRequestStateLabel(state)}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

---

## 🎨 Para Desarrolladores Frontend

### 1. Importar Constantes

```typescript
import {
  REQUEST_STATE,
  APPOINTMENT_STATE,
  getRequestStateLabel,
  getAppointmentStateLabel,
  isValidRequestState,
  isValidAppointmentState,
  RequestStateType,
  AppointmentStateType,
} from "../../shared/constants";
```

### 2. Tipar Interfaces

```typescript
interface Request {
  id: number;
  description: string;
  state: RequestStateType; // ← Usar tipo
  // ... otros campos
}

interface Appointment {
  id: number;
  state: AppointmentStateType; // ← Usar tipo
  // ... otros campos
}
```

### 3. Filtrar por Estado

```typescript
// Obtener solo requests abiertas
const openRequests = requests.filter(
  (request) => request.state === REQUEST_STATE.OPEN
);

// Obtener appointments pendientes
const pendingAppointments = appointments.filter(
  (appointment) => appointment.state === APPOINTMENT_STATE.PENDING
);
```

### 4. Mostrar Etiquetas

```tsx
// En JSX
<span className="state-label">{getRequestStateLabel(request.state)}</span>

// Salida: "Abierto", "Aceptado", etc.
```

### 5. Componente con Botones Condicionales

```tsx
const RequestActions: React.FC<{ request: Request }> = ({ request }) => {
  return (
    <div className="actions">
      {request.state === REQUEST_STATE.OPEN && (
        <button onClick={handleSchedulePickup}>Solicitar Recoger</button>
      )}

      {request.state === REQUEST_STATE.ACCEPTED && (
        <>
          <button onClick={handleComplete}>Completar</button>
          <button onClick={handleCancel}>Cancelar</button>
        </>
      )}

      {request.state === REQUEST_STATE.CLOSED && (
        <span className="badge badge-success">✓ Completado</span>
      )}
    </div>
  );
};
```

### 6. Estilos Dinámicos por Estado

```tsx
const getStateColor = (state: RequestStateType): string => {
  switch (state) {
    case REQUEST_STATE.OPEN:
      return "#4CAF50"; // Verde
    case REQUEST_STATE.REQUESTED:
      return "#FFC107"; // Amarillo
    case REQUEST_STATE.ACCEPTED:
      return "#2196F3"; // Azul
    case REQUEST_STATE.REJECTED:
      return "#f44336"; // Rojo
    case REQUEST_STATE.CLOSED:
      return "#9E9E9E"; // Gris
    case REQUEST_STATE.CANCELLED:
      return "#FF9800"; // Naranja
    default:
      return "#000000";
  }
};

// Uso
<div
  style={{
    backgroundColor: getStateColor(request.state),
    color: "white",
    padding: "0.5rem",
    borderRadius: "0.25rem",
  }}
>
  {getRequestStateLabel(request.state)}
</div>;
```

### 7. Hacer Petición con Estado

```typescript
const updateRequestState = async (
  requestId: number,
  newState: RequestStateType
) => {
  try {
    const response = await fetch(apiUrl(`/api/request/${requestId}/state`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: newState }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(`Request actualizado a ${getRequestStateLabel(newState)}`);
    }
  } catch (error) {
    console.error("Error updating state:", error);
  }
};

// Uso
await updateRequestState(123, REQUEST_STATE.CLOSED);
```

---

## 🧪 Testing

### 1. Test Backend (Jest)

```javascript
import { REQUEST_STATE, isValidRequestState } from "../shared/constants.js";

describe("Request States", () => {
  test("should create request in OPEN state", async () => {
    const request = await RequestModel.create(
      conn,
      userId,
      description,
      materialId,
      lat,
      lng,
      REQUEST_STATE.OPEN
    );

    const fetched = await RequestModel.getById(request);
    expect(fetched.state).toBe(REQUEST_STATE.OPEN);
  });

  test("should validate states correctly", () => {
    expect(isValidRequestState(REQUEST_STATE.OPEN)).toBe(true);
    expect(isValidRequestState(999)).toBe(false);
  });

  test("should transition from OPEN to REQUESTED", async () => {
    const request = await RequestModel.create(
      conn,
      userId,
      description,
      materialId,
      lat,
      lng,
      REQUEST_STATE.OPEN
    );

    await RequestModel.updateState(conn, request.id, REQUEST_STATE.REQUESTED);

    const updated = await RequestModel.getById(request.id);
    expect(updated.state).toBe(REQUEST_STATE.REQUESTED);
  });
});
```

### 2. Test Frontend (React Testing Library)

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { REQUEST_STATE } from "../../shared/constants";
import RequestCard from "./RequestCard";

describe("RequestCard", () => {
  const mockRequest = {
    id: 1,
    description: "Test",
    state: REQUEST_STATE.OPEN,
  };

  test('shows "Solicitar Recoger" button when OPEN', () => {
    render(<RequestCard request={mockRequest} />);
    expect(screen.getByText("Solicitar Recoger")).toBeInTheDocument();
  });

  test("shows correct state label", () => {
    render(<RequestCard request={mockRequest} />);
    expect(screen.getByText("Abierto")).toBeInTheDocument();
  });

  test("does not show action button when CLOSED", () => {
    const closedRequest = { ...mockRequest, state: REQUEST_STATE.CLOSED };
    render(<RequestCard request={closedRequest} />);
    expect(screen.queryByText("Solicitar Recoger")).not.toBeInTheDocument();
  });
});
```

---

## 🔍 Debugging

### 1. Logs de Desarrollo

```javascript
// Backend
console.log("[STATE]", {
  before: request.state,
  after: REQUEST_STATE.ACCEPTED,
  label: getRequestStateLabel(REQUEST_STATE.ACCEPTED),
});

// Frontend
console.log("[STATE]", {
  requestState: request.state,
  appointmentState: appointment.state,
  requestLabel: getRequestStateLabel(request.state),
  appointmentLabel: getAppointmentStateLabel(appointment.state),
});
```

### 2. Verificar en Console

```javascript
// En navegador (Chrome DevTools)
// Verifica que las constantes están disponibles
import { REQUEST_STATE } from "./shared/constants";
console.table(REQUEST_STATE);

// Output:
// ┌───────────┬───────┐
// │  (index)  │Values │
// ├───────────┼───────┤
// │ REQUESTED │   0   │
// │   OPEN    │   1   │
// │ ACCEPTED  │   2   │
// │ REJECTED  │   3   │
// │  CLOSED   │   4   │
// │ CANCELLED │   5   │
// └───────────┴───────┘
```

---

## 🚨 Errores Comunes

### 1. ❌ Usar números directamente

```javascript
// MAL ❌
if (request.state === 1) { ... }

// BIEN ✅
if (request.state === REQUEST_STATE.OPEN) { ... }
```

### 2. ❌ No validar estados antes de guardar

```javascript
// MAL ❌
await RequestModel.updateState(conn, id, userInput);

// BIEN ✅
if (isValidRequestState(userInput)) {
  await RequestModel.updateState(conn, id, userInput);
} else {
  throw new Error("Estado inválido");
}
```

### 3. ❌ Comparar como string vs number

```javascript
// MAL ❌
if (request.state === "1") { ... }  // String

// BIEN ✅
if (request.state === REQUEST_STATE.OPEN) { ... }  // Number
```

### 4. ❌ No usar las funciones helper

```javascript
// MAL ❌
let label;
if (state === 0) label = "Requested";
else if (state === 1) label = "Open";
// ...

// BIEN ✅
const label = getRequestStateLabel(state);
```

---

## 📦 Extensibilidad

### Agregar Nuevo Estado (Si es necesario)

#### 1. Modificar `constants.js/ts`

```javascript
export const REQUEST_STATE = {
  REQUESTED: 0,
  OPEN: 1,
  ACCEPTED: 2,
  REJECTED: 3,
  CLOSED: 4,
  CANCELLED: 5,
  ON_HOLD: 6, // ← Nuevo estado
};

export const REQUEST_STATE_LABELS = {
  // ... estados existentes
  [REQUEST_STATE.ON_HOLD]: "En Espera", // ← Nueva etiqueta
};
```

#### 2. Actualizar lógica de negocio

```javascript
// En appointmentModel.js
if (request.state === REQUEST_STATE.ON_HOLD) {
  // Nueva lógica
}
```

#### 3. Actualizar UI

```tsx
{
  request.state === REQUEST_STATE.ON_HOLD && (
    <button onClick={handleResume}>Reanudar</button>
  );
}
```

---

## 📚 Recursos Adicionales

- [ESTADOS_GLOBALIZADOS.md](./ESTADOS_GLOBALIZADOS.md) - Documentación completa
- [FLUJO_VISUAL.md](./FLUJO_VISUAL.md) - Diagrama de flujos
- [migrate_states.sql](./back/Scripts/migrate_states.sql) - Script de migración

---

## 💡 Tips Pro

1. **Usar TypeScript**: Las constantes tienen tipos, aprovéchalos
2. **Centralizar lógica**: Crea helpers para validaciones complejas
3. **Testing**: Escribe tests para cada transición de estado
4. **Logs**: Siempre logea transiciones de estado para debugging
5. **Code Review**: Verifica que no haya números mágicos

---

**Happy Coding! 🚀**
