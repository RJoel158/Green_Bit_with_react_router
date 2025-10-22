import * as AppointmentModel from "../Models/appointmentModel.js";
import db from "../Config/DBConnect.js";
import * as NotificationModel from "../Models/notificationModel.js";
import { sendRealTimeNotification } from "../server.js";
import { APPOINTMENT_STATE, REQUEST_STATE } from "../shared/constants.js";

/** POST /appointments */
export const createAppointment = async (req, res) => {
  const { userId, institutionId, date, description } = req.body;

  if (!userId || !institutionId || !date) {
    return res.status(400).json({ success: false, error: "Faltan campos requeridos" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const appointmentId = await AppointmentModel.create(
      conn,
      userId,
      institutionId,
      date,
      description
    );
    await conn.commit();

    res.status(201).json({
      success: true,
      message: "Cita creada correctamente",
      data: { appointmentId, userId, institutionId, date, description }
    });
  } catch (err) {
    await conn.rollback();
    console.error("[ERROR] createAppointment:", err.message);
    res.status(500).json({ success: false, error: "Error al crear cita" });
  } finally {
    conn.release();
  }
};

/** GET /appointments */
export const getAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getAll();
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error("[ERROR] getAppointments:", err.message);
    res.status(500).json({ success: false, error: "Error al obtener citas" });
  }
};

/** PATCH /appointments/:id/status */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, error: "Estado inválido" });
    }

    await AppointmentModel.updateStatus(id, status);
    res.json({ success: true, message: "Estado actualizado" });
  } catch (err) {
    console.error("[ERROR] updateAppointmentStatus:", err.message);
    res.status(500).json({ success: false, error: "Error al actualizar estado" });
  }
};

// Crear una confirmación en estado 1(pendiente)
export const createNewAppointment = async (req, res) => {
  try {
    const { idRequest, acceptedDate, collectorId, acceptedHour } = req.body;

    console.log("[INFO] createNewAppointment controller called:", { idRequest, acceptedDate, collectorId, acceptedHour });

    if (!idRequest || isNaN(parseInt(idRequest))) {
      return res.status(400).json({ success: false, error: "ID de solicitud requerido y válido" });
    }

    if (!acceptedDate?.trim()) {
      return res.status(400).json({ success: false, error: "La fecha aceptada es requerida" });
    }

    if (!collectorId || isNaN(parseInt(collectorId))) {
      return res.status(400).json({ success: false, error: "ID de recolector requerido y válido" });
    }

    const dateObj = new Date(acceptedDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ success: false, error: "Formato de fecha inválido" });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (dateObj < now) {
      return res.status(400).json({ success: false, error: "La fecha debe ser actual o futura" });
    }

    if (!acceptedHour?.trim()) {
      return res.status(400).json({ success: false, error: "La hora aceptada es requerida" });
    }

    // VALIDACIÓN CRÍTICA: Verificar que el recolector no esté intentando aceptar su propia solicitud
    const [requestOwner] = await db.query(
      `SELECT idUser FROM request WHERE id = ?`,
      [parseInt(idRequest)]
    );

    if (!requestOwner || requestOwner.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Solicitud no encontrada" 
      });
    }

    if (requestOwner[0].idUser === parseInt(collectorId)) {
      return res.status(403).json({ 
        success: false, 
        error: "No puedes aceptar tu propia solicitud de reciclaje" 
      });
    }

    const appointmentId = await AppointmentModel.createAppointment(
      parseInt(idRequest),
      acceptedDate.trim(),
      parseInt(collectorId),
      acceptedHour.trim()
    );

    console.log("[INFO] createAppointment - appointment created:", appointmentId);

    // Intentar obtener información de la request para direccionar la notificación
    try {
      const [rows] = await db.query(
        `SELECT r.idUser as recyclerId, u.email as recyclerEmail,
                uc.email as collectorEmail
         FROM request r
         JOIN users u ON u.id = r.idUser
         JOIN users uc ON uc.id = ?
         WHERE r.id = ?`,
        [parseInt(collectorId), parseInt(idRequest)]
      );

      if (rows && rows[0]) {
        const recyclerId = rows[0].recyclerId;
        const collectorEmail = rows[0].collectorEmail;
        
        // Solo emitir notificación en tiempo real (no insertar en BD, los triggers lo hacen)
        sendRealTimeNotification(recyclerId, {
          id: Date.now(),
          type: 'request_received',
          title: 'Solicitud de recolección',
          body: `El usuario ${collectorEmail} ha solicitado recoger tu material el ${acceptedDate}`,
          requestId: parseInt(idRequest),
          appointmentId: appointmentId,
          read: false,
          createdAt: new Date().toISOString(),
          actorEmail: collectorEmail,
        });
      }
    } catch (e) {
      console.warn('[WARN] No se pudo enviar notificación en tiempo real:', e.message);
    }

    res.status(201).json({
      success: true,
      id: appointmentId,
      message: "Cita confirmada exitosamente",
      data: {
        appointmentId,
        idRequest: parseInt(idRequest),
        acceptedDate: acceptedDate.trim(),
        collectorId: parseInt(collectorId),
        acceptedHour: acceptedHour.trim()
      }
    });
  } catch (error) {
    console.error("[ERROR] createAppointment controller:", error);

    let errorMessage = "Error al confirmar cita";
    let statusCode = 500;

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      errorMessage = "Solicitud o recolector no válido";
      statusCode = 400;
    } else if (error.message.includes("not in state 0")) {
      errorMessage = "La solicitud ya tiene una cita asignada o no está disponible";
      statusCode = 400;
    } else if (error.message.includes("not found")) {
      errorMessage = "Solicitud no encontrada";
      statusCode = 404;
    }

    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};

