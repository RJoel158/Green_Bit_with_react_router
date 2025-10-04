// Routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  createNewAppointment,
  getAppointments,
  updateAppointmentStatus
} from "../Controllers/appointmentController.js";

const router = express.Router();

router.post("/appointments", createAppointment);
//Metodo que inserta idRequest,acceptedDate, idCollector
router.post("/schedule", createNewAppointment);
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

export default router;
