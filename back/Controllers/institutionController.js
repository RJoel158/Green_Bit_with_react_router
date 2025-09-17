// Controllers/institutionController.js
import * as InstitutionModel from "../Models/institutionModel.js";
import db from "../Config/DBConnect.js";

/**
 * Obtener todas las instituciones
 */
export const getInstitutions = async (req, res) => {
  try {
    const institutions = await InstitutionModel.getAll();
    res.json({ success: true, institutions });
  } catch (err) {
    console.error("[ERROR] getInstitutions:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, error: "Error al obtener instituciones" });
  }
};

/**
 * Obtener institución por ID
 */
export const getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await InstitutionModel.getById(id);

    if (!institution) {
      return res
        .status(404)
        .json({ success: false, error: "Institución no encontrada" });
    }

    res.json({ success: true, institution });
  } catch (err) {
    console.error("[ERROR] getInstitutionById:", {
      id: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, error: "Error al obtener institución" });
  }
};

/**
 * Crear institución (requiere userId existente)
 */
export const createInstitution = async (req, res) => {
  try {
    const { companyName, nit, userId } = req.body;

    if (!companyName || !userId) {
      return res
        .status(400)
        .json({ success: false, error: "companyName y userId son requeridos" });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const institutionId = await InstitutionModel.create(
        conn,
        companyName,
        nit || null,
        userId
      );
      await conn.commit();
      res.status(201).json({ success: true, id: institutionId, message: "Institución creada con éxito" });
    } catch (err) {
      await conn.rollback();
      console.error("[ERROR] createInstitution - model error:", { body: req.body, message: err.message, stack: err.stack });
      res.status(500).json({ success: false, error: "Error al crear institución", detail: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[ERROR] createInstitution outer:", {
      body: req.body,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    res.status(500).json({ success: false, error: "Error al crear institución" });
  }
};

/**
 * Actualizar institución
 */
export const updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, nit, state } = req.body;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const updated = await InstitutionModel.update(
        conn,
        id,
        companyName,
        nit,
        state ?? 1
      );
      await conn.commit();
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "Institución no encontrada o sin cambios" });
      }
      res.json({ success: true, message: "Institución actualizada con éxito" });
    } catch (err) {
      await conn.rollback();
      console.error("[ERROR] updateInstitution:", { id: req.params.id, body: req.body, message: err.message, stack: err.stack });
      res.status(500).json({ success: false, error: "Error al actualizar institución", detail: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[ERROR] updateInstitution outer:", { id: req.params.id, body: req.body, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al actualizar institución" });
  }
};

/**
 * Borrado lógico de institución
 */
export const deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const deleted = await InstitutionModel.softDelete(conn, id);
      await conn.commit();
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: "Institución no encontrada" });
      }
      res.json({ success: true, message: "Institución eliminada con éxito" });
    } catch (err) {
      await conn.rollback();
      console.error("[ERROR] deleteInstitution:", { id: req.params.id, message: err.message, stack: err.stack });
      res.status(500).json({ success: false, error: "Error al eliminar institución", detail: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[ERROR] deleteInstitution outer:", { id: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al eliminar institución" });
  }
};
