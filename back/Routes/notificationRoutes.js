// Routes/notificationRoutes.js
import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  getUnreadCount 
} from '../Controllers/notificationController.js';

const router = express.Router();

/**
 * @route GET /api/notifications/user/:userId
 * @description Obtener notificaciones de un usuario
 * @access Private (debe implementar middleware de autenticación)
 */
router.get('/user/:userId', getUserNotifications);

/**
 * @route GET /api/notifications/unread/:userId
 * @description Obtener contador de notificaciones no leídas
 * @access Private
 */
router.get('/unread/:userId', getUnreadCount);

/**
 * @route PUT /api/notifications/read
 * @description Marcar notificación como leída
 * @access Private
 */
router.put('/read', markNotificationAsRead);

export default router;