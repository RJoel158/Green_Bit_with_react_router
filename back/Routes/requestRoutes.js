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

// Endpoint de prueba para verificar imágenes de una solicitud específica
router.get('/:id/images', async (req, res) => {
  try {
    const { id } = req.params;
    const [images] = await (await import('../Config/DBConnect.js')).default.query(
      'SELECT * FROM image WHERE idRequest = ?',
      [id]
    );
    res.json({
      success: true,
      requestId: id,
      images: images,
      count: images.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint para listar todas las solicitudes con sus imágenes
router.get('/debug/all-with-images', async (req, res) => {
  try {
    const db = (await import('../Config/DBConnect.js')).default;
    
    const [requests] = await db.query(`
      SELECT r.id, r.description, r.materialId, 
             COUNT(i.id) as imageCount
      FROM request r
      LEFT JOIN image i ON i.idRequest = r.id
      GROUP BY r.id, r.description, r.materialId
      ORDER BY r.id
    `);
    
    res.json({
      success: true,
      requests: requests,
      totalRequests: requests.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Actualizar estado de solicitud
router.put('/:id/state', updateRequestState);

export default router;