// Models/appointmentModel.js
import db from "../Config/DBConnect.js";
import * as RequestModel from "./Forms/requestModel.js";
import { REQUEST_STATE, APPOINTMENT_STATE } from "../shared/constants.js";

export const create = async (conn, userId, institutionId, date, description) => {
  const [result] = await conn.execute(
    `INSERT INTO appointments (user_id, institution_id, date, description, status)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, institutionId, date, description, "pending"]
  );
  return result.insertId;
};

export const getAll = async () => {
  const [rows] = await db.query(`
    SELECT a.id, a.date, a.description, a.status,
           u.username AS collector,
           i.name AS institution
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN institutions i ON a.institution_id = i.id
  `);
  return rows;
};

export const updateStatus = async (id, status) => {
  await db.query(`UPDATE appointments SET status = ? WHERE id = ?`, [status, id]);
  return true;
};

//Verificacion del estado del request, creación de appointment 
// en la tabla appointmentconfirmation y cambio de estado de request a REQUESTED (0)
export const createAppointment = async (idRequest, acceptedDate, collectorId, acceptedHour) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] createAppointment - start", { idRequest, acceptedDate, collectorId, acceptedHour });

    await conn.beginTransaction();

    // Verificar que el estado de request sea OPEN (1)
    const [requestRows] = await conn.query(
      `SELECT id, state FROM request WHERE id = ?`,
      [idRequest]
    );

    if (!requestRows[0]) {
      throw new Error(`Request with id ${idRequest} not found`);
    }

    if (requestRows[0].state !== REQUEST_STATE.OPEN) {
      throw new Error(`Request ${idRequest} is not in OPEN state. Current state: ${requestRows[0].state}`);
    }

    console.log("[INFO] createAppointment - request verified as OPEN state", { idRequest });

    // Crear el appointment en estado PENDING (0)
    const [result] = await conn.execute(
      `INSERT INTO appointmentconfirmation (idRequest, acceptedDate, collectorId, acceptedHour, state)
       VALUES (?, ?, ?, ?, ?)`,
      [idRequest, acceptedDate, collectorId, acceptedHour, APPOINTMENT_STATE.PENDING]
    );

    const appointmentId = result.insertId;
    console.log("[INFO] createAppointment - appointment created with PENDING state", { appointmentId });

    // Actualizar el estado del request a REQUESTED (0) - temporalmente bloqueado
    const updated = await RequestModel.updateState(conn, idRequest, REQUEST_STATE.REQUESTED);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${idRequest}`);
    }

    console.log("[INFO] createAppointment - request state updated to REQUESTED", { idRequest });

    await conn.commit();
    console.log("[INFO] createAppointment - transaction committed", { appointmentId, idRequest });

    return appointmentId;

  } catch (err) {
    console.error("[ERROR] createAppointment - transaction error:", {
      idRequest,
      acceptedDate,
      collectorId,
      acceptedHour,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    
    try {
      await conn.rollback();
      console.log("[INFO] createAppointment - rollback executed");
    } catch (rbErr) {
      console.error("[ERROR] createAppointment - rollback error:", { message: rbErr.message });
    }
    
    throw err;
  } finally {
    try { 
      conn.release(); 
    } catch (releaseErr) {
      console.error("[ERROR] createAppointment - connection release error:", { message: releaseErr.message });
    }
  }
};

// Obtener appointmentconfirmation por estado y usuario (collector)
export const getAppointmentsByCollectorAndState = async (collectorId, state = null, limit = null) => {
  try {
    let query = `
      SELECT ac.id, ac.idRequest, ac.acceptedDate, ac.collectorId, ac.acceptedHour, ac.state,
             r.description, r.materialId, r.idUser as recyclerId,
             COALESCE(CONCAT(p.firstname, ' ', p.lastname), u.email) as recyclerName,
             u.phone as recyclerPhone,
             u.email as recyclerEmail,
             m.name as materialName
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN users u ON r.idUser = u.id
      LEFT JOIN person p ON p.userId = u.id
      LEFT JOIN material m ON r.materialId = m.id
      WHERE ac.collectorId = ?
    `;
    
    const params = [collectorId];
    
    if (state !== null) {
      query += ` AND ac.state = ?`;
      params.push(state);
    }
    
    query += ` ORDER BY ac.acceptedDate DESC`;
    
    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }
    
    const [rows] = await db.query(query, params);
    
    // Log para debugging
    console.log("[DEBUG] getAppointmentsByCollectorAndState - Rows returned:", rows.length);
    if (rows.length > 0) {
      console.log("[DEBUG] First row sample:", {
        id: rows[0].id,
        recyclerName: rows[0].recyclerName,
        recyclerPhone: rows[0].recyclerPhone,
        recyclerEmail: rows[0].recyclerEmail
      });
    }
    
    return rows;
  } catch (err) {
    console.error("[ERROR] AppointmentModel.getAppointmentsByCollectorAndState:", err);
    throw err;
  }
};

