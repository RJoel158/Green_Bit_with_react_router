import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as uploadController from '../Controllers/uploadController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Almacenamiento temporal
    const tempDir = path.join(__dirname, '../uploads/temp');
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
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

// POST: Subir imagen de anuncio
router.post('/announcement', upload.single('image'), uploadController.uploadAnnouncementImage);

// GET: Obtener información de imagen
router.get('/announcement/:filename', uploadController.getAnnouncementImageInfo);

// DELETE: Eliminar imagen
router.delete('/announcement/:filename', uploadController.deleteAnnouncementImage);

export default router;
