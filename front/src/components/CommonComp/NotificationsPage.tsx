import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronLeft } from 'lucide-react';
import {
  connectNotifications,
  disconnectNotifications,
  onNotificationReceived,
  fetchNotifications,
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
      const fetchedNotifications = await fetchNotifications(userId, 100);
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
        return notifications.filter(n => n.type === 'appointment_accepted');
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
                  <button
                    className="btn-ver-detalles"
                    onClick={() => {
                      if (notification.requestId) {
                        navigate(`/pickupDetails/${notification.requestId}`);
                      }
                    }}
                  >
                    Ver Detalles
                  </button>
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
