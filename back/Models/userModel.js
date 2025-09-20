// Models/userModel.js
import bcrypt from "bcrypt";
import db from "../Config/DBConnect.js";
import * as PersonModel from "./personModel.js";
import { passwordGenerater } from "../PasswordGenerator/passGen.js";

/**
 * Asegura que exista el roleId en la tabla role.
 */
const ensureRoleExists = async (conn, roleId) => {
  if (roleId !== undefined && roleId !== null) {
    const [r] = await conn.query("SELECT id FROM role WHERE id = ?", [roleId]);
    if (r.length === 0) {
      const err = new Error(`RoleId ${roleId} no existe`);
      err.code = "ER_ROLE_NOT_FOUND";
      throw err;
    }
    return roleId;
  }

  const [r4] = await conn.query("SELECT id FROM role WHERE id = 4");
  if (r4.length > 0) return 4;

  const [rAny] = await conn.query("SELECT id FROM role ORDER BY id LIMIT 1");
  if (rAny.length > 0) return rAny[0].id;

  const err = new Error("No existen roles en la tabla 'role'. Crea al menos un role.");
  err.code = "ER_NO_ROLES";
  throw err;
};

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

export const getByIdWithPersona = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id AS userId, u.username, u.email, u.phone, u.roleId, u.state AS userState, u.registerDate,
            p.userId AS personId, p.firstname, p.lastname, p.state AS personState
     FROM users u
     LEFT JOIN person p ON p.userId = u.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

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

