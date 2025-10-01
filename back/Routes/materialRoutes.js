// Routes/materialRoutes.js
import express from 'express';
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  initializeMaterials
} from '../Controllers/materialController.js';

const router = express.Router();

// GET /api/material - Obtener todos los materiales
router.get('/', getMaterials);

// GET /api/material/initialize - Inicializar materiales básicos
router.get('/initialize', initializeMaterials);

// GET /api/material/:id - Obtener material por ID
router.get('/:id', getMaterialById);

// POST /api/material - Crear nuevo material
router.post('/', createMaterial);

// PUT /api/material/:id - Actualizar material
router.put('/:id', updateMaterial);

// DELETE /api/material/:id - Eliminar material (soft delete)
router.delete('/:id', deleteMaterial);

export default router;