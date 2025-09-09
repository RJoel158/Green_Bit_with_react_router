// controllers/userController.js
import * as UserModel from "../Models/userModel.js";
import { passwordGenerater } from "../PasswordGenerator/passGen.js";




export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAll();
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error en getUsers:", err);
    res.status(500).json({ success: false, error: "Error al obtener usuarios" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.getById(req.params.id);
    if (user.length === 0) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }
    res.json({ success: true, user: user[0] });
  } catch (err) {
    console.error("Error en getUserById:", err);
    res.status(500).json({ success: false, error: "Error al obtener usuario" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Faltan email o contraseña");
      return res.status(400).json({ success: false, error: "Email y contraseña son requeridos" });
    }

    // Buscar usuario por email
    const user = await UserModel.loginUser(email);

    if (user.length === 0) {
      console.log("Usuario no encontrado:", email);
      return res.status(401).json({ success: false, error: "Usuario o contraseña incorrectos" });
    }

    // Comparar contraseña
    if (user[0].password !== password) {
      console.log("Contraseña incorrecta para:", email);
      return res.status(401).json({ success: false, error: "Usuario o contraseña incorrectos" });
    }

    const u = user[0];
    res.json({
      success: true,
      user: {
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        state:u.state,
      },
    });

  } catch (err) {
    console.error("Error en loginUser:", err);
    res.status(500).json({ success: false, error: "Error al iniciar sesión" });
  }
};




export const createUser = async (req, res) => {
  try {
    const { username,password, email, phone, role_id } = req.body;
    if (!username || !email || !phone) {
      return res.status(400).json({ success: false, error: "Todos los campos son requeridos" });
    }
    const result = await UserModel.create(username,passwordGenerater(12), email, phone, 3);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Error en createUser:", err);
    res.status(500).json({ success: false, error: "Error al registrar usuario" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { username, email, phone, role_id, state } = req.body;
    const id = req.params.id;

    const result = await UserModel.update(id, username, email, phone, role_id, state);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error en updateUser:", err);
    res.status(500).json({ success: false, error: "Error al actualizar usuario" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await UserModel.softDelete(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error en deleteUser:", err);
    res.status(500).json({ success: false, error: "Error al eliminar usuario" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params; // userId desde la URL
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: "La contraseña es requerida" });
    }

    // Verificar que el usuario existe
    const user = await UserModel.getById(userId);
    if (user.length === 0) {
      return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    }

    // Actualizar contraseña y poner state a 0
    const result = await UserModel.updatePasswordAndState(userId, password, 0);

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, error: "No se pudo actualizar la contraseña" });
    }

    res.json({ success: true, message: "Contraseña cambiada correctamente" });
  } catch (err) {
    console.error("Error en changePassword:", err);
    res.status(500).json({ success: false, error: "Error al cambiar la contraseña" });
  }
};
