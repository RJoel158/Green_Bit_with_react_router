// Models/Forms/scheduleModel.js
import db from "../../Config/DBConnect.js";

/**
 * Crear un horario para una solicitud
 */
export const create = async (conn, start_hour, end_hour, monday, tuesday, wednesday, thursday, friday, saturday, sunday, request_id) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO schedule (startHour, endHour, monday, tuesday, wednesday, thursday, friday, saturday, sunday, requestId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [start_hour, end_hour, monday, tuesday, wednesday, thursday, friday, saturday, sunday, request_id]
    );
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.create:", {
      start_hour,
      end_hour,
      request_id,
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
 * Obtener todos los horarios
 */
export const getAll = async () => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.startHour, s.endHour, s.monday, s.tuesday, s.wednesday, 
              s.thursday, s.friday, s.saturday, s.sunday, s.requestId,
              r.description as request_description,
              u.username as user_name
       FROM schedule s
       LEFT JOIN request r ON s.request_id = r.id
       LEFT JOIN users u ON r.idUser = u.id
       ORDER BY s.id DESC`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.getAll:", { message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener horario por ID de solicitud
 */
export const getByRequestId = async (request_id) => {
  try {
    const [rows] = await db.query(
      `SELECT id, startHour, endHour, monday, tuesday, wednesday, 
              thursday, friday, saturday, sunday, requestId
       FROM schedule
       WHERE request_id = ?`,
      [request_id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.getByRequestId:", { request_id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener horario por ID
 */
export const getById = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT s.id, s.startHour, s.endHour, s.monday, s.tuesday, s.wednesday, 
              s.thursday, s.friday, s.saturday, s.sunday, s.requestId,
              r.description as request_description,
              u.username as user_name
       FROM schedule s
       LEFT JOIN request r ON s.request_id = r.id
       LEFT JOIN users u ON r.idUser = u.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.getById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Actualizar horario
 */
export const update = async (conn, id, start_hour, end_hour, monday, tuesday, wednesday, thursday, friday, saturday, sunday) => {
  try {
    const [res] = await conn.query(
      `UPDATE schedule
       SET startHour = ?, endHour = ?, monday = ?, tuesday = ?, wednesday = ?, 
           thursday = ?, friday = ?, saturday = ?, sunday = ?
       WHERE id = ?`,
      [start_hour, end_hour, monday, tuesday, wednesday, thursday, friday, saturday, sunday, id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.update:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Eliminar horario por ID de solicitud
 */
export const deleteByRequestId = async (conn, request_id) => {
  try {
    const [res] = await conn.query(
      `DELETE FROM schedule WHERE requestId = ?`,
      [request_id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.deleteByRequestId:", { request_id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Eliminar horario por ID
 */
export const deleteById = async (conn, id) => {
  try {
    const [res] = await conn.query(
      `DELETE FROM schedule WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.deleteById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener horarios disponibles por día de la semana
 */
export const getByDay = async (dayColumn) => {
  try {
    // dayColumn debe ser uno de: monday, tuesday, wednesday, thursday, friday, saturday, sunday
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    if (!validDays.includes(dayColumn)) {
      throw new Error('Día inválido');
    }

    const [rows] = await db.query(
      `SELECT s.id, s.startHour, s.endHour, s.requestId,
              r.description as request_description,
              u.username as user_name
       FROM schedule s
       LEFT JOIN request r ON s.request_id = r.id
       LEFT JOIN users u ON r.idUser = u.id
       WHERE s.${dayColumn} = 1
       ORDER BY s.start_hour ASC`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] ScheduleModel.getByDay:", { dayColumn, message: err.message, stack: err.stack });
    throw err;
  }
};