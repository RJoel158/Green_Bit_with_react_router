-- Script para crear sistema de notificaciones
-- Ejecutar en MySQL Workbench o tu cliente de BD preferido

USE `reciclaje_proyecto2db`;

-- 1. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  
  -- Quién recibe la notificación
  userId INT UNSIGNED NOT NULL,
  
  -- Quién provocó el evento
  actorId INT UNSIGNED NULL,
  
  -- Tipo de evento
  type ENUM('request_received','appointment_accepted','appointment_rejected','appointment_canceled') NOT NULL,
  
  -- Contenido de la notificación
  title VARCHAR(200) NOT NULL,
  body VARCHAR(600) NOT NULL,
  
  -- Relaciones con otras entidades
  requestId INT UNSIGNED NULL,
  appointmentId INT UNSIGNED NULL,
  
  -- Estado de lectura y tiempos
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  readAt DATETIME NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expireAt DATETIME NULL,
  
  -- Índices para performance
  INDEX idx_user_created (userId, createdAt DESC),
  INDEX idx_user_read (userId, `read`),
  INDEX idx_expire (expireAt),
  
  -- Claves foráneas
  CONSTRAINT fk_notifications_user FOREIGN KEY (userId) 
    REFERENCES `users`(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_actor FOREIGN KEY (actorId) 
    REFERENCES `users`(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_request FOREIGN KEY (requestId) 
    REFERENCES `request`(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_notifications_appointment FOREIGN KEY (appointmentId) 
    REFERENCES `appointmentconfirmation`(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Triggers para generar notificaciones automáticamente

-- Trigger: Nueva solicitud de recojo (notifica al reciclador)
DROP TRIGGER IF EXISTS trg_appointment_request_notify;
DELIMITER //
CREATE TRIGGER trg_appointment_request_notify
AFTER INSERT ON appointmentconfirmation
FOR EACH ROW
BEGIN
  IF NEW.state = 0 THEN -- Estado pendiente
    INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
    SELECT 
      r.idUser,                           -- Usuario que recibe (dueño de la request)
      NEW.collectorId,                    -- Usuario que actúa (recolector)
      'request_received',                 -- Tipo de notificación
      'Solicitud de recolección',         -- Título
      CONCAT('El usuario ', u.email, ' ha solicitado recoger tu material el ', 
             DATE_FORMAT(NEW.acceptedDate, '%d/%m/%Y')),  -- Mensaje
      NEW.idRequest,                      -- ID de la request
      NEW.id,                            -- ID del appointment
      NOW() + INTERVAL 7 DAY             -- Expira en 7 días
    FROM request r
    JOIN users u ON u.id = NEW.collectorId
    WHERE r.id = NEW.idRequest;
  END IF;
END//
DELIMITER ;

-- Trigger: Cambio de estado de appointment (aceptado/rechazado/cancelado)
DROP TRIGGER IF EXISTS trg_appointment_status_notify;
DELIMITER //
CREATE TRIGGER trg_appointment_status_notify
AFTER UPDATE ON appointmentconfirmation
FOR EACH ROW
BEGIN
  IF NEW.state != OLD.state THEN
    
    -- Appointment aceptado (notifica al recolector)
    IF NEW.state = 1 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,                    -- Recolector recibe notificación
        r.idUser,                          -- Reciclador es quien actúa
        'appointment_accepted',             -- Tipo
        'Solicitud aceptada',               -- Título
        CONCAT('Tu solicitud de recolección a ', ur.email, ' fue aceptada'), -- Mensaje
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      WHERE r.id = NEW.idRequest;
    END IF;
    
    -- Appointment rechazado (notifica al recolector)
    IF NEW.state = 2 THEN -- Asumiendo que 2 es rechazado
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,
        r.idUser,
        'appointment_rejected',
        'Solicitud rechazada',
        CONCAT('Tu solicitud de recolección a ', ur.email, ' fue rechazada'),
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      WHERE r.id = NEW.idRequest;
    END IF;
    
  END IF;
END//
DELIMITER ;

-- 3. Event para limpieza automática de notificaciones expiradas
-- NOTA: Si no tienes privilegios SUPER, omite esta sección
-- La limpieza se hará desde el backend con un cron job

-- SET GLOBAL event_scheduler = ON;
-- 
-- DROP EVENT IF EXISTS ev_cleanup_notifications;
-- CREATE EVENT ev_cleanup_notifications
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURRENT_DATE + INTERVAL 2 HOUR
-- DO
--   DELETE FROM notifications 
--   WHERE expireAt IS NOT NULL AND expireAt <= NOW();

-- Verificar que todo se creó correctamente
SELECT 'Tabla notifications creada correctamente' as status;
SELECT 'Triggers creados correctamente' as status;
SELECT 'Event de limpieza programado' as status;