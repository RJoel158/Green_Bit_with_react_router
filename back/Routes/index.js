/**
 * RUTAS CENTRALIZADAS - Green Bit API
 * 
 * Este archivo contiene TODAS las rutas del backend organizadas en un único lugar.
 * Incluye SOLO los endpoints que se usan realmente en el frontend.
 * 
 * NOTA: Las rutas NO incluyen el prefijo /api/ porque se montan con app.use('/api', routes)
 * El prefijo /api/ se agregará en server.js
 * 
 * IMPORTANTE: Las rutas están ordenadas por especificidad (específicas PRIMERO, genéricas DESPUÉS)
 * para evitar conflictos con parámetros dinámicos
 * 
 * Estructura:
 * - 17 rutas de USUARIOS
 * - 5 rutas de MATERIALES
 * - 7 rutas de SOLICITUDES
 * - 12 rutas de CITAS
 * - 3 rutas de NOTIFICACIONES
 * - 4 rutas de PUNTUACIONES
 * - 6 rutas de ANUNCIOS
 * - 2 rutas de UPLOAD
 * - 7 rutas de RANKING
 * - 3 rutas de REPORTES
 * - 1 ruta de SISTEMA
 * = 67 rutas totales
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Configuración de multer para uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, '../uploads/temp');
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const uploadMiddleware = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

const router = express.Router();

// ==========================================
// USUARIOS (17 rutas)
// ==========================================

// Auth
router.post('/users/login', userController.loginUser);

// Registro
router.post('/users', userController.createUser);
router.post('/users/collector', userController.createCollectorUser);
router.post('/users/institution', userController.createUserWithInstitution);
router.post('/users/institution-admin', userController.createUserWithInstitutionByAdmin);

// Recuperar contraseña
router.post('/users/forgotpassword', userController.forgotPassword);

// Cambiar contraseña
router.put('/users/changePassword/:userId', userController.changePassword);

// Gestión de recolectores - ESPECÍFICAS PRIMERO
router.get('/users/collectors/pending/institution', userController.getCollectorsPendingWithInstitution);
router.get('/users/collectors/pending', userController.getCollectorsPendingWithPerson);

// Gestión de instituciones - RUTAS CON PATHS FIJOS ANTES QUE CON PARÁMETROS
router.get('/users/institution', userController.getUsersWithInstitution);
router.post('/users/institution/approve/:id', userController.approveInstitution);
router.post('/users/institution/reject/:id', userController.rejectInstitution);
router.delete('/users/institution/:id', userController.deleteUserWithInstitution);

// Gestión de usuarios - RUTAS CON PATHS FIJOS ANTES QUE CON PARÁMETROS
router.get('/users/withPerson', userController.getUsersPerson);
router.post('/users/approve/:id', userController.approveUser);
router.post('/users/reject/:id', userController.rejectUser);

// CRÍTICO: Esta ruta DEBE ir ANTES de /users/:id para que no sea interceptada
router.get('/users/withInstitution/:id', userController.getUserWithInstitutionById);

// Rutas genéricas con parámetros dinámicos - AL FINAL
router.get('/users/person/:id', userController.getUsersPerson);
router.get('/users/check-email/:email', userController.checkEmailExists); 
router.put('/users/:id/role', userController.updateUserRole);
router.get('/users/:id', userController.getUserById);
router.delete('/users/:id', userController.deleteUser);

// ==========================================
// MATERIALES (5 rutas)
// ==========================================
// Rutas específicas PRIMERO
router.get('/material/:id', materialController.getMaterialById);
// Rutas genéricas DESPUÉS
router.get('/material', materialController.getMaterials);
router.post('/material', materialController.createMaterial);
router.put('/material/:id', materialController.updateMaterial);
router.delete('/material/:id', materialController.deleteMaterial);

// ==========================================
// SOLICITUDES (7 rutas)
// ==========================================
// Rutas específicas PRIMERO
router.get('/request/user/:userId/state', requestController.getRequestsByUserAndState);
router.post('/request/:id/schedule', appointmentController.createNewAppointment);
router.get('/request/:id/schedule', requestController.getRequestWithSchedule);
router.put('/request/:id/state', requestController.updateRequestState);
router.get('/request/:id', requestController.getRequestById);
// Rutas genéricas DESPUÉS
router.post('/request', requestController.upload.array('photos'), requestController.createRequest);
router.get('/request', requestController.getAllRequests);

// ==========================================
// CITAS (12 rutas)
// ==========================================
// Rutas específicas PRIMERO
router.post('/appointments/schedule', appointmentController.createNewAppointment);
router.get('/appointments/collector/:collectorId', appointmentController.getAppointmentsByCollector);
router.get('/appointments/recycler/:recyclerId', appointmentController.getAppointmentsByRecycler);
router.put('/appointments/:id/accept', appointmentController.acceptAppointmentEndpoint);
router.put('/appointments/:id/reject', appointmentController.rejectAppointmentEndpoint);
router.put('/appointments/:id/cancel', appointmentController.cancelAppointment);
router.put('/appointments/:id/complete', appointmentController.completeAppointmentEndpoint);
// Rutas genéricas DESPUÉS
router.get('/appointments/:id', appointmentController.getAppointmentById);
router.put('/appointments/:id', appointmentController.updateAppointmentStatus);
router.post('/appointments', appointmentController.createAppointment);
router.get('/appointments', appointmentController.getAppointments);

// ==========================================
// NOTIFICACIONES (3 rutas)
// ==========================================
router.get('/notifications/user/:userId', notificationController.getUserNotifications);
router.get('/notifications/unread/:userId', notificationController.getUnreadCount);
router.put('/notifications/read', notificationController.markNotificationAsRead);

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
// Rutas específicas PRIMERO
router.get('/announcements/role/:role', announcementController.getAnnouncementsByRole);
router.get('/announcements/:id', announcementController.getAnnouncementById);
// Rutas genéricas DESPUÉS
router.get('/announcements', announcementController.getAllAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);

// ==========================================
// UPLOAD (3 rutas)
// ==========================================
// Rutas específicas PRIMERO
router.post('/upload/announcement', uploadMiddleware.single('image'), uploadController.uploadAnnouncementImage);
router.get('/upload/announcement/:filename', uploadController.getAnnouncementImageInfo);
router.delete('/upload/announcement/:filename', uploadController.deleteAnnouncementImage);

// ==========================================
// RANKING (7 rutas)
// ==========================================
// Rutas específicas PRIMERO
router.get('/ranking/periods/active-or-last', rankingController.getActiveOrLastPeriod);
router.post('/ranking/periods/close', rankingController.closePeriod);
router.get('/ranking/live/:periodo_id', rankingController.getLiveRankingByPeriod);
router.get('/ranking/tops/:periodo_id', rankingController.getTopsByPeriod);
router.get('/ranking/history/:periodo_id', rankingController.getHistory);
// Rutas genéricas DESPUÉS
router.get('/ranking/periods', rankingController.getPeriods);
router.post('/ranking/periods', rankingController.createPeriod);

// ==========================================
// REPORTES (3 rutas)
// ==========================================
router.get('/reports/materiales', reportController.getMaterialesReport);
router.get('/reports/scores', reportController.getScoresReport);
router.get('/reports/recolecciones', reportController.getRecolectionsReport);

// ==========================================
// SISTEMA (1 ruta)
// ==========================================
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
