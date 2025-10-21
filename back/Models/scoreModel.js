import db from '../Config/DBConnect.js';

/**
 * Crear una nueva calificación
 */
export const createScore = async (appointmentId, ratedByUserId, ratedToUserId, score, comment = null) => {
  try {
    const query = `
      INSERT INTO score (appointmentConfirmationId, ratedByUserId, ratedToUserId, score, comment, state)
      VALUES (?, ?, ?, ?, ?, 1)
    `;
    
    const [result] = await db.query(query, [appointmentId, ratedByUserId, ratedToUserId, score, comment]);
    return result.insertId;
  } catch (err) {
    console.error('[ERROR] ScoreModel.createScore:', err);
    throw err;
  }
};

/**
 * Verificar si un usuario ya calificó en una cita específica
 */
export const hasUserRated = async (appointmentId, userId) => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM score
      WHERE appointmentConfirmationId = ? 
        AND ratedByUserId = ?
        AND state = 1
    `;
    
    const [rows] = await db.query(query, [appointmentId, userId]);
    return rows[0].count > 0;
  } catch (err) {
    console.error('[ERROR] ScoreModel.hasUserRated:', err);
    throw err;
  }
};

/**
 * Obtener calificaciones de una cita
 */
export const getScoresByAppointment = async (appointmentId) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.score,
        s.comment,
        s.createdDate,
        s.ratedByUserId,
        s.ratedToUserId,
        COALESCE(CONCAT(p1.firstname, ' ', p1.lastname), u1.email) as ratedByName,
        COALESCE(CONCAT(p2.firstname, ' ', p2.lastname), u2.email) as ratedToName
      FROM score s
      LEFT JOIN users u1 ON s.ratedByUserId = u1.id
      LEFT JOIN person p1 ON p1.userId = u1.id
      LEFT JOIN users u2 ON s.ratedToUserId = u2.id
      LEFT JOIN person p2 ON p2.userId = u2.id
      WHERE s.appointmentConfirmationId = ?
        AND s.state = 1
      ORDER BY s.createdDate DESC
    `;
    
    const [rows] = await db.query(query, [appointmentId]);
    return rows;
  } catch (err) {
    console.error('[ERROR] ScoreModel.getScoresByAppointment:', err);
    throw err;
  }
};

/**
 * Obtener promedio de calificaciones de un usuario
 */
export const getUserAverageRating = async (userId) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as totalRatings,
        AVG(score) as averageScore
      FROM score
      WHERE ratedToUserId = ?
        AND state = 1
    `;
    
    const [rows] = await db.query(query, [userId]);
    return rows[0];
  } catch (err) {
    console.error('[ERROR] ScoreModel.getUserAverageRating:', err);
    throw err;
  }
};
