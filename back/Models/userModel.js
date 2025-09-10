// Models/userModel.js
import db from "../Config/DBConnect.js";
import * as PersonModel from "./personModel.js";
import { passwordGenerater } from "../PasswordGenerator/passGen.js";

/**
 * Obtiene metadata de columna usando INFORMATION_SCHEMA (más fiable).
 * Retorna row { COLUMN_NAME, IS_NULLABLE } o null si no existe.
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

export const getAllWithPersona = async () => {
  const [rows] = await db.query(
    `SELECT u.*, p.firstname, p.lastname, p.birthdate
     FROM users u
     LEFT JOIN person p ON (u.users_id1 IS NOT NULL AND u.users_id1 = p.id) OR (p.users_id IS NOT NULL AND p.users_id = u.id)
     WHERE 1`
  );
  return rows;
};

export const getByIdWithPersona = async (id) => {
  const [rows] = await db.query(
    `SELECT u.*, p.firstname, p.lastname, p.birthdate
     FROM users u
     LEFT JOIN person p ON (u.users_id1 IS NOT NULL AND u.users_id1 = p.id) OR (p.users_id IS NOT NULL AND p.users_id = u.id)
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Crear user + person respetando FKs y su nullability.
 * Parámetros: firstname, lastname, birthdate, username, email, phone, role_id
 * Retorna: { userId, personId, password }
 */
export const createWithPersona = async (
  firstname,
  lastname,
  birthdate = null,
  username,
  email,
  phone,
  role_id = 3
) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // metadata columnas
    const usersUsersId1Info = await getColumnInfo(conn, "users", "users_id1"); // puede ser null
    const personUsersIdInfo = await getColumnInfo(conn, "person", "users_id"); // puede ser null

    const usersUsersId1NotNull = usersUsersId1Info ? usersUsersId1Info.IS_NULLABLE === "NO" : false;
    const personUsersIdNotNull = personUsersIdInfo ? personUsersIdInfo.IS_NULLABLE === "NO" : false;

    // Si ambas NOT NULL -> esquema circular, no lo resolvemos automáticamente
    if (usersUsersId1NotNull && personUsersIdNotNull) {
      await conn.rollback();
      throw new Error(
        "Esquema con dependencia circular: tanto person.users_id como users.users_id1 son NOT NULL. " +
        "Debes modificar la estructura para permitir NULL en una de las columnas."
      );
    }

    const password = passwordGenerater(12);
    let personId = null;
    let userId = null;

    // Si person.users_id es NOT NULL: crear primero user, luego person con users_id
    if (personUsersIdNotNull) {
      // Crear user (sin referencia a person)
      const [userRes] = await conn.query(
        "INSERT INTO users (username, password, role_id, state, registerDate, email, phone) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
        [username, password, role_id, 1, email, phone]
      );
      userId = userRes.insertId;

      // Crear person incluyendo users_id (requerido)
      personId = await PersonModel.create(conn, firstname, lastname, birthdate, userId);

    } else {
      // Por defecto: crear person primero (sin users_id), luego user (incluye users_id1 si existe) y actualizar person si es necesario
      personId = await PersonModel.create(conn, firstname, lastname, birthdate, null);

      if (usersUsersId1Info) {
        // Si existe users.users_id1 (aunque sea nullable), incluir personId en el insert
        const [uRes] = await conn.query(
          "INSERT INTO users (username, password, role_id, state, registerDate, email, phone, users_id1) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)",
          [username, password, role_id, 1, email, phone, personId]
        );
        userId = uRes.insertId;
      } else {
        const [uRes] = await conn.query(
          "INSERT INTO users (username, password, role_id, state, registerDate, email, phone) VALUES (?, ?, ?, ?, NOW(), ?, ?)",
          [username, password, role_id, 1, email, phone]
        );
        userId = uRes.insertId;
      }

      // Si person tiene columna users_id (nullable), actualizarla con userId
      if (personUsersIdInfo) {
        await conn.query("UPDATE person SET users_id = ? WHERE id = ?", [userId, personId]);
      }
    }

    await conn.commit();
    return { userId, personId, password };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const updateWithPersona = async (
  userId,
  firstname,
  lastname,
  birthdate = null,
  username,
  email,
  phone,
  role_id,
  state
) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT u.id as userId, COALESCE(u.users_id1, p.id) as personId
       FROM users u
       LEFT JOIN person p ON (u.users_id1 IS NOT NULL AND u.users_id1 = p.id) OR (p.users_id IS NOT NULL AND p.users_id = u.id)
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return false;
    }

    const personId = rows[0].personId;
    if (personId) {
      await PersonModel.update(conn, personId, firstname, lastname, birthdate);
    }

    await conn.query(
      "UPDATE users SET username = ?, email = ?, phone = ?, role_id = ?, state = ? WHERE id = ?",
      [username, email, phone, role_id, state, userId]
    );

    await conn.commit();
    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const softDeleteWithPersona = async (userId) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT u.id as userId, COALESCE(u.users_id1, p.id) as personId
       FROM users u
       LEFT JOIN person p ON (u.users_id1 IS NOT NULL AND u.users_id1 = p.id) OR (p.users_id IS NOT NULL AND p.users_id = u.id)
       WHERE u.id = ?`,
      [userId]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return false;
    }

    const personId = rows[0].personId;

    await conn.query("UPDATE users SET state = 0 WHERE id = ?", [userId]);

    // si existe deleted_at en person, marcarla
    const personDeletedAtInfo = await getColumnInfo(conn, "person", "deleted_at");
    if (personDeletedAtInfo && personId) {
      await PersonModel.softDelete(conn, personId);
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
