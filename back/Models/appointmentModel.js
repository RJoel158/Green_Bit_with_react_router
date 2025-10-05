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

