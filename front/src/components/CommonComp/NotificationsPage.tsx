import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft } from 'lucide-react';
import {
  connectNotifications,
  disconnectNotifications,
  onNotificationReceived,
  fetchNotifications,
  markAsRead,
  type Notification,
} from '../../services/notificationService';
import './NotificationsPage.css';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'aprobados' | 'rechazados' | 'pendientes' | 'culminados'>('todos');
  
  // Obtener userId del localStorage
  const getUserId = (): number => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.id || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting userId:', error);
      return 0;
    }
  };

  const userId = getUserId();

  const formatNotificationTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // Resetear las horas para comparar solo fechas
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const diffInMs = todayStart.getTime() - dateStart.getTime();
    const daysDiff = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Formatter para hora (14:35)
    const timeFormatter = new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const time = timeFormatter.format(date);
    
    // Si fue hoy, mostrar solo la hora
    if (daysDiff === 0) {
      return time;
    }
    
    // Si fue ayer, mostrar "Ayer" + hora
    if (daysDiff === 1) {
      return `Ayer, ${time}`;
    }
    
    // Si fue antes, mostrar fecha completa + hora
    const dateFormatter = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    return dateFormatter.format(date);
  };

  const getNavigationUrl = (notification: Notification) => {
    // Por defecto, ir a pickupDetails con requestId
    if (notification.requestId) {
      if (notification.appointmentId) {
        return `/pickupDetails/${notification.requestId}?appointmentId=${notification.appointmentId}`;
      }
      return `/pickupDetails/${notification.requestId}`;
    }
    return null;
  };

  useEffect(() => {
    if (!userId || userId === 0) {
      navigate('/login');
      return;
    }

    // Conectar Socket.IO
    connectNotifications(userId);

    // Escuchar nuevas notificaciones
    onNotificationReceived((notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    // Cargar notificaciones
    loadNotifications();

    return () => {
      disconnectNotifications();
    };
  }, [userId, navigate]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Cargar solo notificaciones no leídas por defecto
      const fetchedNotifications = await fetchNotifications(userId, 100, true);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredNotifications = () => {
    switch (activeFilter) {
      case 'aprobados':
        return notifications.filter(n => n.type === 'appointment_accepted' || n.type === 'appointment_completed');
      case 'rechazados':
        return notifications.filter(n => n.type === 'appointment_rejected' || n.type === 'appointment_canceled');
      case 'pendientes':
        return notifications.filter(n => !n.read);
      case 'culminados':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const success = await markAsRead(notificationId, userId);
      if (success) {
        // Remover notificación de la lista inmediatamente
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('[NotificationsPage] Error marking as read:', error);
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-page-header">
        <div className="header-top">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            title="Volver"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="notifications-page-title">Mis Notificaciones</h1>
          <div className="header-spacer"></div>
        </div>

        {/* Tabs/Filters */}
        <div className="tabs-container">
          {['todos', 'aprobados', 'rechazados', 'pendientes', 'culminados'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab as any)}
              className={`tab-button ${activeFilter === tab ? 'active' : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="tabs-divider"></div>
      </div>

      {/* Notifications List */}
      <div className="notifications-page-container">
        {isLoading ? (
          <div className="empty-state">
            <Bell size={48} />
            <p>Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <Bell size={48} />
            <p>No hay notificaciones</p>
          </div>
        ) : (
          <div className="notifications-items-list">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="notification-item-card">
                {/* Icon Circle */}
                <div className="notification-item-icon">
                  <Bell size={28} />
                </div>

                {/* Content */}
                <div className="notification-item-content">
                  <h3 className="notification-item-title">{notification.title}</h3>
                  <p className="notification-item-description">{notification.body}</p>
                  <div className="notification-item-time">
                    {formatNotificationTime(notification.createdAt)}
                  </div>
                  <div className="notification-item-actions">
                    {!notification.read && (
                      <button
                        className="btn-marcar-leida"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Marcar como leída
                      </button>
                    )}
                    {getNavigationUrl(notification) && (
                      <button
                        className="btn-ver-detalles"
                        onClick={() => {
                          const url = getNavigationUrl(notification);
                          if (url) {
                            navigate(url);
                          }
                        }}
                      >
                        Ver Detalles
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
