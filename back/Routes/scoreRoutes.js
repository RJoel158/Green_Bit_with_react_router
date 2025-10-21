import express from 'express';
import * as scoreController from '../Controllers/scoreController.js';

const router = express.Router();

// Crear una calificación
router.post('/', scoreController.createScore);

// Verificar si un usuario ya calificó
router.get('/check/:appointmentId/:userId', scoreController.checkUserRated);

// Obtener calificaciones de una cita
router.get('/appointment/:appointmentId', scoreController.getAppointmentScores);

// Obtener promedio de calificaciones de un usuario
router.get('/user/:userId/average', scoreController.getUserAverageRating);

export default router;
