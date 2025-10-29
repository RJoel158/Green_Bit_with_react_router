import express from 'express';
import * as reportController from '../Controllers/reportController.js';

const router = express.Router();

router.get('/materiales', reportController.getMaterialesReport);
router.get('/scores', reportController.getScoresReport);
router.get('/recolecciones', reportController.getRecolectionsReport);

export default router;
