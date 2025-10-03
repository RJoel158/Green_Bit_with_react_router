// Routes/requestRoutes.js
import express from 'express';
import {
  createRequest,
  getAllRequests,
  getUserRequests,
  getRequestById,
  updateRequestState,
  upload,
  getRequestWithSchedule
} from '../Controllers/requestController.js';

const router = express.Router();

// Crear solicitud con imágenes
router.post('/', upload.array('photos', 10), createRequest);

// Obtener todas las solicitudes
router.get('/', getAllRequests);

// Obtener solicitudes por usuario
router.get('/user/:userId', getUserRequests);

// Obtener solicitud por ID
router.get('/:id', getRequestById);

// Obtener solicitud por ID con el horario
router.get('/:id/schedule', getRequestWithSchedule);


// Actualizar estado de solicitud
router.put('/:id/state', updateRequestState);

export default router;