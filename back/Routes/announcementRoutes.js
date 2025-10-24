import express from 'express';
import * as announcementController from '../Controllers/announcementController.js';

const router = express.Router();

// GET: Obtener todos los anuncios
router.get('/', announcementController.getAllAnnouncements);

// GET: Obtener anuncio por ID
router.get('/:id', announcementController.getAnnouncementById);

// GET: Obtener anuncios por rol
router.get('/role/:role', announcementController.getAnnouncementsByRole);

// POST: Crear anuncio
router.post('/', announcementController.createAnnouncement);

// PUT: Actualizar anuncio
router.put('/:id', announcementController.updateAnnouncement);

// DELETE: Eliminar anuncio
router.delete('/:id', announcementController.deleteAnnouncement);

export default router;
