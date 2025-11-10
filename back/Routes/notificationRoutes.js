// Routes/notificationRoutes.js
import express from 'express';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  getUnreadCount 
} from '../Controllers/notificationController.js';

const router = express.Router();

/**
 * @route GET /api/notification
 * @description Obtener todas las notificaciones
 * @access Private
 */
router.get('/', ((req, res) => res.json({ notifications: [] })));

/**
 * @route GET /api/notification/user/:userId
 * @description Obtener notificaciones de un usuario
 * @access Private (debe implementar middleware de autenticación)
 */
router.get('/user/:userId', getUserNotifications);

/**
 * @route GET /api/notification/unread/:userId
 * @description Obtener contador de notificaciones no leídas
 * @access Private
 */
router.get('/unread/:userId', getUnreadCount);

/**
 * @route PUT /api/notification/read
 * @description Marcar notificación como leída
 * @access Private
 */
router.put('/read', markNotificationAsRead);

export default router;