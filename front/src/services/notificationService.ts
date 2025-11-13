// services/notificationService.ts
import api from './api';
import { io, Socket } from 'socket.io-client';
import { apiUrl } from '../config/environment';
import { API_ENDPOINTS } from '../config/endpoints';

export interface Notification {
  id: number;
  type: 'request_received' | 'appointment_accepted' | 'appointment_rejected' | 'appointment_canceled' | 'appointment_completed';
  title: string;
  body: string;
  requestId?: number;
  appointmentId?: number;
  read: boolean;
  readAt?: string;
  createdAt: string;
  actorEmail?: string;
}

let socket: Socket | null = null;

/**
 * Conectar usuario a Socket.IO para recibir notificaciones en tiempo real
 */
export const connectNotifications = (userId: number): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(apiUrl(''), {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[NotificationService] Conectado a Socket.IO');
    socket?.emit('join', userId);
  });

  socket.on('disconnect', () => {
    console.log('[NotificationService] Desconectado de Socket.IO');
  });

  return socket;
};

/**
 * Desconectar de Socket.IO
 */
export const disconnectNotifications = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Escuchar notificaciones en tiempo real
 */
export const onNotificationReceived = (callback: (notification: Notification) => void): void => {
  if (socket) {
    socket.on('notification', callback);
  }
};

/**
 * Obtener notificaciones del usuario
 */
export const fetchNotifications = async (userId: number, limit: number = 20, unreadOnly: boolean = true): Promise<Notification[]> => {
  try {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_BY_USER(userId, limit), {
      params: {
        unreadOnly
      }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('[NotificationService] Error fetching notifications:', error);
    return [];
  }
};

/**
 * Obtener contador de notificaciones no leídas
 */
export const fetchUnreadCount = async (userId: number): Promise<number> => {
  try {
    const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD(userId));
    return response.data.unreadCount || 0;
  } catch (error) {
    console.error('[NotificationService] Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Marcar notificación como leída
 */
export const markAsRead = async (notificationId: number, userId: number): Promise<boolean> => {
  try {
    const response = await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ, {
      id: notificationId,
      userId: userId,
    });
    return response.data.success || true;
  } catch (error) {
    console.error('[NotificationService] Error marking as read:', error);
    return false;
  }
};