// Models/notificationModel.js
import db from '../config/DBConnect.js';

/**
 * Crear una nueva notificación
 * @param {number} userId - ID del usuario que recibirá la notificación
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo del mensaje
 * @param {string} type - Tipo de notificación (request, appointment, etc.)
 * @param {number} entityId - ID de la entidad relacionada (requestId o appointmentId)
 * @param {number} requestId - ID de la solicitud (opcional)
 * @param {number} appointmentId - ID del appointment (opcional)
 * @returns {Promise<number>} - ID de la notificación creada
 */
export const createNotification = async (userId, title, body, type, entityId, requestId = null, appointmentId = null) => {
  try {
    // Si no se proporcionan requestId/appointmentId explícitos, usar entityId como appointmentId para tipos de appointment
    const appointmentTypes = ['appointment', 'appointment_canceled', 'appointment_accepted', 'appointment_rejected', 'appointment_completed'];
    
    let finalRequestId = requestId;
    let finalAppointmentId = appointmentId;
    
    if (appointmentTypes.includes(type) && !finalAppointmentId) {
      finalAppointmentId = entityId;
    } else if (!appointmentTypes.includes(type) && !finalRequestId) {
      finalRequestId = entityId;
    }
    
    const [result] = await db.query(`
      INSERT INTO notifications (
        userId, 
        type, 
        title, 
        body, 
        requestId,
        appointmentId,
        \`read\`,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, 0, NOW())
    `, [userId, type, title, body, finalRequestId, finalAppointmentId]);

    console.log(`[INFO] Notification created for user ${userId}: ${title} (type: ${type}, requestId: ${finalRequestId}, appointmentId: ${finalAppointmentId})`);
    return result.insertId;
  } catch (error) {
    console.error("[ERROR] NotificationModel.createNotification:", error);
    throw error;
  }
};

/**
 * Obtener notificaciones de un usuario
 * @param {number} userId - ID del usuario
 * @param {number} limit - Límite de notificaciones a obtener
 * @param {number} offset - Offset para paginación
 * @param {boolean} unreadOnly - Si es true, solo obtiene notificaciones no leídas (default: false)
 * @returns {Promise<Array>} - Array de notificaciones
 */
export const getUserNotifications = async (userId, limit = 20, offset = 0, unreadOnly = false) => {
  try {
    let query = `
      SELECT 
        n.id, 
        n.type, 
        n.title, 
        n.body, 
        COALESCE(n.requestId, ac.idRequest) as requestId,
        n.appointmentId, 
        n.\`read\`, 
        n.readAt, 
        n.createdAt,
        u.email as actorEmail
      FROM notifications n
      LEFT JOIN users u ON u.id = n.actorId
      LEFT JOIN appointmentconfirmation ac ON ac.id = n.appointmentId
      WHERE n.userId = ? 
        AND (n.expireAt IS NULL OR n.expireAt > NOW())
    `;

    // Si unreadOnly es true, filtrar solo notificaciones no leídas
    if (unreadOnly) {
      query += ` AND n.\`read\` = 0`;
    }

    query += ` ORDER BY n.createdAt DESC LIMIT ? OFFSET ?`;

    const [rows] = await db.query(query, [userId, limit, offset]);

    return rows;
  } catch (error) {
    console.error("[ERROR] NotificationModel.getUserNotifications:", error);
    throw error;
  }
};

/**
 * Marcar notificación como leída
 * @param {number} notificationId - ID de la notificación
 * @param {number} userId - ID del usuario (para seguridad)
 * @returns {Promise<boolean>} - True si se actualizó correctamente
 */
export const markAsRead = async (notificationId, userId) => {
  try {
    const [result] = await db.query(`
      UPDATE notifications 
      SET \`read\` = 1, readAt = NOW() 
      WHERE id = ? AND userId = ?
    `, [notificationId, userId]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error("[ERROR] NotificationModel.markAsRead:", error);
    throw error;
  }
};

/**
 * Contar notificaciones no leídas
 * @param {number} userId - ID del usuario
 * @returns {Promise<number>} - Número de notificaciones no leídas
 */
export const getUnreadCount = async (userId) => {
  try {
    const [rows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE userId = ? 
        AND \`read\` = 0 
        AND (expireAt IS NULL OR expireAt > NOW())
    `, [userId]);

    return rows[0].count;
  } catch (error) {
    console.error("[ERROR] NotificationModel.getUnreadCount:", error);
    throw error;
  }
};

/**
 * Limpiar notificaciones expiradas (función para cron job)
 * @returns {Promise<number>} - Número de notificaciones eliminadas
 */
export const cleanupExpired = async () => {
  try {
    const [result] = await db.query(`
      DELETE FROM notifications 
      WHERE expireAt IS NOT NULL AND expireAt <= NOW()
    `);

    console.log(`[INFO] Cleaned up ${result.affectedRows} expired notifications`);
    return result.affectedRows;
  } catch (error) {
    console.error("[ERROR] NotificationModel.cleanupExpired:", error);
    throw error;
  }
};