// Obtener appointments por collector y estado
export const getAppointmentsByCollector = async (req, res) => {
  try {
    const { collectorId } = req.params;
    const { state, limit } = req.query;

    const appointments = await AppointmentModel.getAppointmentsByCollectorAndState(
      parseInt(collectorId),
      state ? parseInt(state) : null,
      limit ? parseInt(limit) : null
    );

    res.json({ success: true, data: appointments, count: appointments.length });
  } catch (err) {
    console.error("[ERROR] getAppointmentsByCollector:", err.message);
    res.status(500).json({ success: false, error: "Error al obtener citas del collector" });
  }
};

// Obtener appointments por recycler y estado
export const getAppointmentsByRecycler = async (req, res) => {
  try {
    const { recyclerId } = req.params;
    const { state, limit } = req.query;

    const appointments = await AppointmentModel.getAppointmentsByRecyclerAndState(
      parseInt(recyclerId),
      state ? parseInt(state) : null,
      limit ? parseInt(limit) : null
    );

    res.json({ success: true, data: appointments, count: appointments.length });
  } catch (err) {
    console.error("[ERROR] getAppointmentsByRecycler:", err.message);
    res.status(500).json({ success: false, error: "Error al obtener citas del recycler" });
  }
};

// Obtener appointment por ID
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentModel.getAppointmentById(parseInt(id));

    if (!appointment) {
      return res.status(404).json({ success: false, error: "Cita no encontrada" });
    }

    res.json({ success: true, data: appointment });
  } catch (err) {
    console.error("[ERROR] getAppointmentById:", err.message);
    res.status(500).json({ success: false, error: "Error al obtener la cita" });
  }
};

