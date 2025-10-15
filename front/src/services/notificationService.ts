// services/notificationService.ts
import { io, Socket } from 'socket.io-client';
import { apiUrl } from '../config/environment';

export interface Notification {
  id: number;
  type: 'request_received' | 'appointment_accepted' | 'appointment_rejected' | 'appointment_canceled';
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
export const fetchNotifications = async (userId: number, limit: number = 20): Promise<Notification[]> => {
  try {
    const response = await fetch(apiUrl(`/api/notifications/user/${userId}?limit=${limit}`));
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || 'Error al obtener notificaciones');
    }
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
    const response = await fetch(apiUrl(`/api/notifications/unread/${userId}`));
    const data = await response.json();
    
    if (data.success) {
      return data.unreadCount;
    } else {
      throw new Error(data.error || 'Error al obtener contador');
    }
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
    const response = await fetch(apiUrl('/api/notifications/read'), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: notificationId,
        userId: userId,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('[NotificationService] Error marking as read:', error);
    return false;
  }
};