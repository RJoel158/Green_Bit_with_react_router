// Models/appointmentModel.js
import db from "../Config/DBConnect.js";
import * as RequestModel from "./Forms/requestModel.js"

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
// en la tabla appointmentconfirmation y cambio de estado de request a 2
export const createAppointment = async (idRequest, acceptedDate, collectorId, acceptedHour) => {
  const conn = await db.getConnection();
  try {
    console.log("[INFO] createAppointment - start", { idRequest, acceptedDate, collectorId, acceptedHour });

    await conn.beginTransaction();

    // Verificar que el estado de request sea 0
    const [requestRows] = await conn.query(
      `SELECT id, state FROM request WHERE id = ?`,
      [idRequest]
    );

    if (!requestRows[0]) {
      throw new Error(`Request with id ${idRequest} not found`);
    }

    if (requestRows[0].state !== 0) {
      throw new Error(`Request ${idRequest} is not in state 0. Current state: ${requestRows[0].state}`);
    }

    console.log("[INFO] createAppointment - request verified as state 0", { idRequest });

    // Crear el appointment
    const [result] = await conn.execute(
      `INSERT INTO appointmentconfirmation (idRequest, acceptedDate, collectorId, acceptedHour)
       VALUES (?, ?, ?, ?)`,
      [idRequest, acceptedDate, collectorId, acceptedHour]
    );

    const appointmentId = result.insertId;
    console.log("[INFO] createAppointment - appointment created", { appointmentId });

    //Actualizar el estado del request a 2
    const updated = await RequestModel.updateState(conn, idRequest, 2);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${idRequest}`);
    }

    console.log("[INFO] createAppointment - request state updated to 2", { idRequest });

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
             CONCAT(p.firstname, ' ', p.lastname) as recyclerName,
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
             CONCAT(p.firstname, ' ', p.lastname) as collectorName,
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
             CONCAT(pc.firstname, ' ', pc.lastname) as collectorName,
             CONCAT(pr.firstname, ' ', pr.lastname) as recyclerName,
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
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    console.error("[ERROR] AppointmentModel.getAppointmentById:", err);
    throw err;
  }
};


// Cancelar una cita y revertir el estado de la request a 0
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

    // Verificar que el appointment esté en un estado cancelable (0=pendiente, 1=confirmada)
    if (appointment.state !== 0 && appointment.state !== 1) {
      throw new Error(`Appointment ${appointmentId} cannot be cancelled. Current state: ${appointment.state}`);
    }

    console.log("[INFO] cancelAppointment - appointment verified", { appointment });

    // Actualizar el estado del appointment a 3 (cancelado)
    await conn.execute(
      `UPDATE appointmentconfirmation SET state = 3 WHERE id = ?`,
      [appointmentId]
    );

    console.log("[INFO] cancelAppointment - appointment state updated to 3 (cancelled)");

    // Revertir el estado del request a 0 (disponible)
    const updated = await RequestModel.updateState(conn, appointment.idRequest, 0);
    
    if (!updated) {
      throw new Error(`Failed to update state for request ${appointment.idRequest}`);
    }

    console.log("[INFO] cancelAppointment - request state reverted to 0", { idRequest: appointment.idRequest });

    await conn.commit();
    console.log("[INFO] cancelAppointment - transaction committed", { appointmentId, idRequest: appointment.idRequest });

    return {
      appointmentId,
      requestId: appointment.idRequest,
      previousState: appointment.state,
      newState: 3
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