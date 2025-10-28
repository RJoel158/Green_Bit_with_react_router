/**
 * Report Routes - Rutas para generar reportes
 */
import express from 'express';
import * as reportController from '../Controllers/reportController.js';

const router = express.Router();

/**
 * GET /api/reports/materiales
 * Reporte de materiales reciclados (Donut chart)
 */
router.get('/materiales', reportController.getMaterialesReport);

/**
 * GET /api/reports/recolectores
 * Reporte de top recolectores (Pyramid chart)
 */
router.get('/recolectores', reportController.getRecolectoresReport);

/**
 * GET /api/reports/citas
 * Reporte de citas completadas vs pendientes (Bar chart)
 */
router.get('/citas', reportController.getCitasReport);

/**
 * GET /api/reports/puntuaciones
 * Reporte de distribución de puntuaciones (Donut chart)
 */
router.get('/puntuaciones', reportController.getPuntuacionesReport);

/**
 * GET /api/reports/:reportType/pdf
 * Descargar reporte en PDF
 */
router.get('/:reportType/pdf', reportController.downloadReportPDF);

export default router;
