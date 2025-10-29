// Models/Forms/requestModel.js
import db from "../../config/DBConnect.js";
import { REQUEST_STATE } from "../../shared/constants.js";

/**
 * Crear una solicitud (request)
 * Por defecto se crea en estado OPEN (1) para que aparezca en el mapa
 */
export const create = async (conn, idUser, description, materialId, latitude = null, longitude = null, state = REQUEST_STATE.OPEN) => {
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
      `SELECT r.id, r.idUser, r.description, r.state, r.registerDate, r.materialId, 
              r.latitude, r.longitude, r.modificationDate,
              m.name as materialName
       FROM request r
       LEFT JOIN material m ON r.materialId = m.id
       ORDER BY r.registerDate DESC`
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
      `SELECT r.id, r.idUser, r.description, r.state, r.registerDate, r.materialId, 
              r.latitude, r.longitude, r.modificationDate,
              m.name as materialName
       FROM request r
       LEFT JOIN material m ON r.materialId = m.id
       WHERE r.id = ?`,
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
// Obtener solicitud por id, junto a los datos de fechas e imágenes
export const getByIdWithAdditionalInfo = async (id) => {
  try {
    console.log(`[INFO] RequestModel.getByIdWithAdditionalInfo: Fetching request ${id}`);
    
    // Primera consulta: datos básicos de la solicitud (INCLUYE idUser)
    const [requestRows] = await db.query(
      `SELECT r.id, r.idUser, m.name, r.description, s.startHour, s.endHour,
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
     LEFT JOIN schedule s ON s.requestId = r.id
     WHERE r.id = ?`,
      [id]
    );

    if (!requestRows[0]) {
      console.log(`[INFO] RequestModel.getByIdWithAdditionalInfo: Request ${id} not found`);
      return null;
    }

    const requestData = requestRows[0];
    console.log(`[INFO] RequestModel.getByIdWithAdditionalInfo: Found request data:`, requestData);

    // Segunda consulta: imágenes asociadas
    const [imageRows] = await db.query(
      `SELECT id, image, uploadedDate 
       FROM image 
       WHERE idRequest = ? 
       ORDER BY uploadedDate ASC`,
      [id]
    );

    // Agregar las imágenes al resultado
    requestData.images = imageRows || [];
    console.log(`[INFO] RequestModel.getByIdWithAdditionalInfo: Found ${imageRows.length} images for request ${id}:`, imageRows);
    
    // Debug adicional: verificar la estructura de las imágenes
    if (imageRows.length > 0) {
      console.log(`[DEBUG] First image structure:`, imageRows[0]);
    }

    return requestData;
  }
  catch (err) {
    console.error("[ERROR] RequestModel.getByIdWithAdditionalInfo:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

// Obtener requests por usuario y estado con limit
export const getRequestsByUserAndState = async (userId, state = null, limit = null) => {
  try {
    let query = `
      SELECT r.id, r.idUser, r.description, r.state, r.registerDate, r.materialId, 
             r.latitude, r.longitude, r.modificationDate,
             m.name as materialName,
             CONCAT(p.firstname, ' ', p.lastname) as userName
      FROM request r
      LEFT JOIN material m ON r.materialId = m.id
      LEFT JOIN users u ON r.idUser = u.id
      LEFT JOIN person p ON p.userId = u.id
      WHERE r.idUser = ?
    `;
    
    const params = [userId];
    
    if (state !== null) {
      query += ` AND r.state = ?`;
      params.push(state);
    }
    
    query += ` ORDER BY r.registerDate DESC`;
    
    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }
    
    const [rows] = await db.query(query, params);
    return rows;
  } catch (err) {
    console.error("[ERROR] RequestModel.getRequestsByUserAndState:", err);
    throw err;
  }
};

