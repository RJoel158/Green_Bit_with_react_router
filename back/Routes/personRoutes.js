// routes/personRoutes.js
import express from "express";
import {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} from "../Controllers/personController.js";

const router = express.Router();

// Rutas CRUD para personas
router.get("/", getPersons);          // Obtener todas
router.get("/:id", getPersonById);   // Obtener por ID
router.post("/", createPerson);      // Crear nueva
router.put("/:id", updatePerson);    // Actualizar
router.delete("/:id", deletePerson); // Borrado lógico

export default router;
