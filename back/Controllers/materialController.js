// Controllers/materialController.js
import * as MaterialModel from "../Models/Forms/materialModel.js";
import db from "../Config/DBConnect.js"; // ← ESTA LÍNEA FALTABA

/**
 * Obtener todos los materiales activos
 */
export const getMaterials = async (req, res) => {
  try {
    console.log("[INFO] getMaterials controller called");
    
    const materials = await MaterialModel.getAll();
    
    console.log("[INFO] getMaterials controller - materials found:", materials.length);
    
    res.json(materials);
  } catch (error) {
    console.error("[ERROR] getMaterials controller:", {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al obtener materiales",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener material por ID
 */
export const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("[INFO] getMaterialById controller called with id:", id);
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de material inválido"
      });
    }
    
    const material = await MaterialModel.getById(parseInt(id));
    
    if (!material) {
      return res.status(404).json({
        success: false,
        error: "Material no encontrado"
      });
    }
    
    console.log("[INFO] getMaterialById controller - material found:", material.name);
    res.json(material);
    
  } catch (error) {
    console.error("[ERROR] getMaterialById controller:", {
      id: req.params.id,
      message: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al obtener material",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear un nuevo material
 */
export const createMaterial = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    console.log("[INFO] createMaterial controller called:", { name, description });
    
    // Validaciones básicas
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "El nombre del material es requerido"
      });
    }
    
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const materialId = await MaterialModel.create(
        conn,
        name.trim(),
        description?.trim() || null,
        null // modifiedBy
      );
      
      await conn.commit();
      
      console.log("[INFO] createMaterial controller - material created:", { materialId, name });
      
      res.status(201).json({
        success: true,
        id: materialId,
        message: "Material creado exitosamente"
      });
      
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error("[ERROR] createMaterial controller:", {
      body: req.body,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    
    let errorMessage = "Error al crear material";
    let statusCode = 500;
    
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = "Ya existe un material con ese nombre";
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar un material existente
 */
export const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    console.log("[INFO] updateMaterial controller called:", { id, name, description });
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de material inválido"
      });
    }
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "El nombre del material es requerido"
      });
    }
    
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const updated = await MaterialModel.update(
        conn,
        parseInt(id),
        name.trim(),
        description?.trim() || null,
        null // modifiedBy
      );
      
      if (!updated) {
        await conn.rollback();
        return res.status(404).json({
          success: false,
          error: "Material no encontrado"
        });
      }
      
      await conn.commit();
      
      console.log("[INFO] updateMaterial controller - material updated:", { id, name });
      
      res.json({
        success: true,
        message: "Material actualizado exitosamente"
      });
      
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error("[ERROR] updateMaterial controller:", {
      id: req.params.id,
      body: req.body,
      message: error.message,
      stack: error.stack,
    });
    
    let errorMessage = "Error al actualizar material";
    let statusCode = 500;
    
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = "Ya existe un material con ese nombre";
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar un material (soft delete)
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("[INFO] deleteMaterial controller called with id:", id);
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de material inválido"
      });
    }
    
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const deleted = await MaterialModel.softDelete(conn, parseInt(id));
      
      if (!deleted) {
        await conn.rollback();
        return res.status(404).json({
          success: false,
          error: "Material no encontrado"
        });
      }
      
      await conn.commit();
      
      console.log("[INFO] deleteMaterial controller - material deleted:", { id });
      
      res.json({
        success: true,
        message: "Material eliminado exitosamente"
      });
      
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error("[ERROR] deleteMaterial controller:", {
      id: req.params.id,
      message: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al eliminar material",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Inicializar materiales básicos
 */
export const initializeMaterials = async (req, res) => {
  try {
    console.log("[INFO] initializeMaterials controller called");
    
    const count = await MaterialModel.initializeMaterials();
    
    res.json({
      success: true,
      message: `Materiales inicializados. Total: ${count}`,
      count
    });
    
  } catch (error) {
    console.error("[ERROR] initializeMaterials controller:", {
      message: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al inicializar materiales",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};