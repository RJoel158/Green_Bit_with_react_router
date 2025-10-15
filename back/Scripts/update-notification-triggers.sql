-- Script para actualizar triggers de notificaciones con los nuevos estados
-- Ejecutar en MySQL Workbench después de implementar el nuevo sistema de estados

USE `reciclaje_proyecto2db`;

-- Actualizar trigger de cambio de estado de appointment
DROP TRIGGER IF EXISTS trg_appointment_status_notify;

DELIMITER //
CREATE TRIGGER trg_appointment_status_notify
AFTER UPDATE ON appointmentconfirmation
FOR EACH ROW
BEGIN
  IF NEW.state != OLD.state THEN
    
    -- Appointment ACEPTADO (state = 1): notifica al recolector
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
    
    -- Appointment RECHAZADO (state = 3): notifica al recolector
    IF NEW.state = 3 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,                    -- Recolector recibe notificación
        r.idUser,                          -- Reciclador es quien actúa
        'appointment_rejected',             -- Tipo
        'Solicitud rechazada',              -- Título
        CONCAT('Tu solicitud de recolección a ', ur.email, ' fue rechazada'), -- Mensaje
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      WHERE r.id = NEW.idRequest;
    END IF;
    
    -- Appointment CANCELADO (state = 5): notifica al recolector
    IF NEW.state = 5 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,                    -- Recolector recibe notificación
        r.idUser,                          -- Reciclador es quien actúa
        'appointment_canceled',             -- Tipo
        'Cita cancelada',                   -- Título
        CONCAT('La cita con ', ur.email, ' ha sido cancelada'), -- Mensaje
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      WHERE r.id = NEW.idRequest;
    END IF;
    
    -- Appointment COMPLETADO (state = 4): notifica al recolector
    IF NEW.state = 4 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,                    -- Recolector recibe notificación
        r.idUser,                          -- Reciclador es quien actúa
        'appointment_completed',            -- Tipo
        'Recolección completada',           -- Título
        CONCAT('La recolección con ', ur.email, ' ha sido marcada como completada'), -- Mensaje
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

SELECT 'Trigger actualizado correctamente con nuevos estados:' as status;
SELECT '  - PENDING: 0' as estado;
SELECT '  - ACCEPTED: 1' as estado;
SELECT '  - IN_PROGRESS: 2' as estado;
SELECT '  - REJECTED: 3 (actualizado)' as estado;
SELECT '  - COMPLETED: 4 (nuevo)' as estado;
SELECT '  - CANCELLED: 5 (nuevo)' as estado;
