// Controllers/notificationController.js
import * as NotificationModel from "../Models/notificationModel.js";

/**
 * Obtener notificaciones del usuario logueado
 */
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    console.log("[INFO] getUserNotifications called:", { userId, limit, offset });

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: "ID de usuario inválido"
      });
    }

    const notifications = await NotificationModel.getUserNotifications(
      parseInt(userId),
      parseInt(limit),
      parseInt(offset)
    );

    const unreadCount = await NotificationModel.getUnreadCount(parseInt(userId));

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      total: notifications.length
    });

  } catch (error) {
    console.error("[ERROR] getUserNotifications controller:", {
      userId: req.params.userId,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: "Error al obtener notificaciones",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Marcar notificación como leída
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id, userId } = req.body;

    console.log("[INFO] markNotificationAsRead called:", { id, userId });

    if (!id || !userId || isNaN(parseInt(id)) || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: "ID de notificación y usuario requeridos"
      });
    }

    const updated = await NotificationModel.markAsRead(parseInt(id), parseInt(userId));

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Notificación no encontrada"
      });
    }

    res.json({
      success: true,
      message: "Notificación marcada como leída"
    });

  } catch (error) {
    console.error("[ERROR] markNotificationAsRead controller:", {
      body: req.body,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: "Error al marcar notificación como leída",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener contador de notificaciones no leídas
 */
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: "ID de usuario inválido"
      });
    }

    const count = await NotificationModel.getUnreadCount(parseInt(userId));

    res.json({
      success: true,
      unreadCount: count
    });

  } catch (error) {
    console.error("[ERROR] getUnreadCount controller:", {
      userId: req.params.userId,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: "Error al obtener contador de notificaciones",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};