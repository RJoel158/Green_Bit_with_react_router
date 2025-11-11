// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  getUsersPerson,
  getCollectorsPendingWithPerson,
  getCollectorsPendingWithInstitution,
  checkEmailExists,

  createCollectorUser,
  createUser,
  updateUser,
  updateUserRole,

  getUsersWithInstitution,
  getUserWithInstitutionById,
  createUserWithInstitution,
  createUserWithInstitutionByAdmin,
  updateUserWithInstitution,
  deleteUserWithInstitution,

  deleteUser,
  rejectUser,
  rejectInstitution,
  approveUser,
  approveInstitution,
  loginUser,
  changePassword,
  forgotPassword
} from "../Controllers/userController.js";

const router = express.Router();

//  Auth
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.put("/changePassword/:userId", changePassword);

//  ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir antes que las genéricas con parámetros dinámicos
//  Users con Institución - RUTAS ESPECÍFICAS PRIMERO
router.get("/collectors/pending/institution", getCollectorsPendingWithInstitution);
router.post('/institution', createUserWithInstitution);
router.post('/institution-admin', createUserWithInstitutionByAdmin);
router.delete("/institution/:id", deleteUserWithInstitution);
router.post("/institution/reject/:id", rejectInstitution);
router.post("/institution/approve/:id", approveInstitution);

//  Users con Persona - RUTAS ESPECÍFICAS PRIMERO
router.get("/collectors/pending", getCollectorsPendingWithPerson);
router.get("/check-email/:email", checkEmailExists);
router.post("/collector", createCollectorUser);
router.post("/reject/:id", rejectUser);
router.post("/approve/:id", approveUser);

//  Rutas genéricas por nombre/path
router.get("/withInstitution", getUsersWithInstitution);
router.get("/withPerson", getUsersPerson);

//  Rutas con IDs dinámicos - DEBEN IR AL FINAL
router.get("/withInstitution/:id", getUserWithInstitutionById);
router.put("/withInstitution/:id", updateUserWithInstitution);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id/role", updateUserRole);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/", getUsers);




export default router;