// ✅ NUEVA FUNCIÓN: Cancelar una cita
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, userRole } = req.body;

    console.log("[INFO] cancelAppointment called:", { id, userId, userRole });

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, error: "ID de cita inválido" });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ success: false, error: "ID de usuario requerido" });
    }

    // Obtener información de la cita antes de cancelar para enviar notificación
    let appointment = null;
    try {
      console.log("[INFO] Fetching appointment info for ID:", id);
      const [rows] = await db.query(
        `SELECT ac.idRequest, ac.collectorId,
                r.idUser as recyclerId,
                COALESCE(CONCAT(pc.firstname, ' ', pc.lastname), uc.email) as collectorName,
                COALESCE(CONCAT(pr.firstname, ' ', pr.lastname), ur.email) as recyclerName
         FROM appointmentconfirmation ac
         JOIN request r ON r.id = ac.idRequest
         LEFT JOIN users uc ON uc.id = ac.collectorId
         LEFT JOIN person pc ON pc.userId = ac.collectorId
         LEFT JOIN users ur ON ur.id = r.idUser
         LEFT JOIN person pr ON pr.userId = r.idUser
         WHERE ac.id = ?`,
        [parseInt(id)]
      );

      console.log("[DEBUG] Query result - rows count:", rows?.length || 0);
      if (rows && rows.length > 0) {
        appointment = rows[0];
        console.log("[INFO] Appointment info retrieved:", JSON.stringify(appointment, null, 2));
      } else {
        console.log("[WARN] No appointment info found for ID:", id);
      }
    } catch (queryError) {
      console.error("[ERROR] Failed to get appointment info for notification:", queryError);
      console.error("[ERROR] Query error details:", queryError.message);
      // Continuar con la cancelación aunque falle obtener info para notificación
    }
    
    const result = await AppointmentModel.cancelAppointment(
      parseInt(id),
      parseInt(userId),
      userRole
    );

    console.log("[INFO] cancelAppointment success:", result);

    // Enviar notificación al otro usuario (solo si tenemos la información)
    console.log("[DEBUG] About to check appointment:", { hasAppointment: !!appointment, appointment });
    if (appointment) {
      try {
        const isCollectorCancelling = parseInt(userId) === appointment.collectorId;
        const notificationUserId = isCollectorCancelling ? appointment.recyclerId : appointment.collectorId;
        const cancellerName = isCollectorCancelling ? appointment.collectorName : appointment.recyclerName;

        const notificationTitle = "🚫 Cita cancelada";
        const notificationMessage = `${cancellerName} canceló tu cita de recolección`;

        console.log(`[INFO] Sending notification to user ${notificationUserId} about cancellation by ${cancellerName}`);

        // Crear notificación en BD
        const notifId = await NotificationModel.createNotification(
          notificationUserId,
          notificationTitle,
          notificationMessage,
          "appointment_canceled",
          parseInt(id)
        );

        console.log(`[INFO] Notification created in DB with ID: ${notifId}`);

        // Enviar en tiempo real
        const notificationData = {
          id: notifId,
          title: notificationTitle,
          body: notificationMessage,
          type: "appointment_canceled",
          appointmentId: parseInt(id),
          requestId: appointment.idRequest,
          createdAt: new Date().toISOString()
        };
        
        console.log(`[INFO] Sending real-time notification:`, notificationData);
        const sent = sendRealTimeNotification(notificationUserId, notificationData);
        console.log(`[INFO] Real-time notification ${sent ? 'sent' : 'not sent'} to user ${notificationUserId}`);
      } catch (notifError) {
        console.error("[WARN] Failed to send cancellation notification:", notifError);
        // No fallar la cancelación si falla la notificación
      }
    } else {
      console.log("[WARN] Skipping notification - appointment info not available");
    }

    // ✅ RESPUESTA JSON CORRECTA PARA EL FRONTEND
    return res.status(200).json({
      success: true,
      message: "Cita cancelada exitosamente. La solicitud estará disponible nuevamente en el mapa.",
      data: result || {}
    });
  } catch (error) {
    console.error("[ERROR] cancelAppointment controller:", error);

    let errorMessage = "Error al cancelar la cita";
    let statusCode = 500;

    if (error.message.includes("not found")) {
      errorMessage = "Cita no encontrada";
      statusCode = 404;
    } else if (error.message.includes("does not have permission")) {
      errorMessage = "No tienes permiso para cancelar esta cita";
      statusCode = 403;
    } else if (error.message.includes("cannot be cancelled")) {
      errorMessage = "Esta cita no puede ser cancelada en su estado actual";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

// Aceptar un appointment (recycler confirma la recolección)
export const acceptAppointmentEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log("[INFO] acceptAppointment called:", { id, userId });

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, error: "ID de cita inválido" });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ success: false, error: "ID de usuario requerido" });
    }

    const result = await AppointmentModel.acceptAppointment(
      parseInt(id),
      parseInt(userId)
    );

    console.log("[INFO] acceptAppointment success:", result);

    return res.status(200).json({
      success: true,
      message: "Cita aceptada exitosamente.",
      data: result || {}
    });
  } catch (error) {
    console.error("[ERROR] acceptAppointment controller:", error);

    let errorMessage = "Error al aceptar la cita";
    let statusCode = 500;

    if (error.message.includes("not found")) {
      errorMessage = "Cita no encontrada";
      statusCode = 404;
    } else if (error.message.includes("not in PENDING state")) {
      errorMessage = "Esta cita no está en estado pendiente";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

// Rechazar un appointment (recycler rechaza la recolección)
export const rejectAppointmentEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log("[INFO] rejectAppointment called:", { id, userId });

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, error: "ID de cita inválido" });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ success: false, error: "ID de usuario requerido" });
    }

    const result = await AppointmentModel.rejectAppointment(
      parseInt(id),
      parseInt(userId)
    );

    console.log("[INFO] rejectAppointment success:", result);

    // Insertar notificación en BD y enviar en tiempo real al collector
    try {
      console.log("[INFO] Intentando enviar notificación de rechazo para appointmentId:", parseInt(id));
      
      const [rows] = await db.query(
        `SELECT ac.idRequest, ac.collectorId, ac.state,
                u.email as recyclerEmail, r.idUser as recyclerId
         FROM appointmentconfirmation ac
         JOIN request r ON r.id = ac.idRequest
         JOIN users u ON u.id = r.idUser
         WHERE ac.id = ?`,
        [parseInt(id)]
      );

      console.log("[INFO] Query resultado para notificación:", rows);

      if (rows && rows[0]) {
        const collectorId = rows[0].collectorId;
        const recyclerId = rows[0].recyclerId;
        const recyclerEmail = rows[0].recyclerEmail;
        const requestId = rows[0].idRequest;
        
        console.log("[INFO] Datos para notificación:", { collectorId, recyclerId, recyclerEmail, requestId, appointmentId: parseInt(id) });
        
        // Insertar notificación en la base de datos
        await db.query(
          `INSERT INTO notifications (userId, actorId, type, title, body, requestId, appointmentId, expireAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW() + INTERVAL 7 DAY)`,
          [
            collectorId,
            recyclerId,
            'appointment_rejected',
            'Solicitud rechazada',
            `Tu solicitud de recolección a ${recyclerEmail} fue rechazada`,
            requestId,
            parseInt(id)
          ]
        );
        
        console.log("[INFO] Notificación insertada en BD para userId:", collectorId);
        
        // Enviar notificación en tiempo real al collector
        const notificationSent = sendRealTimeNotification(collectorId, {
          id: Date.now(),
          type: 'appointment_rejected',
          title: 'Solicitud rechazada',
          body: `Tu solicitud de recolección a ${recyclerEmail} fue rechazada`,
          requestId: requestId,
          appointmentId: parseInt(id),
          read: false,
          createdAt: new Date().toISOString(),
          actorEmail: recyclerEmail,
        });
        
        console.log("[INFO] Notificación en tiempo real enviada:", notificationSent);
      } else {
        console.warn('[WARN] No se encontró información del appointment para notificación');
      }
    } catch (e) {
      console.error('[ERROR] Error al enviar notificación de rechazo:', e.message, e.stack);
    }

    return res.status(200).json({
      success: true,
      message: "Cita rechazada. La solicitud estará disponible nuevamente en el mapa.",
      data: result || {}
    });
  } catch (error) {
    console.error("[ERROR] rejectAppointment controller:", error);

    let errorMessage = "Error al rechazar la cita";
    let statusCode = 500;

    if (error.message.includes("not found")) {
      errorMessage = "Cita no encontrada";
      statusCode = 404;
    } else if (error.message.includes("not in PENDING state")) {
      errorMessage = "Esta cita no está en estado pendiente";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};

// Completar un appointment (recolección exitosa)
export const completeAppointmentEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    console.log("[INFO] completeAppointment called:", { id, userId });

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ success: false, error: "ID de cita inválido" });
    }

    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ success: false, error: "ID de usuario requerido" });
    }

    const result = await AppointmentModel.completeAppointment(
      parseInt(id),
      parseInt(userId)
    );

    console.log("[INFO] completeAppointment success:", result);

    return res.status(200).json({
      success: true,
      message: "Cita completada exitosamente. La recolección ha finalizado.",
      data: result || {}
    });
  } catch (error) {
    console.error("[ERROR] completeAppointment controller:", error);

    let errorMessage = "Error al completar la cita";
    let statusCode = 500;

    if (error.message.includes("not found")) {
      errorMessage = "Cita no encontrada";
      statusCode = 404;
    } else if (error.message.includes("not in ACCEPTED state")) {
      errorMessage = "Esta cita no está en estado aceptado";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
};
