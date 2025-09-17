// Models/institutionModel.js
import db from "../Config/DBConnect.js";

/**
 * Crear una institución ligada a un usuario (userId).
 */
export const create = async (conn, companyName, nit, userId) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO institution (companyName, nit, userId)
       VALUES (?, ?, ?)`,
      [companyName, nit, userId]
    );
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] InstitutionModel.create:", {
      companyName,
      nit,
      userId,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    throw err;
  }
};

/**
 * Obtener todas las instituciones activas (state != 0).
 */
export const getAll = async () => {
  try {
    const [rows] = await db.query(
      `SELECT id, companyName, nit, userId, state
       FROM institution
       WHERE state != 0`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] InstitutionModel.getAll:", { message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener institución por ID.
 */
export const getById = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT id, companyName, nit, userId, state
       FROM institution
       WHERE id = ? AND state != 0`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] InstitutionModel.getById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Actualizar institución (nombre, nit, state).
 */
export const update = async (conn, id, companyName, nit, state = 1) => {
  try {
    const [res] = await conn.query(
      `UPDATE institution
       SET companyName = ?, nit = ?, state = ?
       WHERE id = ?`,
      [companyName, nit, state, id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] InstitutionModel.update:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Borrado lógico (state = 0).
 */
export const softDelete = async (conn, id) => {
  try {
    const [res] = await conn.query(
      `UPDATE institution SET state = 0 WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] InstitutionModel.softDelete:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};
