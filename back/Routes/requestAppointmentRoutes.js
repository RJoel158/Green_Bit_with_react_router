// Routes/requestAppointmentRoutes.js
import express from "express";
import {
  createAppointment,
  createNewAppointment,
  getAppointments,
  updateAppointmentStatus,
  getAppointmentsByCollector,
  getAppointmentsByRecycler,
  getAppointmentById,
  cancelAppointment 
} from "../Controllers/appointmentController.js";

const router = express.Router();

router.post("/appointments", createAppointment);
router.post("/schedule", createNewAppointment);
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

// ✅ Ruta corregida para cancelar cita - cambiar a POST y ruta correcta
// RUTA correcta según lo que el frontend está llamando
router.post("/:id/cancel", cancelAppointment);


// Rutas para obtener appointments filtrados
router.get("/collector/:collectorId", getAppointmentsByCollector);
router.get("/recycler/:recyclerId", getAppointmentsByRecycler);

// Obtener appointment por ID
router.get("/:id", getAppointmentById);

export default router;