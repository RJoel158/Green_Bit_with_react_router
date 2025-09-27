// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,

  createCollectorUser,
  createUser,
  updateUser,

  getUsersWithInstitution,
  getUserWithInstitutionById,
  createUserWithInstitution,
  updateUserWithInstitution,

  deleteUser,
  loginUser,
  changePassword,
} from "../Controllers/userController.js";

const router = express.Router();

//  Auth
router.post("/login", loginUser);
router.put("/changePassword/:userId", changePassword);

//  Users con Persona
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/collector", createCollectorUser);


//  Users con Institución
router.get("/withInstitution", getUsersWithInstitution);
router.get("/withInstitution/:id", getUserWithInstitutionById);
router.post('/institution', createUserWithInstitution);
router.put("/withInstitution/:id", updateUserWithInstitution);

export default router;
