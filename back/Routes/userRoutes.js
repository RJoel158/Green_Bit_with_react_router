// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  getUsersPerson,

  createCollectorUser,
  createUser,
  updateUser,
  updateUserRole,

  getUsersWithInstitution,
  getUserWithInstitutionById,
  createUserWithInstitution,
  updateUserWithInstitution,

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
router.get("/withInstitution/:id", getUserWithInstitutionById);
router.post('/institution', createUserWithInstitution);
router.put("/withInstitution/:id", updateUserWithInstitution);

//  Users con Persona
router.get("/", getUsers);
router.get("/withPerson", getUsersPerson);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/collector", createCollectorUser);

//User
router.put("/:id/role", updateUserRole);




export default router;
