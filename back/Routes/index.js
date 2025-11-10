/**
 * RUTAS CENTRALIZADAS - Green Bit API
 * 
 * Este archivo contiene TODAS las rutas del backend organizadas en un único lugar.
 * Incluye SOLO los endpoints que se usan realmente en el frontend.
 * 
 * NOTA: Las rutas NO incluyen el prefijo /api/ porque se montan con app.use('/api', routes)
 * El prefijo /api/ se agregará en server.js
 * 
 * Estructura:
 * - 17 rutas de USUARIOS (login, registro, obtener, aprobar, rechazar)
 * - 1 ruta de MATERIALES
 * - 2 rutas de SOLICITUDES
 * - 2 rutas de CITAS
 * - 3 rutas de NOTIFICACIONES
 * - 4 rutas de PUNTUACIONES
 * - 6 rutas de ANUNCIOS
 * - 3 rutas de UPLOAD
 * - 7 rutas de RANKING
 * - 3 rutas de REPORTES
 * - 1 ruta de SISTEMA
 * = 49 rutas totales
 */

import express from 'express';

// Importar controllers
import * as userController from '../Controllers/userController.js';
import * as materialController from '../Controllers/materialController.js';
import * as requestController from '../Controllers/requestController.js';
import * as appointmentController from '../Controllers/appointmentController.js';
import * as notificationController from '../Controllers/notificationController.js';
import * as scoreController from '../Controllers/scoreController.js';
import * as announcementController from '../Controllers/announcementController.js';
import * as uploadController from '../Controllers/uploadController.js';
import rankingController from '../Controllers/rankingController.js';
import * as reportController from '../Controllers/reportController.js';

const router = express.Router();

// ==========================================
// USUARIOS (17 rutas)
// ==========================================

// Auth
router.post('/users/login', userController.loginUser);

// Registro
router.post('/users/register', userController.createUser);
router.post('/users/register-collector', userController.createCollectorUser);
router.post('/users/register-institution', userController.createUserWithInstitution);
router.post('/users/register-institution-admin', userController.createUserWithInstitutionByAdmin);

// Obtener usuarios
router.get('/users/:id', userController.getUserById);
router.get('/users/person/:id', userController.getUsersPerson);
router.get('/users/institution/:id', userController.getUserWithInstitutionById);
router.get('/users/collectors/pending', userController.getCollectorsPendingWithPerson);
router.get('/users/collectors/pending/institution', userController.getCollectorsPendingWithInstitution);

// Aprobar/Rechazar usuarios (personas)
router.post('/users/approve/:id', userController.approveUser);
router.post('/users/reject/:id', userController.rejectUser);

// Aprobar/Rechazar instituciones
router.post('/users/institution/approve/:id', userController.approveInstitution);
router.post('/users/institution/reject/:id', userController.rejectInstitution);

// Actualizar
router.put('/users/:id/role', userController.updateUserRole);

// Eliminar
router.delete('/users/:id', userController.deleteUser);
router.delete('/users/institution/:id', userController.deleteUserWithInstitution);

// ==========================================
// MATERIALES (1 ruta)
// ==========================================
router.get('/material', materialController.getMaterials);

// ==========================================
// SOLICITUDES (2 rutas)
// ==========================================
router.post('/request', requestController.upload.array('photos'), requestController.createRequest);
router.post('/request/:id/schedule', appointmentController.createNewAppointment);

// ==========================================
// CITAS (2 rutas)
// ==========================================
router.get('/appointments/collector/:collectorId', appointmentController.getAppointmentsByCollector);
router.get('/appointments/recycler/:recyclerId', appointmentController.getAppointmentsByRecycler);

// ==========================================
// NOTIFICACIONES (3 rutas)
// ==========================================
router.get('/notification/user/:userId', notificationController.getUserNotifications);
router.get('/notification/unread/:userId', notificationController.getUnreadCount);
router.put('/notification/read', notificationController.markNotificationAsRead);

// ==========================================
// PUNTUACIONES (4 rutas)
// ==========================================
router.post('/score', scoreController.createScore);
router.get('/score/check/:appointmentId/:userId', scoreController.checkUserRated);
router.get('/score/appointment/:appointmentId', scoreController.getAppointmentScores);
router.get('/score/user/:userId/average', scoreController.getUserAverageRating);

// ==========================================
// ANUNCIOS (6 rutas)
// ==========================================
router.get('/announcements', announcementController.getAllAnnouncements);
router.get('/announcements/:id', announcementController.getAnnouncementById);
router.get('/announcements/role/:role', announcementController.getAnnouncementsByRole);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);

// ==========================================
// UPLOAD (3 rutas)
// ==========================================
router.post('/upload/announcement', uploadController.uploadAnnouncementImage);
router.get('/upload/announcement/:filename', uploadController.getAnnouncementImageInfo);
router.delete('/upload/announcement/:filename', uploadController.deleteAnnouncementImage);

// ==========================================
// RANKING (7 rutas)
// ==========================================
router.get('/ranking/periods', rankingController.getPeriods);
router.get('/ranking/active-or-last', rankingController.getActiveOrLastPeriod);
router.get('/ranking/live/:periodo_id', rankingController.getLiveRankingByPeriod);
router.get('/ranking/tops/:periodo_id', rankingController.getTopsByPeriod);
router.get('/ranking/history/:periodo_id', rankingController.getHistory);
router.post('/ranking/periods', rankingController.createPeriod);
router.post('/ranking/periods/:id/close', rankingController.closePeriod);

// ==========================================
// REPORTES (3 rutas)
// ==========================================
router.get('/reports/materiales', reportController.getMaterialesReport);
router.get('/reports/scores', reportController.getScoresReport);
router.get('/reports/recolecciones', reportController.getRecolectionsReport);

// ==========================================
// SISTEMA (1 ruta)
// ==========================================
router.get('/system/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
