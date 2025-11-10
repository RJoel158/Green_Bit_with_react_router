import express from 'express';
import * as reportController from '../Controllers/reportController.js';

const router = express.Router();

// Nombres en español (originales)
router.get('/materiales', reportController.getMaterialesReport);
router.get('/scores', reportController.getScoresReport);
router.get('/recolecciones', reportController.getRecolectionsReport);

// Nombres en inglés (aliases para compatibilidad)
router.get('/materials', reportController.getMaterialesReport);
router.get('/collections', reportController.getRecolectionsReport);
router.get('/appointments', reportController.getRecolectionsReport); // Puede ser igual a collections

export default router;
