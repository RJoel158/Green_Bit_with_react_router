// Models/Forms/materialModel.js
import db from "../../Config/DBConnect.js";

/**
 * Crear un material
 */
export const create = async (conn, name, description, modifiedBy = null) => {
  try {
    const [res] = await conn.query(
      `INSERT INTO material (name, description, modifiedBy, createdDate, state)
       VALUES (?, ?, ?, NOW(), 1)`,
      [name, description, modifiedBy]
    );
    return res.insertId;
  } catch (err) {
    console.error("[ERROR] MaterialModel.create:", {
      name,
      description,
      modifiedBy,
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
 * Obtener todos los materiales activos - compatible con tu estructura de BD
 */
export const getAll = async () => {
  try {
    console.log("[INFO] MaterialModel.getAll - fetching materials");
    
    const [rows] = await db.query(
      `SELECT id, name, 
              COALESCE(description, '') as description,
              state,
              createdDate
       FROM material
       WHERE state = 1
       ORDER BY name ASC`
    );
    
    console.log("[INFO] MaterialModel.getAll - found materials:", rows.length);
    
    // Transformar para compatibilidad con frontend
    const materials = rows.map(material => ({
      id: material.id,
      name: material.name,
      description: material.description || ''
    }));
    
    return materials;
  } catch (err) {
    console.error("[ERROR] MaterialModel.getAll:", { 
      message: err.message, 
      code: err.code,
      sqlMessage: err.sqlMessage,
      stack: err.stack 
    });
    throw err;
  }
};

/**
 * Obtener todos los materiales activos - versión completa
 */
export const getAllComplete = async () => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, createdDate, modifiedBy, modifiedDate, state
       FROM material
       WHERE state = 1
       ORDER BY name ASC`
    );
    return rows;
  } catch (err) {
    console.error("[ERROR] MaterialModel.getAllComplete:", { message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Obtener material por ID
 */
export const getById = async (id) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, description, createdDate, modifiedBy, modifiedDate, state
       FROM material
       WHERE id = ? AND state = 1`,
      [id]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[ERROR] MaterialModel.getById:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Actualizar material
 */
export const update = async (conn, id, name, description, modifiedBy = null) => {
  try {
    const [res] = await conn.query(
      `UPDATE material
       SET name = ?, description = ?, modifiedBy = ?, modifiedDate = NOW()
       WHERE id = ?`,
      [name, description, modifiedBy, id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] MaterialModel.update:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Soft delete material
 */
export const softDelete = async (conn, id) => {
  try {
    const [res] = await conn.query(
      `UPDATE material SET state = 0 WHERE id = ?`,
      [id]
    );
    return res.affectedRows > 0;
  } catch (err) {
    console.error("[ERROR] MaterialModel.softDelete:", { id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Inicializar materiales básicos si la tabla está vacía
 */
export const initializeMaterials = async () => {
  try {
    // Verificar si ya hay materiales
    const [existingMaterials] = await db.query(
      `SELECT COUNT(*) as count FROM material WHERE state = 1`
    );
    
    if (existingMaterials[0].count === 0) {
      console.log("[INFO] No materials found, initializing basic materials");
      
      const basicMaterials = [
        { name: 'Plástico PET', description: 'Botellas de plástico transparente' },
        { name: 'Cartón', description: 'Cajas de cartón corrugado' },
        { name: 'Papel', description: 'Papel de oficina, periódicos' },
        { name: 'Vidrio', description: 'Botellas y frascos de vidrio' },
        { name: 'Metal', description: 'Latas de aluminio y hierro' },
        { name: 'Plástico HDPE', description: 'Botellas de leche, detergente' },
        { name: 'Plástico PP', description: 'Tapas, envases yogurt' },
        { name: 'Tetrapack', description: 'Envases de leche, jugos' },
        { name: 'Electrónicos', description: 'Computadoras, celulares' },
        { name: 'Baterías', description: 'Pilas y baterías usadas' }
      ];
      
      for (const material of basicMaterials) {
        await db.query(
          `INSERT INTO material (name, description, state, createdDate) 
           VALUES (?, ?, 1, NOW())`,
          [material.name, material.description]
        );
      }
      
      console.log("[INFO] Basic materials initialized successfully");
      return basicMaterials.length;
    }
    
    return existingMaterials[0].count;
  } catch (err) {
    console.error("[ERROR] MaterialModel.initializeMaterials:", { 
      message: err.message, 
      stack: err.stack 
    });
    throw err;
  }
};