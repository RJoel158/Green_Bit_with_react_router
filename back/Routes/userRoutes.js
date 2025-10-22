// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  getUsersPerson,
  getCollectorsPendingWithPerson,
  getCollectorsPendingWithInstitution,

  createCollectorUser,
  createUser,
  updateUser,
  updateUserRole,

  getUsersWithInstitution,
  getUserWithInstitutionById,
  createUserWithInstitution,
  updateUserWithInstitution,
  deleteUserWithInstitution,

  deleteUser,
  loginUser,
  changePassword,
  forgotPassword
} from "../Controllers/userController.js";

const router = express.Router();

//  Auth
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.put("/changePassword/:userId", changePassword);

//  Users con Institución
router.get("/withInstitution", getUsersWithInstitution);
router.get("/collectors/pending/institution", getCollectorsPendingWithInstitution);
router.get("/withInstitution/:id", getUserWithInstitutionById);
router.post('/institution', createUserWithInstitution);
router.put("/withInstitution/:id", updateUserWithInstitution);
router.delete("/institution/:id", deleteUserWithInstitution);

//  Users con Persona
router.get("/", getUsers);
router.get("/withPerson", getUsersPerson);
router.get("/collectors/pending", getCollectorsPendingWithPerson);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id/role", updateUserRole);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/collector", createCollectorUser);




export default router;
