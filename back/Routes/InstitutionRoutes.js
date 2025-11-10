// routes/institutionRoutes.js
import express from "express";
import {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "../Controllers/institutionController.js";

const router = express.Router();

// Rutas CRUD para instituciones
router.get("/", getInstitutions);          // Obtener todas
router.get("/:id", getInstitutionById);   // Obtener por ID
router.post("/", createInstitution);      // Crear nueva
router.put("/:id", updateInstitution);    // Actualizar
router.delete("/:id", deleteInstitution); // Borrado lógico

export default router;
