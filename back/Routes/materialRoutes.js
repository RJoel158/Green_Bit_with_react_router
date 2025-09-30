// Routes/materialRoutes.js
import express from 'express';
import * as materialController from '../Controllers/materialController.js';

const router = express.Router();

// GET /api/material - Obtener todos los materiales
router.get('/', materialController.getMaterials);

// GET /api/material/:id - Obtener material por ID
router.get('/:id', materialController.getMaterialById);

// POST /api/material - Crear nuevo material
router.post('/', materialController.createMaterial);

// PUT /api/material/:id - Actualizar material
router.put('/:id', materialController.updateMaterial);

// DELETE /api/material/:id - Eliminar material (soft delete)
router.delete('/:id', materialController.deleteMaterial);

export default router;