// Obtener appointmentconfirmation por estado y usuario (recycler - quien hizo la request)
export const getAppointmentsByRecyclerAndState = async (recyclerId, state = null, limit = null) => {
  try {
    let query = `
      SELECT ac.id, ac.idRequest, ac.acceptedDate, ac.collectorId, ac.acceptedHour, ac.state,
             r.description, r.materialId, r.idUser as recyclerId,
             COALESCE(CONCAT(p.firstname, ' ', p.lastname), u.email) as collectorName,
             u.phone as collectorPhone,
             u.email as collectorEmail,
             m.name as materialName
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN users u ON ac.collectorId = u.id
      LEFT JOIN person p ON p.userId = u.id
      LEFT JOIN material m ON r.materialId = m.id
      WHERE r.idUser = ?
    `;
    
    const params = [recyclerId];
    
    if (state !== null) {
      query += ` AND ac.state = ?`;
      params.push(state);
    }
    
    query += ` ORDER BY ac.acceptedDate DESC`;
    
    if (limit) {
      query += ` LIMIT ?`;
      params.push(limit);
    }
    
    const [rows] = await db.query(query, params);
    
    // Log para debugging
    console.log("[DEBUG] getAppointmentsByRecyclerAndState - Rows returned:", rows.length);
    if (rows.length > 0) {
      console.log("[DEBUG] First row sample:", {
        id: rows[0].id,
        collectorName: rows[0].collectorName,
        collectorPhone: rows[0].collectorPhone,
        collectorEmail: rows[0].collectorEmail
      });
    }
    
    return rows;
  } catch (err) {
    console.error("[ERROR] AppointmentModel.getAppointmentsByRecyclerAndState:", err);
    throw err;
  }
};

