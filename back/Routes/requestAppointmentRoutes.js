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
  cancelAppointment,
  acceptAppointmentEndpoint,
  rejectAppointmentEndpoint,
  completeAppointmentEndpoint
} from "../Controllers/appointmentController.js";

const router = express.Router();

router.post("/appointments", createAppointment);
router.post("/schedule", createNewAppointment);
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

// Rutas para acciones sobre appointments
router.post("/:id/cancel", cancelAppointment);
router.post("/:id/accept", acceptAppointmentEndpoint);
router.post("/:id/reject", rejectAppointmentEndpoint);
router.post("/:id/complete", completeAppointmentEndpoint);

// Rutas para obtener appointments filtrados
router.get("/collector/:collectorId", getAppointmentsByCollector);
router.get("/recycler/:recyclerId", getAppointmentsByRecycler);

// Obtener appointment por ID
router.get("/:id", getAppointmentById);

export default router;