// Models/userModel.js
import db from "../Config/DBConnect.js";
import * as PersonModel from "./personModel.js";
import { passwordGenerater } from "../PasswordGenerator/passGen.js";

/**
 * Obtiene metadata de columna usando INFORMATION_SCHEMA.
 * Retorna objeto con COLUMN_NAME e IS_NULLABLE o null si no existe.
 */
const getColumnInfo = async (conn, table, columnName) => {
  const [rows] = await conn.query(
    `SELECT COLUMN_NAME, IS_NULLABLE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, columnName]
  );
  return rows[0] || null;
};

/**
 * Obtener todos los usuarios (según tu lógica previa, ajusta WHERE si es necesario)
 * Nota: en tu código original usabas WHERE u.state = 0; si la lógica de estados es distinta,
 * cámbialo aquí.
 */
export const getAll = async () => {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.phone, r.name AS role, u.state
     FROM users u
     LEFT JOIN role r ON u.roleId = r.id
     WHERE u.state = 0`
  );
  return rows;
};

/**
 * Obtener usuario por id (incluye password en caso de necesitarla internamente).
 * Filtra por estado activo según tu lógica (aquí uso state != 0 como estabas usando en login).
 */
export const getById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.phone, u.password, r.name AS role, u.state
     FROM users u
     LEFT JOIN role r ON u.roleId = r.id
     WHERE u.id = ? AND u.state != 0`,
    [id]
  );
  return rows[0] || null;
};

/**
 * loginUser: busca por email (usa state != 0 como en tu código previo)
 */
export const loginUser = async (email) => {
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.phone, u.password, r.name AS role, u.state
     FROM users u
     LEFT JOIN role r ON u.roleId = r.id
     WHERE u.email = ? AND u.state != 0`,
    [email]
  );
  return rows[0] || null;
};

/**
 * Obtener todos con datos de person (JOIN)
 */
export const getAllWithPersona = async () => {
  const [rows] = await db.query(
    `SELECT u.id AS userId, u.username, u.email, u.phone, u.roleId, u.state AS userState, u.registerDate,
            p.id AS personId, p.firstname, p.lastname, p.state AS personState
     FROM users u
     LEFT JOIN person p ON p.userId = u.id
     WHERE 1`
  );
  return rows;
};

/**
 * Obtener por id con persona asociada
 */
export const getByIdWithPersona = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id AS userId, u.username, u.email, u.phone, u.roleId, u.state AS userState, u.registerDate,
            p.id AS personId, p.firstname, p.lastname, p.state AS personState
     FROM users u
     LEFT JOIN person p ON p.userId = u.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Inserta user con reintentos por duplicado en username.
 * Retorna { userId, usernameUsed }.
 */
const insertUserWithRetry = async (conn, usernameBase, password, roleId, email, phone, maxAttempts = 5) => {
  let attempt = 0;
  let lastErr = null;
  while (attempt < maxAttempts) {
    const usernameAttempt = attempt === 0 ? usernameBase : `${usernameBase}_${Math.floor(Math.random() * 9000 + 1000)}`;
    try {
      const [res] = await conn.query(
        "INSERT INTO users (username, password, roleId, state, registerDate, email, phone) VALUES (?, ?, ?, 1, NOW(), ?, ?)",
        [usernameAttempt, password, roleId, email, phone]
      );
      return { userId: res.insertId, usernameUsed: usernameAttempt };
    } catch (err) {
      if (err && err.code === "ER_DUP_ENTRY") {
        lastErr = err;
        attempt++;
        continue;
      } else {
        throw err;
      }
    }
  }
  throw lastErr || new Error("No se pudo insertar user tras varios intentos");
};

/**
 * Crear user + person respetando que person.userId es el id generado por users.
 * Parámetros:
 *  - firstname (nombres), lastname (apellidos)
 *  - usernameIncoming (opcional)
 *  - email, phone, role_id (opcional)
 *
 * Retorna { userId, personId, password, username }.
 */
export const createWithPersona = async (
  firstname,
  lastname,
  usernameIncoming,
  email,
  phone,
  roleId = 4
) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // generar contraseña temporal
    const password = passwordGenerater(12);

    // preparar username base
    let usernameBase = usernameIncoming && usernameIncoming.toString().trim();
    if (!usernameBase) {
      if (email && typeof email === "string" && email.includes("@")) {
        usernameBase = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
      } else {
        usernameBase = `${(firstname || "user").toString().trim().split(" ")[0].toLowerCase()}${(lastname || "").toString().trim().split(" ")[0].toLowerCase()}`;
        usernameBase = usernameBase.replace(/[^a-z0-9._-]/g, "") || `user${Math.floor(Math.random() * 10000)}`;
      }
    }

    // 1) Insertar user (con retry si username repetido)
    const { userId, usernameUsed } = await insertUserWithRetry(conn, usernameBase, password, roleId, email, phone);

    // 2) Insertar person usando EXACTAMENTE el userId generado
    const personId = await PersonModel.create(conn, firstname, lastname, userId);

    await conn.commit();
    return { userId, personId, password, username: usernameUsed };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Actualizar user + persona en transacción
 * Parámetros:
 *  - userId, firstname, lastname, username, email, phone, roleId, state
 */
export const updateWithPersona = async (userId, firstname, lastname, username, email, phone, roleId, state) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // verificar existencia del user
    const [uRows] = await conn.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (uRows.length === 0) {
      await conn.rollback();
      return false;
    }

    // actualizar users
    await conn.query(
      "UPDATE users SET username = ?, email = ?, phone = ?, roleId = ?, state = ? WHERE id = ?",
      [username, email, phone, roleId, state, userId]
    );

    // actualizar person si existe
    const [pRows] = await conn.query("SELECT id FROM person WHERE userId = ?", [userId]);
    if (pRows.length > 0) {
      const personId = pRows[0].id;
      await PersonModel.update(conn, personId, firstname, lastname, state ?? 1);
    }

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Soft delete: marca state = 0 en users y en person (si existe)
 */
export const softDeleteWithPersona = async (userId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [uRows] = await conn.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (uRows.length === 0) {
      await conn.rollback();
      return false;
    }

    await conn.query("UPDATE users SET state = 0 WHERE id = ?", [userId]);
    await conn.query("UPDATE person SET state = 0 WHERE userId = ?", [userId]);

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Funciones auxiliares / legacy (mantenidas para compatibilidad)
 * - softDelete(id)  <- tu versión previa usaba query() directa; aquí la adaptamos
 * - updatePasswordAndState(id, password)
 */
export const softDelete = async (id) => {
  const [res] = await db.query("UPDATE users SET state = 1 WHERE id = ?", [id]);
  return res.affectedRows > 0;
};

export const updatePasswordAndState = async (id, password) => {
  const [res] = await db.query("UPDATE users SET password = ?, state = 2 WHERE id = ?", [password, id]);
  return res.affectedRows > 0;
};
