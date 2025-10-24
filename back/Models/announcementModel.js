// Models/announcementModel.js
import db from "../Config/DBConnect.js";

/**
 * Obtener todos los anuncios activos
 */
export const getAll = async () => {
  try {
    console.log("[INFO] AnnouncementModel.getAll - fetching announcements");
    
    const [rows] = await db.query(
      `SELECT 
        a.id, 
        a.title, 
        a.imagePath, 
        a.targetRole, 
        a.state,
        a.createdDate,
        a.createdBy
       FROM announcement a
       ORDER BY a.createdDate DESC`
    );
    
    console.log("[INFO] AnnouncementModel.getAll - found announcements:", rows.length);
    return rows;
  } catch (err) {
    console.error("[ERROR] AnnouncementModel.getAll:", { 
      message: err.message, 
      code: err.code,
      sqlMessage: err.sqlMessage,
      stack: err.stack 
    });
    throw err;
  }
};

/**
 * Obtener anuncio por ID
 */
export const getById = async (id) => {
  try {
    console.log("[INFO] AnnouncementModel.getById - fetching announcement:", id);
    
    const [rows] = await db.query(
      `SELECT 
        a.id, 
        a.title, 
        a.imagePath, 
        a.targetRole, 
        a.state,
        a.createdDate,
        a.createdBy
       FROM announcement a
       WHERE a.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      console.warn("[WARN] AnnouncementModel.getById - announcement not found:", id);
      return null;
    }
    
    console.log("[INFO] AnnouncementModel.getById - announcement found:", rows[0].title);
    return rows[0];
  } catch (err) {
    console.error("[ERROR] AnnouncementModel.getById:", { 
      id, 
      message: err.message, 
      stack: err.stack 
    });
    throw err;
  }
};

/**
 * Crear anuncio
 */
export const create = async (conn, title, imagePath, targetRole, createdBy) => {
  try {
    console.log("[INFO] AnnouncementModel.create:", { title, imagePath, targetRole, createdBy });
    
    // Validar que createdBy existe
    const [userCheck] = await conn.query(
      `SELECT id FROM users WHERE id = ?`,
      [createdBy]
    );
    
    if (userCheck.length === 0) {
      throw new Error(`Usuario con ID ${createdBy} no existe`);
    }
    
    const [res] = await conn.query(
      `INSERT INTO announcement (title, imagePath, targetRole, state, createdBy, createdDate)
       VALUES (?, ?, ?, 1, ?, NOW())`,
      [title, imagePath, targetRole, createdBy]
    );
    
    console.log("[INFO] AnnouncementModel.create - announcement created:", res.insertId);
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] AnnouncementModel.create:", {
      title,
      imagePath,
      targetRole,
      createdBy,
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
 * Actualizar anuncio
 */
export const update = async (conn, id, title, imagePath, targetRole, state) => {
  try {
    console.log("[INFO] AnnouncementModel.update:", { id, title, targetRole, state });
    
    const [res] = await conn.query(
      `UPDATE announcement 
       SET title = ?, imagePath = ?, targetRole = ?, state = ?
       WHERE id = ?`,
      [title, imagePath, targetRole, state, id]
    );
    
    if (res.affectedRows === 0) {
      console.warn("[WARN] AnnouncementModel.update - announcement not found:", id);
      return false;
    }
    
    console.log("[INFO] AnnouncementModel.update - announcement updated:", id);
    return true;
  } catch (err) {
    console.error("[ERROR] AnnouncementModel.update:", { 
      id, 
      message: err.message, 
      stack: err.stack 
    });
    throw err;
  }
};

/**
 * Soft delete anuncio
 */
export const softDelete = async (conn, id) => {
  try {
    console.log("[INFO] AnnouncementModel.softDelete:", id);
    
    const [res] = await conn.query(
      `UPDATE announcement SET state = 0 WHERE id = ?`,
      [id]
    );
    
    if (res.affectedRows === 0) {
      console.warn("[WARN] AnnouncementModel.softDelete - announcement not found:", id);
      return false;
    }
    
    console.log("[INFO] AnnouncementModel.softDelete - announcement deleted:", id);
    return true;
  } catch (err) {
    console.error("[ERROR] AnnouncementModel.softDelete:", { 
      id, 
      message: err.message, 
      stack: err.stack 
    });
    throw err;
  }
};

/**
 * Obtener anuncios por rol
 */
export const getByRole = async (targetRole) => {
  try {
    console.log("[INFO] AnnouncementModel.getByRole - fetching announcements for role:", targetRole);
    
    const [rows] = await db.query(
      `SELECT 
        a.id, 
        a.title, 
        a.imagePath, 
        a.targetRole, 
        a.state,
        a.createdDate,
        a.createdBy
       FROM announcement a
       WHERE (a.targetRole = ? OR a.targetRole = 'both') AND a.state = 1
       ORDER BY a.createdDate DESC`,
      [targetRole]
    );
    
    console.log("[INFO] AnnouncementModel.getByRole - found announcements:", rows.length);
    return rows;
  } catch (err) {
    console.error("[ERROR] AnnouncementModel.getByRole:", { 
      targetRole,
      message: err.message, 
      stack: err.stack 
    });
    throw err;
  }
};
