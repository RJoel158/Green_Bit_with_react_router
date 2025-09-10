// Controllers/userController.js
import bcrypt from "bcrypt";
import * as UserModel from "../Models/userModel.js";
import { sendCredentialsEmail } from "../Services/emailService.js";

/** GET /users */
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllWithPersona();
    res.json({ success: true, users });
  } catch (err) {
    console.error("[ERROR] getUsers controller:", { message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al obtener usuarios" });
  }
};

/** GET /users/:id */
export const getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await UserModel.getByIdWithPersona(id);
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("[ERROR] getUserById controller:", { params: req.params, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al obtener usuario" });
  }
};

/** POST /login */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.warn("[WARN] loginUser - missing fields", { body: { ...req.body, password: "[REDACTED]" } });
      return res.status(400).json({ success: false, error: "Email y contraseña son requeridos" });
    }

    const user = await UserModel.loginUser(email);
    if (!user) {
      console.warn("[WARN] loginUser - user not found", { email });
      return res.status(401).json({ success: false, error: "Usuario o contraseña incorrectos" });
    }

    // 🔐 validar contraseña encriptada
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.warn("[WARN] loginUser - invalid password for", { email });
      return res.status(401).json({ success: false, error: "Usuario o contraseña incorrectos" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        state: user.state,
      },
    });
  } catch (err) {
    console.error("[ERROR] loginUser controller:", { body: { ...req.body, password: "[REDACTED]" }, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al iniciar sesión" });
  }
};

/** POST /users -> crea user + person con contraseña temporal */
export const createUser = async (req, res) => {
  try {
    console.log("[INFO] POST /users body:", { ...req.body, password: undefined });
    const { nombres, apellidos, email, phone, role_id, username: usernameIncoming } = req.body;

    if (!nombres || !apellidos || !email || !phone) {
      console.warn("[WARN] createUser - missing fields", { body: req.body });
      return res.status(400).json({ success: false, error: "Campos requeridos: nombres, apellidos, email, phone" });
    }
    if (typeof email !== "string" || !email.includes("@")) {
      console.warn("[WARN] createUser - invalid email", { email });
      return res.status(400).json({ success: false, error: "Email inválido" });
    }

    const roleIdParsed = role_id !== undefined ? Number(role_id) : undefined;

    // 🔐 generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    try {
      const result = await UserModel.createWithPersona(
        nombres,
        apellidos,
        usernameIncoming,
        email,
        phone,
        roleIdParsed,
        hashedPassword // guardamos en BD el hash
      );

      res.status(201).json({
        success: true,
        id: result.userId,
        personId: result.personId,
        username: result.username,
        tempPassword, // ⚡ enviamos solo al registrar para mandar por correo
        
      });
      await sendCredentialsEmail(email, nombres, apellidos, email, tempPassword);
    } catch (err) {
      console.error("[ERROR] createUser model error:", {
        body: req.body,
        message: err.message,
        code: err.code || null,
        stack: err.stack,
      });
      if (err.code === "ER_ROLE_NOT_FOUND" || err.code === "ER_NO_ROLES") {
        return res.status(400).json({ success: false, error: err.message });
      }
      if (err && err.code === "ER_NO_REFERENCED_ROW_2") {
        return res.status(400).json({
          success: false,
          error: "Violación de FK al crear usuario (verifica role/foreign keys)",
          detail: err.sqlMessage || err.message,
        });
      }
      throw err;
    }
  } catch (err) {
    console.error("[ERROR] createUser controller unexpected:", { body: req.body, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al registrar usuario", detail: err.message });
  }
};

/** PUT /users/:id */
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { nombres, apellidos, username, email, phone, role_id, state } = req.body;
    const roleIdParsed = role_id !== undefined ? Number(role_id) : undefined;

    const updated = await UserModel.updateWithPersona(
      id,
      nombres,
      apellidos,
      username,
      email,
      phone,
      roleIdParsed,
      state
    );

    if (!updated) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true });
  } catch (err) {
    console.error("[ERROR] updateUser controller:", { params: req.params, body: req.body, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al actualizar usuario" });
  }
};

/** DELETE /users/:id */
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await UserModel.softDeleteWithPersona(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true });
  } catch (err) {
    console.error("[ERROR] deleteUser controller:", { params: req.params, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al eliminar usuario" });
  }
};

/** PUT /users/changePassword/:userId */
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, error: "La contraseña es requerida" });

    const user = await UserModel.getById(userId);
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await UserModel.updatePasswordAndState(userId, hashedPassword);
    if (!updated) return res.status(500).json({ success: false, error: "No se pudo actualizar la contraseña" });

    res.json({ success: true, message: "Contraseña cambiada correctamente" });
  } catch (err) {
    console.error("[ERROR] changePassword controller:", { params: req.params, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al cambiar la contraseña" });
  }
};
