// LoadingModal.tsx - Modal de carga profesional para operaciones largas
import { useEffect, useState } from 'react';
import './LoadingModal.css';

interface LoadingModalProps {
  action: 'approving' | 'rejecting' | 'sending' | 'loading';
  title?: string;
  message?: string;
}

export default function LoadingModal({ action, title, message }: LoadingModalProps) {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  // Animación de puntos suspensivos
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Simulación de progreso para dar feedback visual
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // No llegar a 100% hasta que termine realmente
        return prev + Math.random() * 10;
      });
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const getDefaultContent = () => {
    switch (action) {
      case 'approving':
        return {
          title: 'Aprobando solicitud',
          message: 'Generando credenciales y enviando email',
          icon: '✓',
          color: '#4a7c59'
        };
      case 'rejecting':
        return {
          title: 'Procesando rechazo',
          message: 'Enviando notificación por email',
          icon: '✗',
          color: '#d32f2f'
        };
      case 'sending':
        return {
          title: 'Enviando email',
          message: 'Por favor espera un momento',
          icon: '📧',
          color: '#2196f3'
        };
      default:
        return {
          title: 'Procesando',
          message: 'Por favor espera',
          icon: '⏳',
          color: '#4a7c59'
        };
    }
  };

  const content = {
    title: title || getDefaultContent().title,
    message: message || getDefaultContent().message,
    icon: getDefaultContent().icon,
    color: getDefaultContent().color
  };

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-modal-icon" style={{ color: content.color }}>
          {content.icon}
        </div>
        
        <div className="loading-spinner" style={{ borderTopColor: content.color }}>
          <div className="loading-spinner-inner" style={{ borderTopColor: content.color }}></div>
        </div>
        
        <h3 className="loading-modal-title">
          {content.title}{dots}
        </h3>
        
        <p className="loading-modal-message">
          {content.message}
        </p>
        
        <div className="loading-progress-bar">
          <div 
            className="loading-progress-fill" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: content.color
            }}
          />
        </div>
        
        <p className="loading-modal-hint">
          Esta operación puede tardar unos segundos
        </p>
      </div>
    </div>
  );
}
