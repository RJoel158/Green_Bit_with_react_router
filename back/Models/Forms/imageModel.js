// Models/Forms/imageModel.js
import db from "../../config/DBConnect.js";

/**
 * Crear una imagen asociada a una solicitud
 */
export const create = async (conn, idRequest, imagePath) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO image (idRequest, image, uploadedDate)
       VALUES (?, ?, NOW())`,
      [idRequest, imagePath]
    );
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] ImageModel.create:", {
      idRequest,
      imagePath,
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
 * Crear múltiples imágenes en una transacción
 */
export const createMultiple = async (conn, idRequest, imagePaths) => {
  try {
    const promises = imagePaths.map(imagePath => 
      conn.query(
        `INSERT INTO image (idRequest, image, uploadedDate) VALUES (?, ?, NOW())`,
        [idRequest, imagePath]
      )
    );
    
    const results = await Promise.all(promises);
    return results.map(([result]) => result.insertId);
  } catch (err) {
    console.error("[ERROR] ImageModel.createMultiple:", {
      idRequest,
      imagePaths,
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
 * Obtener todas las imágenes
 */
export const getAll = async () => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.idRequest, i.image, i.uploadedDate,
              r.description as request_description,
              u.username as user_name
       FROM image i
       LEFT JOIN request r ON i.idRequest = r.id
       LEFT JOIN users u ON r.idUser = u.id
       ORDER BY i.uploadedDate DESC`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] ImageModel.getAll:", { message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener imágenes por ID de solicitud
 */
export const getByRequestId = async (idRequest) => {
  try {
    const [rows] = await db.query(
      `SELECT id, idRequest, image, uploadedDate
       FROM image
       WHERE idRequest = ?
       ORDER BY uploadedDate ASC`,
      [idRequest]
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] ImageModel.getByRequestId:", { idRequest, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener imagen por ID
 */
export const getById = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT i.id, i.idRequest, i.image, i.uploadedDate,
              r.description as request_description,
              u.username as user_name
       FROM image i
       LEFT JOIN request r ON i.idRequest = r.id
       LEFT JOIN users u ON r.idUser = u.id
       WHERE i.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] ImageModel.getById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Actualizar ruta de imagen
 */
export const update = async (conn, id, imagePath) => {
  try {
    const [res] = await conn.query(
      `UPDATE image
       SET image = ?
       WHERE id = ?`,
      [imagePath, id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] ImageModel.update:", { id, imagePath, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Eliminar imagen por ID
 */
export const deleteById = async (conn, id) => {
  try {
    const [res] = await conn.query(
      `DELETE FROM image WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] ImageModel.deleteById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Eliminar todas las imágenes de una solicitud
 */
export const deleteByRequestId = async (conn, idRequest) => {
  try {
    const [res] = await conn.query(
      `DELETE FROM image WHERE idRequest = ?`,
      [idRequest]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] ImageModel.deleteByRequestId:", { idRequest, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Contar imágenes por solicitud
 */
export const countByRequestId = async (idRequest) => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) as total
       FROM image
       WHERE idRequest = ?`,
      [idRequest]
    );
    return rows[0].total;
  } catch (err) {
    console.error("[ERROR] ImageModel.countByRequestId:", { idRequest, message: err.message, stack: err.stack });
    throw err;
  }
};