export const loginUser = async (email) => {
  console.log("[INFO] loginUser model called with email:", email);
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.email, u.phone, u.password, r.name AS role, u.state
     FROM users u
     LEFT JOIN role r ON u.roleId = r.id
     WHERE u.email = ? AND u.state != 0`,
    [email]
  );
  console.log("[INFO] loginUser model result:", rows.length > 0 ? "User found" : "User not found");
  return rows[0] || null;
};

const insertUserWithRetry = async (conn, usernameBase, password, roleId, email, phone, maxAttempts = 5) => {
  let attempt = 0;
  let lastErr = null;

  roleId = await ensureRoleExists(conn, roleId);

  while (attempt < maxAttempts) {
    const usernameAttempt = attempt === 0 ? usernameBase : `${usernameBase}_${Math.floor(Math.random() * 9000 + 1000)}`;
    try {
      console.log("[INFO] insertUserWithRetry - params:", { attempt, usernameAttempt, roleId, email, phone });

      const [res] = await conn.query(
        "INSERT INTO users (username, password, roleId, state, registerDate, email, phone) VALUES (?, ?, ?, 1, NOW(), ?, ?)",
        [usernameAttempt, password, roleId, email, phone]
      );

      console.log("[INFO] insertUserWithRetry - success:", { insertId: res.insertId, usernameAttempt });
      return { userId: res.insertId, usernameUsed: usernameAttempt };
    } catch (err) {
      console.error("[ERROR] insertUserWithRetry - insert error:", {
        attempt,
        usernameAttempt,
        roleId,
        email,
        phone,
        errCode: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        sql: err.sql,
      });

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

export const  createWithPersona = async (
  firstname,
  lastname,
  usernameIncoming,
  email,
  phone,
  roleId = 3
) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] createWithPersona - start", { firstname, lastname, usernameIncoming, email, phone, roleId });

    await conn.beginTransaction();

    // ⚡ SIEMPRE generar contraseña temporal nueva
    const tempPassword = passwordGenerater(12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    console.log("[INFO] Generated password length:", tempPassword.length, "Hash starts with:", hashedPassword.substring(0, 10));

    let usernameBase = usernameIncoming && usernameIncoming.toString().trim();
    if (!usernameBase) {
      if (email && typeof email === "string" && email.includes("@")) {
        usernameBase = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
      } else {
        const n = (firstname || "user").toString().trim().split(" ")[0].toLowerCase();
        const a = (lastname || "").toString().trim().split(" ")[0].toLowerCase();
        usernameBase = `${n}${a}`.replace(/[^a-z0-9._-]/g, "") || `user${Math.floor(Math.random() * 10000)}`;
      }
    }
    console.log("[INFO] createWithPersona - usernameBase prepared:", { usernameBase });

    const { userId, usernameUsed } = await insertUserWithRetry(conn, usernameBase, hashedPassword, roleId, email, phone);

    console.log("[INFO] createWithPersona - inserting person referencing userId", { userId, firstname, lastname });
    const personId = await PersonModel.create(conn, firstname, lastname, userId);
    console.log("[INFO] createWithPersona - person created", { personId });

    await conn.commit();
    console.log("[INFO] createWithPersona - transaction committed", { userId, personId });

    return { userId, personId, password: tempPassword, username: usernameUsed };
  } catch (err) {
    console.error("[ERROR] createWithPersona - transaction error:", {
      firstname,
      lastname,
      usernameIncoming,
      email,
      phone,
      roleId,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
    });
    try {
      await conn.rollback();
      console.log("[INFO] createWithPersona - rollback executed");
    } catch (rbErr) {
      console.error("[ERROR] createWithPersona - rollback error:", { message: rbErr.message });
    }
    throw err;
  } finally {
    try {
      conn.release();
      console.log("[INFO] createWithPersona - connection released");
    } catch (relErr) {
      console.error("[ERROR] createWithPersona - release error:", { message: relErr.message });
    }
  }
};

export const createCollectorWithPersona = async (
  firstname,
  lastname,
  usernameIncoming,
  email,
  phone,
  roleId = 2, // recolector
  state = 0   // pendiente
) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Generar contraseña temporal
    const tempPassword = passwordGenerater(12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Preparar username
    let usernameBase = usernameIncoming?.toString().trim();
    if (!usernameBase && email?.includes("@")) {
      usernameBase = email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
    }

    const { userId, usernameUsed } = await insertUserWithRetry(conn, usernameBase, hashedPassword, roleId, email, phone);

    // Crear persona con state específico
    const personId = await PersonModel.create(conn, firstname, lastname, userId, state);

    await conn.commit();
    return { userId, personId, password: tempPassword, username: usernameUsed };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};





export const updateWithPersona = async (userId, firstname, lastname, username, email, phone, roleId, state) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] updateWithPersona - start", { userId, firstname, lastname, username, email, phone, roleId, state });
    await conn.beginTransaction();

    const [uRows] = await conn.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (uRows.length === 0) {
      await conn.rollback();
      console.warn("[WARN] updateWithPersona - user not found", { userId });
      return false;
    }

    await conn.query(
      "UPDATE users SET username = ?, email = ?, phone = ?, roleId = ?, state = ? WHERE id = ?",
      [username, email, phone, roleId, state, userId]
    );

    const [pRows] = await conn.query("SELECT id FROM person WHERE userId = ?", [userId]);
    if (pRows.length > 0) {
      const personId = pRows[0].id;
      await PersonModel.update(conn, personId, firstname, lastname, state ?? 1);
    }

    await conn.commit();
    console.log("[INFO] updateWithPersona - committed", { userId });
    return true;
  } catch (err) {
    console.error("[ERROR] updateWithPersona:", { userId, message: err.message, stack: err.stack });
    try { await conn.rollback(); } catch (rbErr) { console.error("[ERROR] updateWithPersona rollback:", rbErr); }
    throw err;
  } finally {
    try { conn.release(); } catch (relErr) { console.error("[ERROR] updateWithPersona release:", relErr); }
  }
};

export const softDeleteWithPersona = async (userId) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] softDeleteWithPersona - start", { userId });
    await conn.beginTransaction();

    const [uRows] = await conn.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (uRows.length === 0) {
      await conn.rollback();
      console.warn("[WARN] softDeleteWithPersona - user not found", { userId });
      return false;
    }

    await conn.query("UPDATE users SET state = 0 WHERE id = ?", [userId]);
    await conn.query("UPDATE person SET state = 0 WHERE userId = ?", [userId]);

    await conn.commit();
    console.log("[INFO] softDeleteWithPersona - committed", { userId });
    return true;
  } catch (err) {
    console.error("[ERROR] softDeleteWithPersona:", { userId, message: err.message, stack: err.stack });
    try { await conn.rollback(); } catch (rbErr) { console.error("[ERROR] softDeleteWithPersona rollback:", rbErr); }
    throw err;
  } finally {
    try { conn.release(); } catch (relErr) { console.error("[ERROR] softDeleteWithPersona release:", relErr); }
  }
};

export const softDelete = async (id) => {
  const [res] = await db.query("UPDATE users SET state = 0 WHERE id = ?", [id]);
  return res.affectedRows > 0;
};

export const updatePasswordAndState = async (id, password) => {
  const [res] = await db.query("UPDATE users SET password = ?, state = 2 WHERE id = ?", [password, id]);
  return res.affectedRows > 0;
};




// Institucion Model


/**
 * Crear user + institution con contraseña temporal.
 */
export const createWithInstitution = async (companyName, nit, username, email, phone, roleId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 🔑 Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 1️⃣ Crear usuario
    const [userRes] = await conn.query(
      `INSERT INTO users (username, email, password, phone, role_id, state)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [username, email, hashedPassword, phone, roleId || null]
    );
    const userId = userRes.insertId;

    // 2️⃣ Crear institución ligada a este userId
    const institutionId = await createInstitution(conn, companyName, nit, userId);

    await conn.commit();

    return {
      userId,
      institutionId,
      username,
      password: tempPassword, // para enviar por email
    };
  } catch (err) {
    await conn.rollback();
    console.error("[ERROR] UserModel.createWithInstitution:", {
      companyName,
      nit,
      username,
      email,
      message: err.message,
      stack: err.stack,
    });
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Actualizar user + institution.
 */
export const updateWithInstitution = async (
  id,
  companyName,
  nit,
  username,
  email,
  phone,
  roleId,
  state
) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣ Actualizar usuario
    const [userRes] = await conn.query(
      `UPDATE users
       SET username = ?, email = ?, phone = ?, role_id = ?, state = ?
       WHERE id = ?`,
      [username, email, phone, roleId || null, state, id]
    );

    // 2️⃣ Actualizar institución ligada
    const [instRes] = await conn.query(
      `UPDATE institution
       SET companyName = ?, nit = ?
       WHERE userId = ? AND state != 0`,
      [companyName, nit, id]
    );

    await conn.commit();
    return userRes.affectedRows > 0 || instRes.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    console.error("[ERROR] UserModel.updateWithInstitution:", {
      id,
      message: err.message,
      stack: err.stack,
    });
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Soft delete (user + institution).
 */
export const softDeleteWithInstitution = async (id) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [userRes] = await conn.query(`UPDATE users SET state = 0 WHERE id = ?`, [id]);
    const [instRes] = await conn.query(`UPDATE institution SET state = 0 WHERE userId = ?`, [id]);

    await conn.commit();
    return userRes.affectedRows > 0 || instRes.affectedRows > 0;
  } catch (err) {
    await conn.rollback();
    console.error("[ERROR] UserModel.softDeleteWithInstitution:", {
      id,
      message: err.message,
      stack: err.stack,
    });
    throw err;
  } finally {
    conn.release();
  }
};