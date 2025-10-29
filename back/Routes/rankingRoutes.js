import express from 'express';
import rankingController from '../Controllers/rankingController.js';

const router = express.Router();

// Ranking en tiempo real por periodo
router.get('/live/:periodo_id', rankingController.getLiveRankingByPeriod);
// Listar todos los periodos
router.get('/periods', rankingController.getPeriods);
// Listar periodos cerrados
router.get('/periods/closed', rankingController.getClosedPeriods);
// Obtener periodo activo o último cerrado
router.get('/periods/active-or-last', rankingController.getActiveOrLastPeriod);
// Obtener tops por periodo
router.get('/tops/:periodo_id', rankingController.getTopsByPeriod);
// Obtener historial por periodo
router.get('/history/:periodo_id', rankingController.getHistory);
// Crear nuevo periodo
router.post('/periods', rankingController.createPeriod);
// Editar periodo
router.put('/periods/:id', rankingController.updatePeriod);
// Eliminar periodo
router.delete('/periods/:id', rankingController.deletePeriod);
// Cerrar periodo
router.post('/periods/close', rankingController.closePeriod);

export default router;
