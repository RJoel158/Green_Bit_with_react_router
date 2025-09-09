// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
} from "../Controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.get("/:email", getUserByEmail);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
