import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio para guardar imágenes de anuncios
const ANNOUNCEMENTS_UPLOAD_DIR = path.join(__dirname, '../uploads/announcements');

// Crear directorio si no existe
if (!fs.existsSync(ANNOUNCEMENTS_UPLOAD_DIR)) {
  fs.mkdirSync(ANNOUNCEMENTS_UPLOAD_DIR, { recursive: true });
  console.log('📁 Directorio de anuncios creado:', ANNOUNCEMENTS_UPLOAD_DIR);
}

// POST: Subir imagen de anuncio
export const uploadAnnouncementImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó imagen'
      });
    }

    const file = req.file;
    
    // Validar tipo de archivo
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      // Eliminar archivo si no es válido
      fs.unlinkSync(file.path);
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido. Usa: JPG, PNG, WebP o GIF'
      });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `announcement_${timestamp}${ext}`;
    const filepath = path.join(ANNOUNCEMENTS_UPLOAD_DIR, filename);

    // Mover archivo
    fs.renameSync(file.path, filepath);

    // URL relativa para el frontend
    const imageUrl = `/uploads/announcements/${filename}`;

    console.log('✅ Imagen de anuncio subida:', imageUrl);

    res.json({
      success: true,
      data: {
        filename: filename,
        url: imageUrl,
        size: file.size,
        mimetype: file.mimetype
      },
      message: 'Imagen subida correctamente'
    });
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET: Obtener metadatos de imagen (verificar que existe)
export const getAnnouncementImageInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(ANNOUNCEMENTS_UPLOAD_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    const stats = fs.statSync(filepath);

    res.json({
      success: true,
      data: {
        filename: filename,
        size: stats.size,
        createdAt: stats.birthtime,
        exists: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE: Eliminar imagen de anuncio
export const deleteAnnouncementImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(ANNOUNCEMENTS_UPLOAD_DIR, filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    fs.unlinkSync(filepath);
    console.log('🗑️ Imagen eliminada:', filename);

    res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
