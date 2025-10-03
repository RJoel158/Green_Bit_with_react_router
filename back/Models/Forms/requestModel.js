// Models/Forms/requestModel.js
import db from "../../Config/DBConnect.js";

/**
 * Crear una solicitud (request)
 */
export const create = async (conn, idUser, description, materialId, latitude = null, longitude = null, state = 'open') => {
  try {
    const [res] = await conn.query(
      `INSERT INTO request (idUser, description, state, registerDate, materialId, latitude, longitude, modificationDate)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, NOW())`,
      [idUser, description, state, materialId, latitude, longitude]
    );
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] RequestModel.create:", {
      idUser,
      description,
      materialId,
      latitude,
      longitude,
      state,
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
 * Obtener todas las solicitudes (requests)
 */
export const getAll = async () => {
  try {
    console.log("[INFO] RequestModel.getAll - fetching requests");
    const [rows] = await db.query(
      `SELECT id, idUser, description, state, registerDate, materialId, latitude, longitude, modificationDate
       FROM request
       ORDER BY registerDate DESC`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] RequestModel.getAll:", {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
      stack: err.stack
    });
    throw err;
  }
};

// No se requiere getAllComplete para request, ya que getAll ya devuelve todos los campos relevantes

/**
 * Obtener solicitud por ID
 */
export const getById = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT id, idUser, description, state, registerDate, materialId, latitude, longitude, modificationDate
       FROM request
       WHERE id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] RequestModel.getById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Actualizar estado de solicitud
 */
export const updateState = async (conn, id, state) => {
  try {
    const [res] = await conn.query(
      `UPDATE request
       SET state = ?, modificationDate = NOW()
       WHERE id = ?`,
      [state, id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] RequestModel.updateState:", { id, state, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Soft delete solicitud (cambia el estado a 'deleted')
 */
export const softDelete = async (conn, id) => {
  try {
    const [res] = await conn.query(
      `UPDATE request SET state = 'deleted', modificationDate = NOW() WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] RequestModel.softDelete:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

// No se requiere inicialización básica para requests
/**
 * Obtener solicitudes por usuario
 */
export const getByUserId = async (userId) => {
  try {
    const [rows] = await db.query(
      `SELECT id, idUser, description, state, registerDate, materialId, latitude, longitude, modificationDate
       FROM request
       WHERE idUser = ?
       ORDER BY registerDate DESC`,
      [userId]
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] RequestModel.getByUserId:", { userId, message: err.message, stack: err.stack });
    throw err;
  }
};
// Obtener solicitud por id, junto a los datos de fechas
export const getByIdWithAdditionalInfo = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id, m.name ,r.description,s.startHour, s.endHour,
           JSON_OBJECT(
        'Monday', s.monday,
        'Tuesday', s.tuesday,
        'Wednesday', s.wednesday,
        'Thursday', s.thursday,
        'Friday', s.friday,
        'Saturday', s.saturday,
        'Sunday', s.sunday
    ) AS daysAvailability
     FROM request r
     JOIN material m ON m.id = r.materialId
     LEFT JOIN schedule s ON s.requestId=r.id
     WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  }
  catch (err) {
    console.error("[ERROR] RequestModel.getByIdWithAdditionalInfo:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

