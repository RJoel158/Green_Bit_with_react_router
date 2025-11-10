/**
 * ENDPOINTS DE LA API - GREENBIT RECYCLING
 * =========================================
 * 
 * Todos los endpoints disponibles en el backend
 * Base URL: http://localhost:3000
 */

export const API_ENDPOINTS = {
  // ============================================
  // USUARIOS - /api/users
  // ============================================
  USERS: {
    // Autenticación
    LOGIN: '/api/users/login',                                    // POST - Login de usuario
    REGISTER: '/api/users',                                       // POST - Registro básico
    REGISTER_COLLECTOR: '/api/users/collector',                  // POST - Registro recolector
    REGISTER_INSTITUTION: '/api/users/institution',              // POST - Registro institución
    REGISTER_INSTITUTION_ADMIN: '/api/users/institution-admin',  // POST - Registro admin institución
    
    // Gestión de contraseña
    FORGOT_PASSWORD: '/api/users/forgotpassword',                // POST - Recuperar contraseña
    CHANGE_PASSWORD: (userId: number) => `/api/users/changePassword/${userId}`, // PUT - Cambiar contraseña
    
    // Consultas de usuarios
    GET_USER: (userId: number) => `/api/users/${userId}`,        // GET - Obtener usuario por ID
    GET_USER_WITH_PERSON: '/api/users/withPerson',               // GET - Usuarios con persona
    GET_USER_WITH_INSTITUTION: (userId: number) => `/api/users/withInstitution/${userId}`, // GET
    
    // Aprobación de recolectores
    GET_COLLECTORS_PENDING: '/api/users/collectors/pending',     // GET - Recolectores pendientes
    GET_COLLECTORS_PENDING_INSTITUTION: '/api/users/collectors/pending/institution', // GET
    APPROVE_USER: (userId: number) => `/api/users/approve/${userId}`,           // PUT - Aprobar usuario
    APPROVE_INSTITUTION: (userId: number) => `/api/users/institution/approve/${userId}`, // PUT
    REJECT_USER: (userId: number) => `/api/users/reject/${userId}`,             // PUT - Rechazar usuario
    REJECT_INSTITUTION: (userId: number) => `/api/users/institution/reject/${userId}`,   // PUT
    
    // Gestión de usuarios
    UPDATE_ROLE: (userId: number) => `/api/users/${userId}/role`,               // PUT - Actualizar rol
    DELETE_USER: (userId: number) => `/api/users/${userId}`,                    // DELETE - Eliminar usuario
    DELETE_INSTITUTION: (userId: number) => `/api/users/institution/${userId}`, // DELETE - Eliminar institución
  },

  // ============================================
  // MATERIALES - /api/material
  // ============================================
  MATERIALS: {
    GET_ALL: '/api/material',                                    // GET - Obtener todos los materiales
    CREATE: '/api/material',                                     // POST - Crear material
    GET_BY_ID: (materialId: number) => `/api/material/${materialId}`,  // GET - Obtener por ID
    UPDATE: (materialId: number) => `/api/material/${materialId}`,     // PUT - Actualizar material
    DELETE: (materialId: number) => `/api/material/${materialId}`,     // DELETE - Eliminar material
  },

  // ============================================
  // SOLICITUDES - /api/request
  // ============================================
  REQUESTS: {
    CREATE: '/api/request',                                      // POST - Crear solicitud
    GET_ALL: '/api/request',                                     // GET - Obtener todas
    GET_BY_ID: (requestId: number) => `/api/request/${requestId}`,           // GET - Por ID
    GET_BY_USER_STATE: (userId: number) => `/api/request/user/${userId}/state`, // GET - Por usuario y estado
    UPDATE_STATE: (requestId: number) => `/api/request/${requestId}/state`,     // PUT - Actualizar estado
    SCHEDULE: (requestId: number) => `/api/request/${requestId}/schedule`,      // GET - Obtener horarios
    DELETE: (requestId: number) => `/api/request/${requestId}`,                 // DELETE
  },

  // ============================================
  // CITAS - /api/appointments
  // ============================================
  APPOINTMENTS: {
    CREATE: '/api/appointments',                                 // POST - Crear cita
    SCHEDULE: '/api/appointments/schedule',                      // POST - Agendar cita
    GET_ALL: '/api/appointments',                                // GET - Obtener todas
    GET_BY_ID: (appointmentId: number) => `/api/appointments/${appointmentId}`,  // GET - Por ID
    GET_BY_COLLECTOR: (collectorId: number) => `/api/appointments/collector/${collectorId}`, // GET
    GET_BY_RECYCLER: (recyclerId: number) => `/api/appointments/recycler/${recyclerId}`,     // GET
    
    // Acciones sobre citas
    ACCEPT: (appointmentId: number) => `/api/appointments/${appointmentId}/accept`,   // PUT - Aceptar
    REJECT: (appointmentId: number) => `/api/appointments/${appointmentId}/reject`,   // PUT - Rechazar
    CANCEL: (appointmentId: number) => `/api/appointments/${appointmentId}/cancel`,   // PUT - Cancelar
    COMPLETE: (appointmentId: number) => `/api/appointments/${appointmentId}/complete`, // PUT - Completar
  },

  // ============================================
  // NOTIFICACIONES - /api/notifications
  // ============================================
  NOTIFICATIONS: {
    GET_BY_USER: (userId: number, limit?: number) => 
      `/api/notifications/user/${userId}${limit ? `?limit=${limit}` : ''}`,  // GET
    GET_UNREAD: (userId: number) => `/api/notifications/unread/${userId}`,    // GET - No leídas
    MARK_AS_READ: '/api/notifications/read',                                  // PUT - Marcar como leída
    CREATE: '/api/notifications',                                             // POST - Crear notificación
  },

  // ============================================
  // PUNTUACIONES - /api/scores
  // ============================================
  SCORES: {
    CREATE: '/api/scores',                                       // POST - Crear puntuación
    CHECK: (appointmentId: number, userId: number) => 
      `/api/scores/check/${appointmentId}/${userId}`,            // GET - Verificar si existe
    GET_BY_APPOINTMENT: (appointmentId: number) => 
      `/api/scores/appointment/${appointmentId}`,                // GET - Por cita
    GET_USER_AVERAGE: (userId: number) => 
      `/api/scores/user/${userId}/average`,                      // GET - Promedio del usuario
  },

  // ============================================
  // ANUNCIOS - /api/announcement
  // ============================================
  ANNOUNCEMENTS: {
    GET_ALL: '/api/announcement',                                // GET - Obtener todos
    CREATE: '/api/announcement',                                 // POST - Crear anuncio
    GET_BY_ID: (announcementId: number) => `/api/announcement/${announcementId}`,  // GET
    UPDATE: (announcementId: number) => `/api/announcement/${announcementId}`,     // PUT
    DELETE: (announcementId: number) => `/api/announcement/${announcementId}`,     // DELETE
    GET_BY_ROLE: (targetRole: string) => `/api/announcement/role/${targetRole}`,   // GET - Por rol
  },

  // ============================================
  // UPLOAD - /api/upload
  // ============================================
  UPLOAD: {
    IMAGE: '/api/upload/image',                                  // POST - Subir imagen
    ANNOUNCEMENT_IMAGE: '/api/upload/announcement',              // POST - Imagen de anuncio
  },

  // ============================================
  // RANKING - /api/ranking
  // ============================================
  RANKING: {
    GET_PERIODS: '/api/ranking/periods',                         // GET - Obtener períodos
    GET_ACTIVE_OR_LAST: '/api/ranking/periods/active-or-last',   // GET - Período activo o último
    CREATE_PERIOD: '/api/ranking/periods',                       // POST - Crear período
    CLOSE_PERIOD: '/api/ranking/periods/close',                  // POST - Cerrar período
    GET_LIVE: (periodId: number, role?: string) => 
      `/api/ranking/live/${periodId}${role ? `?role=${role}` : ''}`,  // GET - Ranking en vivo
    GET_TOPS: (periodId: number, role?: string) => 
      `/api/ranking/tops/${periodId}${role ? `?role=${role}` : ''}`,  // GET - Top histórico
    GET_HISTORY: (periodId: number) => `/api/ranking/history/${periodId}`,  // GET - Historial
  },

  // ============================================
  // REPORTES - /api/reports
  // ============================================
  REPORTS: {
    MATERIALS: '/api/reports/materiales',                        // GET - Reporte de materiales
    SCORES: '/api/reports/scores',                               // GET - Reporte de puntuaciones
    COLLECTIONS: '/api/reports/recolecciones',                   // GET - Reporte de recolecciones
  },

  // ============================================
  // SISTEMA
  // ============================================
  SYSTEM: {
    HEALTH: '/health',                                           // GET - Estado del servidor
    DB_STATUS: '/api/db-status',                                 // GET - Estado de la BD
  },
} as const;

export default API_ENDPOINTS;
