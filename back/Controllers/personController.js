// Controllers/personController.js
import * as PersonModel from "../Models/personModel.js";
import db from "../config/DBConnect.js";

/**
 * Obtener todas las personas
 */
export const getPersons = async (req, res) => {
  try {
    const persons = await PersonModel.getAll();
    res.json({ success: true, persons });
  } catch (err) {
    console.error("[ERROR] getPersons:", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, error: "Error al obtener personas" });
  }
};

/**
 * Obtener persona por ID
 */
export const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await PersonModel.getById(id);

    if (!person) {
      return res
        .status(404)
        .json({ success: false, error: "Persona no encontrada" });
    }

    res.json({ success: true, person });
  } catch (err) {
    console.error("[ERROR] getPersonById:", {
      id: req.params.id,
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({ success: false, error: "Error al obtener persona" });
  }
};

/**
 * Crear persona (requiere userId existente)
 */
export const createPerson = async (req, res) => {
  try {
    const { firstname, lastname, birthdate, userId } = req.body;

    if (!firstname || !lastname || !userId) {
      return res
        .status(400)
        .json({ success: false, error: "Firstname, lastname y userId son requeridos" });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const personId = await PersonModel.create(conn, firstname, lastname, userId, birthdate || null);
      await conn.commit();
      res.status(201).json({ success: true, id: personId, message: "Persona creada con éxito" });
    } catch (err) {
      await conn.rollback();
      console.error("[ERROR] createPerson - model error:", { body: req.body, message: err.message, stack: err.stack });
      res.status(500).json({ success: false, error: "Error al crear persona", detail: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[ERROR] createPerson:", {
      body: req.body,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    res.status(500).json({ success: false, error: "Error al crear persona" });
  }
};

/**
 * Actualizar persona
 */
export const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, birthdate, state } = req.body;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const updated = await PersonModel.update(conn, id, firstname, lastname, state ?? 1, birthdate || null);
      await conn.commit();
      if (!updated) {
        return res
          .status(404)
          .json({ success: false, error: "Persona no encontrada o sin cambios" });
      }
      res.json({ success: true, message: "Persona actualizada con éxito" });
    } catch (err) {
      await conn.rollback();
      console.error("[ERROR] updatePerson:", { id: req.params.id, body: req.body, message: err.message, stack: err.stack });
      res.status(500).json({ success: false, error: "Error al actualizar persona", detail: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[ERROR] updatePerson outer:", { id: req.params.id, body: req.body, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al actualizar persona" });
  }
};

/**
 * Borrado lógico de persona
 */
export const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const deleted = await PersonModel.softDelete(conn, id);
      await conn.commit();
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, error: "Persona no encontrada" });
      }
      res.json({ success: true, message: "Persona eliminada con éxito" });
    } catch (err) {
      await conn.rollback();
      console.error("[ERROR] deletePerson:", { id: req.params.id, message: err.message, stack: err.stack });
      res.status(500).json({ success: false, error: "Error al eliminar persona", detail: err.message });
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("[ERROR] deletePerson outer:", { id: req.params.id, message: err.message, stack: err.stack });
    res.status(500).json({ success: false, error: "Error al eliminar persona" });
  }
};