// Obtener appointment por ID
export const getAppointmentById = async (id) => {
  try {
    const query = `
      SELECT ac.id, ac.idRequest, ac.acceptedDate, ac.collectorId, ac.acceptedHour, ac.state,
             r.description, r.materialId, r.idUser as recyclerId,
             COALESCE(CONCAT(pc.firstname, ' ', pc.lastname), uc.email) as collectorName,
             uc.phone as collectorPhone,
             uc.email as collectorEmail,
             COALESCE(CONCAT(pr.firstname, ' ', pr.lastname), ur.email) as recyclerName,
             ur.phone as recyclerPhone,
             ur.email as recyclerEmail,
             m.name as materialName
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN users uc ON ac.collectorId = uc.id
      JOIN users ur ON r.idUser = ur.id
      LEFT JOIN person pc ON pc.userId = uc.id
      LEFT JOIN person pr ON pr.userId = ur.id
      LEFT JOIN material m ON r.materialId = m.id
      WHERE ac.id = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    
    // Log para debugging
    if (rows.length > 0) {
      console.log("[DEBUG] getAppointmentById - Result:", {
        id: rows[0].id,
        collectorName: rows[0].collectorName,
        collectorPhone: rows[0].collectorPhone,
        recyclerName: rows[0].recyclerName,
        recyclerPhone: rows[0].recyclerPhone
      });
    }
    
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("[ERROR] AppointmentModel.getAppointmentById:", err);
    throw err;
  }
};


// Cancelar una cita y revertir el estado de la request a OPEN (1)
// SIN VALIDACIÓN DE PERMISOS DE USUARIO
export const cancelAppointment = async (appointmentId, userId, userRole) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] cancelAppointment - start", { appointmentId, userId, userRole });

    await conn.beginTransaction();

    // Obtener el appointment con todos sus datos
    const [appointmentRows] = await conn.query(
      `SELECT ac.id, ac.idRequest, ac.state, ac.collectorId,
              r.idUser as recyclerId
       FROM appointmentconfirmation ac
       JOIN request r ON ac.idRequest = r.id
       WHERE ac.id = ?`,
      [appointmentId]
    );

    if (!appointmentRows[0]) {
      throw new Error(`Appointment with id ${appointmentId} not found`);
    }

    const appointment = appointmentRows[0];

    // *** VALIDACIÓN DE PERMISOS REMOVIDA ***
    // Ahora cualquiera puede cancelar sin importar el userId

    // Verificar que el appointment esté en un estado cancelable (PENDING=0, ACCEPTED=1)
    if (appointment.state !== APPOINTMENT_STATE.PENDING && appointment.state !== APPOINTMENT_STATE.ACCEPTED) {
      throw new Error(`Appointment ${appointmentId} cannot be cancelled. Current state: ${appointment.state}`);
    }

    console.log("[INFO] cancelAppointment - appointment verified", { appointment });

    // Actualizar el estado del appointment a CANCELLED (5)
    await conn.execute(
      `UPDATE appointmentconfirmation SET state = ? WHERE id = ?`,
      [APPOINTMENT_STATE.CANCELLED, appointmentId]
    );

    console.log("[INFO] cancelAppointment - appointment state updated to CANCELLED");

    // Revertir el estado del request a OPEN (1) - disponible nuevamente en el mapa
    const updated = await RequestModel.updateState(conn, appointment.idRequest, REQUEST_STATE.OPEN);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${appointment.idRequest}`);
    }

    console.log("[INFO] cancelAppointment - request state reverted to OPEN", { idRequest: appointment.idRequest });

    await conn.commit();
    console.log("[INFO] cancelAppointment - transaction committed", { appointmentId, idRequest: appointment.idRequest });

    return {
      appointmentId,
      requestId: appointment.idRequest,
      previousState: appointment.state,
      newState: APPOINTMENT_STATE.CANCELLED
    };

  } catch (err) {
    console.error("[ERROR] cancelAppointment - transaction error:", {
      appointmentId,
      userId,
      userRole,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    
    try {
      await conn.rollback();
      console.log("[INFO] cancelAppointment - rollback executed");
    } catch (rbErr) {
      console.error("[ERROR] cancelAppointment - rollback error:", { message: rbErr.message });
    }
    
    throw err;
  } finally {
    try { 
      conn.release(); 
    } catch (releaseErr) {
      console.error("[ERROR] cancelAppointment - connection release error:", { message: releaseErr.message });
    }
  }
};

// Aceptar un appointment (el recycler confirma la recolección)
export const acceptAppointment = async (appointmentId, userId) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] acceptAppointment - start", { appointmentId, userId });

    await conn.beginTransaction();

    // Obtener el appointment con todos sus datos
    const [appointmentRows] = await conn.query(
      `SELECT ac.id, ac.idRequest, ac.state, ac.collectorId,
              r.idUser as recyclerId
       FROM appointmentconfirmation ac
       JOIN request r ON ac.idRequest = r.id
       WHERE ac.id = ?`,
      [appointmentId]
    );

    if (!appointmentRows[0]) {
      throw new Error(`Appointment with id ${appointmentId} not found`);
    }

    const appointment = appointmentRows[0];

    // Verificar que el appointment esté en estado PENDING (0)
    if (appointment.state !== APPOINTMENT_STATE.PENDING) {
      throw new Error(`Appointment ${appointmentId} is not in PENDING state. Current state: ${appointment.state}`);
    }

    console.log("[INFO] acceptAppointment - appointment verified", { appointment });

    // Actualizar el estado del appointment a ACCEPTED (1)
    await conn.execute(
      `UPDATE appointmentconfirmation SET state = ? WHERE id = ?`,
      [APPOINTMENT_STATE.ACCEPTED, appointmentId]
    );

    console.log("[INFO] acceptAppointment - appointment state updated to ACCEPTED");

    // Actualizar el estado del request a ACCEPTED (2)
    const updated = await RequestModel.updateState(conn, appointment.idRequest, REQUEST_STATE.ACCEPTED);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${appointment.idRequest}`);
    }

    console.log("[INFO] acceptAppointment - request state updated to ACCEPTED", { idRequest: appointment.idRequest });

    await conn.commit();
    console.log("[INFO] acceptAppointment - transaction committed", { appointmentId, idRequest: appointment.idRequest });

    return {
      appointmentId,
      requestId: appointment.idRequest,
      previousState: appointment.state,
      newState: APPOINTMENT_STATE.ACCEPTED
    };

  } catch (err) {
    console.error("[ERROR] acceptAppointment - transaction error:", {
      appointmentId,
      userId,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    
    try {
      await conn.rollback();
      console.log("[INFO] acceptAppointment - rollback executed");
    } catch (rbErr) {
      console.error("[ERROR] acceptAppointment - rollback error:", { message: rbErr.message });
    }
    
    throw err;
  } finally {
    try { 
      conn.release(); 
    } catch (releaseErr) {
      console.error("[ERROR] acceptAppointment - connection release error:", { message: releaseErr.message });
    }
  }
};

// Rechazar un appointment (el recycler rechaza la recolección)
export const rejectAppointment = async (appointmentId, userId) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] rejectAppointment - start", { appointmentId, userId });

    await conn.beginTransaction();

    // Obtener el appointment con todos sus datos
    const [appointmentRows] = await conn.query(
      `SELECT ac.id, ac.idRequest, ac.state, ac.collectorId,
              r.idUser as recyclerId
       FROM appointmentconfirmation ac
       JOIN request r ON ac.idRequest = r.id
       WHERE ac.id = ?`,
      [appointmentId]
    );

    if (!appointmentRows[0]) {
      throw new Error(`Appointment with id ${appointmentId} not found`);
    }

    const appointment = appointmentRows[0];

    // Verificar que el appointment esté en estado PENDING (0)
    if (appointment.state !== APPOINTMENT_STATE.PENDING) {
      throw new Error(`Appointment ${appointmentId} is not in PENDING state. Current state: ${appointment.state}`);
    }

    console.log("[INFO] rejectAppointment - appointment verified", { appointment });

    // Actualizar el estado del appointment a REJECTED (3)
    await conn.execute(
      `UPDATE appointmentconfirmation SET state = ? WHERE id = ?`,
      [APPOINTMENT_STATE.REJECTED, appointmentId]
    );

    console.log("[INFO] rejectAppointment - appointment state updated to REJECTED");

    // Revertir el estado del request a OPEN (1) - disponible nuevamente en el mapa
    const updated = await RequestModel.updateState(conn, appointment.idRequest, REQUEST_STATE.OPEN);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${appointment.idRequest}`);
    }

    console.log("[INFO] rejectAppointment - request state reverted to OPEN", { idRequest: appointment.idRequest });

    await conn.commit();
    console.log("[INFO] rejectAppointment - transaction committed", { appointmentId, idRequest: appointment.idRequest });

    return {
      appointmentId,
      requestId: appointment.idRequest,
      previousState: appointment.state,
      newState: APPOINTMENT_STATE.REJECTED
    };

  } catch (err) {
    console.error("[ERROR] rejectAppointment - transaction error:", {
      appointmentId,
      userId,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    
    try {
      await conn.rollback();
      console.log("[INFO] rejectAppointment - rollback executed");
    } catch (rbErr) {
      console.error("[ERROR] rejectAppointment - rollback error:", { message: rbErr.message });
    }
    
    throw err;
  } finally {
    try { 
      conn.release(); 
    } catch (releaseErr) {
      console.error("[ERROR] rejectAppointment - connection release error:", { message: releaseErr.message });
    }
  }
};

// Completar un appointment (la recolección fue exitosa)
export const completeAppointment = async (appointmentId, userId) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] completeAppointment - start", { appointmentId, userId });

    await conn.beginTransaction();

    // Obtener el appointment con todos sus datos
    const [appointmentRows] = await conn.query(
      `SELECT ac.id, ac.idRequest, ac.state, ac.collectorId,
              r.idUser as recyclerId
       FROM appointmentconfirmation ac
       JOIN request r ON ac.idRequest = r.id
       WHERE ac.id = ?`,
      [appointmentId]
    );

    if (!appointmentRows[0]) {
      throw new Error(`Appointment with id ${appointmentId} not found`);
    }

    const appointment = appointmentRows[0];

    // Verificar que el appointment esté en estado ACCEPTED (1)
    if (appointment.state !== APPOINTMENT_STATE.ACCEPTED) {
      throw new Error(`Appointment ${appointmentId} is not in ACCEPTED state. Current state: ${appointment.state}`);
    }

    console.log("[INFO] completeAppointment - appointment verified", { appointment });

    // Actualizar el estado del appointment a COMPLETED (4)
    await conn.execute(
      `UPDATE appointmentconfirmation SET state = ? WHERE id = ?`,
      [APPOINTMENT_STATE.COMPLETED, appointmentId]
    );

    console.log("[INFO] completeAppointment - appointment state updated to COMPLETED");

    // Actualizar el estado del request a CLOSED (4)
    const updated = await RequestModel.updateState(conn, appointment.idRequest, REQUEST_STATE.CLOSED);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${appointment.idRequest}`);
    }

    console.log("[INFO] completeAppointment - request state updated to CLOSED", { idRequest: appointment.idRequest });

    await conn.commit();
    console.log("[INFO] completeAppointment - transaction committed", { appointmentId, idRequest: appointment.idRequest });

    return {
      appointmentId,
      requestId: appointment.idRequest,
      previousState: appointment.state,
      newState: APPOINTMENT_STATE.COMPLETED
    };

  } catch (err) {
    console.error("[ERROR] completeAppointment - transaction error:", {
      appointmentId,
      userId,
      message: err.message,
      code: err.code || null,
      sqlMessage: err.sqlMessage || null,
      sql: err.sql || null,
      stack: err.stack,
    });
    
    try {
      await conn.rollback();
      console.log("[INFO] completeAppointment - rollback executed");
    } catch (rbErr) {
      console.error("[ERROR] completeAppointment - rollback error:", { message: rbErr.message });
    }
    
    throw err;
  } finally {
    try { 
      conn.release(); 
    } catch (releaseErr) {
      console.error("[ERROR] completeAppointment - connection release error:", { message: releaseErr.message });
    }
  }
};