// Routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  createNewAppointment,
  getAppointments,
  updateAppointmentStatus,
  getAppointmentsByCollector,
  getAppointmentsByRecycler,
  getAppointmentById
} from "../Controllers/appointmentController.js";

const router = express.Router();

router.post("/appointments", createAppointment);
//Metodo que inserta idRequest,acceptedDate, idCollector
router.post("/schedule", createNewAppointment);
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

// Nuevas rutas para obtener appointments filtrados
router.get("/collector/:collectorId", getAppointmentsByCollector);
router.get("/recycler/:recyclerId", getAppointmentsByRecycler);

// Obtener appointment por ID
router.get("/:id", getAppointmentById);

export default router;
