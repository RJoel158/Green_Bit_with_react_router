// Controllers/appointmentController.js
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

//Crear una confirmacion en estado 1(pendiente) usando el metodo createAppointment del modelo Appointment

export const createNewAppointment = async (req, res) => {
  try {
    const { 
      idRequest, 
      acceptedDate, 
      collectorId,
      acceptedHour
    } = req.body;
    
    console.log("[INFO] createNewAppointment controller called:", { 
      idRequest, 
      acceptedDate, 
      collectorId,
      acceptedHour 
    });

    // Validaciones básicas
    if (!idRequest || isNaN(parseInt(idRequest))) {
      return res.status(400).json({
        success: false,
        error: "ID de solicitud requerido y debe ser válido"
      });
    }

    if (!acceptedDate || typeof acceptedDate !== 'string' || acceptedDate.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "La fecha aceptada es requerida"
      });
    }

    if (!collectorId || isNaN(parseInt(collectorId))) {
      return res.status(400).json({
        success: false,
        error: "ID de recolector requerido y debe ser válido"
      });
    }

    // Validar formato de fecha
    const dateObj = new Date(acceptedDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Formato de fecha inválido"
      });
    }

    // Validar que la fecha no sea en el pasado
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (dateObj < now) {
      return res.status(400).json({
        success: false,
        error: "La fecha aceptada debe ser futura o actual"
      });
    }

    // Validar acceptedHour
    if (!acceptedHour || typeof acceptedHour !== 'string' || acceptedHour.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "La hora aceptada es requerida"
      });
    }

    // El modelo maneja su propia transacción - NO pasamos conn
    const appointmentId = await AppointmentModel.createAppointment(
      parseInt(idRequest),
      acceptedDate.trim(),
      parseInt(collectorId),
      acceptedHour.trim()
    );

    console.log("[INFO] createAppointment - appointment created with ID:", appointmentId);

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
    console.error("[ERROR] createAppointment controller:", {
      body: req.body,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    let errorMessage = "Error al confirmar cita";
    let statusCode = 500;

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = "Solicitud o recolector no válido";
      statusCode = 400;
    } else if (error.message.includes('not in state 0')) {
      errorMessage = "La solicitud ya tiene una cita asignada o no está disponible";
      statusCode = 400;
    } else if (error.message.includes('not found')) {
      errorMessage = "Solicitud no encontrada";
      statusCode = 404;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    
    res.json({ 
      success: true, 
      data: appointments,
      count: appointments.length 
    });
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
    
    res.json({ 
      success: true, 
      data: appointments,
      count: appointments.length 
    });
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
      return res.status(404).json({ 
        success: false, 
        error: "Cita no encontrada" 
      });
    }
    
    res.json({ 
      success: true, 
      data: appointment 
    });
  } catch (err) {
    console.error("[ERROR] getAppointmentById:", err.message);
    res.status(500).json({ success: false, error: "Error al obtener la cita" });
  }
};