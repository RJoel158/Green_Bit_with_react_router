import * as AppointmentModel from "../Models/appointmentModel.js";
import db from "../Config/DBConnect.js";

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

    const appointmentId = await AppointmentModel.createAppointment(
      parseInt(idRequest),
      acceptedDate.trim(),
      parseInt(collectorId),
      acceptedHour.trim()
    );

    console.log("[INFO] createAppointment - appointment created:", appointmentId);

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

    const result = await AppointmentModel.cancelAppointment(
      parseInt(id),
      parseInt(userId),
      userRole
    );

    console.log("[INFO] cancelAppointment success:", result);

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
