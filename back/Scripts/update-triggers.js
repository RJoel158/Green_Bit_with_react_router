import db from '../config/DBConnect.js';

async function updateTriggers() {
  try {
    console.log('[INFO] Iniciando actualización de triggers...');

    // DROP del primer trigger
    try {
      await db.query(`DROP TRIGGER IF EXISTS reciclaje_proyecto2db.trg_appointment_request_notify`);
      console.log('[INFO] ✅ Trigger trg_appointment_request_notify eliminado');
    } catch (err) {
      console.log('[DEBUG] Trigger no existía o error al eliminar:', err.message);
    }

    // CREATE del trigger actualizado para solicitudes iniciales
    const createTrigger1 = `
CREATE TRIGGER reciclaje_proyecto2db.trg_appointment_request_notify
AFTER INSERT ON appointmentconfirmation
FOR EACH ROW
BEGIN
  IF NEW.state = 0 THEN
    INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
    SELECT 
      r.idUser,
      NEW.collectorId,
      'request_received',
      'Solicitud de recolección',
      CONCAT('El usuario ', u.email, ' ha solicitado recoger ', 
             COALESCE(m.name, 'tu material'), ' el ',
             DATE_FORMAT(NEW.acceptedDate, '%d/%m/%Y')),
      NEW.idRequest,
      NEW.id,
      NOW() + INTERVAL 7 DAY
    FROM request r
    JOIN users u ON u.id = NEW.collectorId
    LEFT JOIN material m ON m.id = r.materialId
    WHERE r.id = NEW.idRequest;
  END IF;
END`;

    await db.query(createTrigger1);
    console.log('[INFO] ✅ Trigger trg_appointment_request_notify creado con nombre del material');

    // DROP del segundo trigger
    try {
      await db.query(`DROP TRIGGER IF EXISTS reciclaje_proyecto2db.trg_appointment_status_notify`);
      console.log('[INFO] ✅ Trigger trg_appointment_status_notify eliminado');
    } catch (err) {
      console.log('[DEBUG] Trigger no existía o error al eliminar:', err.message);
    }

    // CREATE del trigger actualizado para cambios de estado
    const createTrigger2 = `
CREATE TRIGGER reciclaje_proyecto2db.trg_appointment_status_notify
AFTER UPDATE ON appointmentconfirmation
FOR EACH ROW
BEGIN
  IF NEW.state != OLD.state THEN
    
    IF NEW.state = 1 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,
        r.idUser,
        'appointment_accepted',
        'Solicitud aceptada',
        CONCAT('Tu solicitud de recolección a ', ur.email, ' de ', COALESCE(m.name, 'tu material'), ' fue aceptada'),
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      LEFT JOIN material m ON m.id = r.materialId
      WHERE r.id = NEW.idRequest;
    END IF;
    
    IF NEW.state = 3 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,
        r.idUser,
        'appointment_rejected',
        'Solicitud rechazada',
        CONCAT('Tu solicitud de recolección de ', COALESCE(m.name, 'tu material'), ' a ', ur.email, ' fue rechazada'),
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      LEFT JOIN material m ON m.id = r.materialId
      WHERE r.id = NEW.idRequest;
    END IF;
    
    IF NEW.state = 5 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,
        r.idUser,
        'appointment_canceled',
        'Cita cancelada',
        CONCAT('La cita con ', ur.email, ' ha sido cancelada'),
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      WHERE r.id = NEW.idRequest;
    END IF;
    
    IF NEW.state = 4 THEN
      INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
      SELECT 
        NEW.collectorId,
        r.idUser,
        'appointment_completed',
        'Recolección completada',
        CONCAT('La recolección de ', COALESCE(m.name, 'tu material'), ' con ', ur.email, ' ha sido marcada como completada'),
        NEW.idRequest,
        NEW.id,
        NOW() + INTERVAL 7 DAY
      FROM request r
      JOIN users ur ON ur.id = r.idUser
      LEFT JOIN material m ON m.id = r.materialId
      WHERE r.id = NEW.idRequest;
    END IF;
    
  END IF;
END`;

    await db.query(createTrigger2);
    console.log('[INFO] ✅ Trigger trg_appointment_status_notify creado con nombre del material');

    console.log('[INFO] ✅✅✅ Todos los triggers han sido actualizados correctamente');
    console.log('[INFO] Las notificaciones ahora mostrarán el nombre específico del material');
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error crítico:', error.message);
    process.exit(1);
  }
}

updateTriggers();
