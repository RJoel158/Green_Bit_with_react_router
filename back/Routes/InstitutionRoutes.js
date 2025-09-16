// routes/personRoutes.js
import express from "express";
import {
  getInsitutions,
  getInstitutionId,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "../Controllers/personController.js";

const router = express.Router();

router.get("/", getPersons);
router.get("/:id", getPersonById);
router.post("/", createPerson);
router.put("/:id", updatePerson);
router.delete("/:id", deletePerson);

export default router;
