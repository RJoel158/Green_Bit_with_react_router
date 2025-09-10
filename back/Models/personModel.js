// Models/personModel.js
import db from "../Config/DBConnect.js";

/**
 * Crear una persona ligada a un usuario (userId).
 */
export const create = async (conn, firstname, lastname, userId) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO person (firstname, lastname, userId)
       VALUES (?, ?, ?)`,
      [firstname, lastname, userId]
    );
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] PersonModel.create:", {
      firstname,
      lastname,
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

export const getAll = async () => {
  try {
    const [rows] = await db.query(
      `SELECT id, firstname, lastname, birthdate, userId, state
       FROM person
       WHERE state != 0`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] PersonModel.getAll:", { message: err.message, stack: err.stack });
    throw err;
  }
};

export const getById = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT id, firstname, lastname, birthdate, userId, state
       FROM person
       WHERE id = ? AND state != 0`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] PersonModel.getById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

export const update = async (conn, id, firstname, lastname, state = 1, birthdate = null) => {
  try {
    const [res] = await conn.query(
      `UPDATE person
       SET firstname = ?, lastname = ?, birthdate = ?, state = ?
       WHERE id = ?`,
      [firstname, lastname, birthdate, state, id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] PersonModel.update:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

export const softDelete = async (conn, id) => {
  try {
    const [res] = await conn.query(
      `UPDATE person SET state = 0 WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] PersonModel.softDelete:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};
