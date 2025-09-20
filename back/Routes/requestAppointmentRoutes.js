// Routes/appointmentRoutes.js
import express from "express";
import {
  createAppointment,
  getAppointments,
  updateAppointmentStatus
} from "../Controllers/appointmentController.js";

const router = express.Router();

router.post("/appointments", createAppointment);
router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);

export default router;
