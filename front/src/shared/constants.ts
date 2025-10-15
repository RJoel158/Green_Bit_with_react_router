// shared/constants.ts
// Constantes globales para estados de la aplicación

/**
 * Estados de Request (Solicitud de reciclaje)
 */
export const REQUEST_STATE = {
  REQUESTED: 0,   // Un collector ha solicitado recoger el material (temporal)
  OPEN: 1,        // Disponible para ser recogido (aparece en mapa)
  ACCEPTED: 2,    // Reciclador aceptó la solicitud del recolector
  REJECTED: 3,    // Reciclador rechazó la solicitud del recolector
  CLOSED: 4,      // Recolección completada
  CANCELLED: 5    // Cancelado por alguna de las partes
} as const;

/**
 * Estados de AppointmentConfirmation (Cita de recolección)
 */
export const APPOINTMENT_STATE = {
  PENDING: 0,     // Esperando confirmación del reciclador
  ACCEPTED: 1,    // Reciclador aceptó la cita
  IN_PROGRESS: 2, // Recolección en progreso (opcional, puede no usarse)
  REJECTED: 3,    // Reciclador rechazó la cita
  COMPLETED: 4,   // Recolección completada
  CANCELLED: 5    // Cancelado por alguna de las partes
} as const;

/**
 * Etiquetas legibles para estados de Request
 */
export const REQUEST_STATE_LABELS: Record<number, string> = {
  [REQUEST_STATE.REQUESTED]: 'Solicitado',
  [REQUEST_STATE.OPEN]: 'Abierto',
  [REQUEST_STATE.ACCEPTED]: 'Aceptado',
  [REQUEST_STATE.REJECTED]: 'Rechazado',
  [REQUEST_STATE.CLOSED]: 'Cerrado',
  [REQUEST_STATE.CANCELLED]: 'Cancelado'
};

/**
 * Etiquetas legibles para estados de Appointment
 */
export const APPOINTMENT_STATE_LABELS: Record<number, string> = {
  [APPOINTMENT_STATE.PENDING]: 'Pendiente',
  [APPOINTMENT_STATE.ACCEPTED]: 'Aceptado',
  [APPOINTMENT_STATE.IN_PROGRESS]: 'En Progreso',
  [APPOINTMENT_STATE.REJECTED]: 'Rechazado',
  [APPOINTMENT_STATE.COMPLETED]: 'Completado',
  [APPOINTMENT_STATE.CANCELLED]: 'Cancelado'
};

/**
 * Función helper para validar estados de Request
 */
export const isValidRequestState = (state: number | string): boolean => {
  const validStates = Object.values(REQUEST_STATE) as number[];
  return validStates.includes(parseInt(String(state)));
};

/**
 * Función helper para validar estados de Appointment
 */
export const isValidAppointmentState = (state: number | string): boolean => {
  const validStates = Object.values(APPOINTMENT_STATE) as number[];
  return validStates.includes(parseInt(String(state)));
};

/**
 * Función para obtener la etiqueta de un estado de Request
 */
export const getRequestStateLabel = (state: number | string): string => {
  return REQUEST_STATE_LABELS[parseInt(String(state))] || 'Desconocido';
};

/**
 * Función para obtener la etiqueta de un estado de Appointment
 */
export const getAppointmentStateLabel = (state: number | string): string => {
  return APPOINTMENT_STATE_LABELS[parseInt(String(state))] || 'Desconocido';
};

// Tipos TypeScript
export type RequestStateType = typeof REQUEST_STATE[keyof typeof REQUEST_STATE];
export type AppointmentStateType = typeof APPOINTMENT_STATE[keyof typeof APPOINTMENT_STATE];
