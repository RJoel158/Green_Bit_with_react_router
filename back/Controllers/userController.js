// Controllers/userController.js
import * as UserModel from "../Models/userModel.js";

/**
 * Genera un username seguro:
 * - Si existe email, usa la parte antes del '@'
 * - Si no, genera uno a partir de nombres+apellidos (sin espacios, todo minúsculas)
 * - Añade un sufijo numérico aleatorio si hace falta (evita colisiones simples)
 */
const generateUsername = (nombres, apellidos, email) => {
  if (email && typeof email === "string" && email.includes("@")) {
    const base = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
    return `${base}_${Math.floor(Math.random() * 9000 + 1000)}`; // ej: miguel_4821
  }
  const n = (nombres || "user").toString().trim().replace(/\s+/g, "").toLowerCase();
  const a = (apellidos || "").toString().trim().replace(/\s+/g, "").toLowerCase();
  const base = (n + (a ? `.${a}` : "")).replace(/[^a-z0-9._-]/g, "");
  return `${base}_${Math.floor(Math.random() * 9000 + 1000)}`;
};

// Obtener todos
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.getAllWithPersona();
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error en getUsers:", err);
    res.status(500).json({ success: false, error: "Error al obtener usuarios" });
  }
};

// Obtener por id
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.getByIdWithPersona(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("Error en getUserById:", err);
    res.status(500).json({ success: false, error: "Error al obtener usuario" });
  }
};

// Crear usuario + persona (acepta campos en español enviados por el frontend)
export const createUser = async (req, res) => {
  try {
    // Log para depuración: muestra exactamente lo que llega
    console.log("POST /users body:", req.body);

    // Aceptamos nombres en español desde el frontend
    const {
      nombres,
      apellidos,
      birthdate = null, // opcional (si no viene, queda null)
      username: usernameIncoming,
      email,
      phone,
      role_id,
    } = req.body;

    // Validación básica
    if (!nombres || !apellidos || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: "Campos requeridos: nombres, apellidos, email, phone",
      });
    }

    // Si no llega username, lo generamos
    const username = usernameIncoming && usernameIncoming.trim()
      ? usernameIncoming.trim()
      : generateUsername(nombres, apellidos, email);

    // Llamamos al modelo (mapeando nombres->firstname, apellidos->lastname)
    const result = await UserModel.createWithPersona(
      nombres,          // firstname
      apellidos,        // lastname
      birthdate,        // birthdate (puede ser null)
      username,         // username
      email,            // email
      phone,            // phone
      role_id ?? 4      // role_id (usa 4 por defecto si no viene)
    );

    // En desarrollo devolvemos la password temporal generada para pruebas.
    // EN PRODUCCIÓN: no devuelvas la password en texto plano; envíala por correo o fuerza cambio.
    res.status(201).json({
      success: true,
      id: result.userId,
      personId: result.personId,
      password: result.password,
    });
  } catch (err) {
    console.error("Error en createUser:", err);
    // Si hay mensaje de esquema circular, devolverlo para que lo veas
    if (err.message && err.message.includes("dependencia circular")) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: "Error al registrar usuario", detail: err.message });
  }
};

// Actualizar usuario + persona (acepta nombres/apellidos en español)
export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      nombres,
      apellidos,
      birthdate = null,
      username,
      email,
      phone,
      role_id,
      state,
    } = req.body;

    // Nota: el modelo espera firstname, lastname, birthdate, username, email, phone, role_id, state
    const updated = await UserModel.updateWithPersona(
      id,
      nombres,
      apellidos,
      birthdate,
      username,
      email,
      phone,
      role_id,
      state
    );

    if (!updated) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error en updateUser:", err);
    res.status(500).json({ success: false, error: "Error al actualizar usuario" });
  }
};

// Borrado lógico
export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await UserModel.softDeleteWithPersona(id);
    if (!deleted) return res.status(404).json({ success: false, error: "Usuario no encontrado" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error en deleteUser:", err);
    res.status(500).json({ success: false, error: "Error al eliminar usuario" });
  }
};
