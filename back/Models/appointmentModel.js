// Models/appointmentModel.js
import db from "../Config/DBConnect.js";

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

//Creación de appointment en la tabla appointmentconfirmation
export const createAppointment = async (conn, idRequest, acceptedDate, collectorId, acceptedHour) => {
  try{
  const [result] = await conn.execute(
    `INSERT INTO appointmentconfirmation (idRequest, acceptedDate, collectorId, acceptedHour)
     VALUES (?, ?, ?,?)`,
    [idRequest, acceptedDate, collectorId,acceptedHour]
  );
  return result.insertId;
  }catch(err){
    console.error("[ERROR] RequestModel.create:", {
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
    throw err;
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

