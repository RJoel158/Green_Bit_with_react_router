// routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  changePassword,
} from "../Controllers/userController.js";

const router = express.Router();

router.post("/login", loginUser);
router.put("/changePassword/:userId", changePassword);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
