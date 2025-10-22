// components/CommonComp/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  connectNotifications,
  disconnectNotifications,
  onNotificationReceived,
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
} from '../../services/notificationService';
import type { Notification } from '../../services/notificationService';
import './NotificationBell.css';

interface NotificationBellProps {
  userId: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Conectar a Socket.IO y cargar notificaciones al montar
  useEffect(() => {
    if (!userId) return;

    console.log('[NotificationBell] Inicializando para usuario:', userId);

    // Conectar Socket.IO
    connectNotifications(userId);

    // Escuchar notificaciones en tiempo real
    onNotificationReceived((notification: Notification) => {
      console.log('[NotificationBell] Nueva notificación recibida:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar notificación toast (opcional)
      showNotificationToast(notification);
    });

    // Cargar notificaciones existentes
    loadNotifications();
    loadUnreadCount();

    // Cleanup al desmontar
    return () => {
      disconnectNotifications();
    };
  }, [userId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const fetchedNotifications = await fetchNotifications(userId);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('[NotificationBell] Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await fetchUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('[NotificationBell] Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const success = await markAsRead(notificationId, userId);
      if (success) {
        // Remover notificación de la lista
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[NotificationBell] Error marking as read:', error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const showNotificationToast = (notification: Notification) => {
    // Implementación simple de toast - puedes usar una librería como react-toastify
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.ico',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'request_received':
        return '📦';
      case 'appointment_accepted':
        return '✅';
      case 'appointment_rejected':
        return '❌';
      case 'appointment_canceled':
        return '🚫';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Hace unos segundos';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <>
      <div className="notification-bell" ref={dropdownRef}>
        <button 
          className="notification-bell-button"
          onClick={toggleDropdown}
          aria-label="Notificaciones"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            <div className="notification-overlay" onClick={() => setIsOpen(false)} />
            <div className="notification-dropdown">
          <div className="notification-header">
            Mis Notificaciones
            {unreadCount > 0 && (
              <span style={{ marginLeft: '8px', color: '#666' }}>
                ({unreadCount} nuevas)
              </span>
            )}
          </div>

          <div className="notification-list">
            {isLoading ? (
              <div className="notification-empty">
                <div>Cargando notificaciones...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <div className="notification-empty-icon">🔕</div>
                <div>No tienes notificaciones</div>
              </div>
            ) : (
              <>
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-content">
                      <div className={`notification-icon ${notification.type}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-details">
                        <h4 className="notification-title">
                          {notification.title}
                        </h4>
                        <p className="notification-body">
                          {notification.body}
                        </p>
                        <div className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </div>
                        <div className="notification-actions">
                          <button
                            className="notification-btn notification-btn-primary"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            Marcar como leída
                          </button>
                          {notification.type === 'request_received' && (
                            <button
                              className="notification-btn notification-btn-secondary"
                              onClick={() => {
                                // Redirigir a la ventana de detalles con el appointmentId para aprobar/rechazar
                                const url = notification.appointmentId 
                                  ? `/pickupDetails/${notification.requestId}?appointmentId=${notification.appointmentId}`
                                  : `/pickupDetails/${notification.requestId}`;
                                window.location.href = url;
                              }}
                            >
                              Ver Detalles
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <div className="notification-item notification-view-more">
                    <button
                      className="notification-btn notification-btn-primary w-100"
                      style={{ marginTop: 8 }}
                      onClick={() => window.location.href = '/notifications'}
                    >
                      Ver más
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </>
  );
};

export default NotificationBell;