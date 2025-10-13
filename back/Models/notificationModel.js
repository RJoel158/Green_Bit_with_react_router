// Models/notificationModel.js
import db from "../Config/DBConnect.js";

/**
 * Obtener notificaciones de un usuario
 * @param {number} userId - ID del usuario
 * @param {number} limit - Límite de notificaciones a obtener
 * @param {number} offset - Offset para paginación
 * @returns {Promise<Array>} - Array de notificaciones
 */
export const getUserNotifications = async (userId, limit = 20, offset = 0) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        n.id, 
        n.type, 
        n.title, 
        n.body, 
        n.requestId, 
        n.appointmentId, 
        n.\`read\`, 
        n.readAt, 
        n.createdAt,
        u.email as actorEmail
      FROM notifications n
      LEFT JOIN users u ON u.id = n.actorId
      WHERE n.userId = ? 
        AND (n.expireAt IS NULL OR n.expireAt > NOW())
      ORDER BY n.createdAt DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

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