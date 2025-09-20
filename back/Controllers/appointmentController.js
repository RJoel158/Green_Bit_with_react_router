// Controllers/appointmentController.js
import * as AppointmentModel from "../Models/appointmentModel.js";
import db from "../Config/db.js";

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
