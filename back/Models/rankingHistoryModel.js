// back/Models/rankingHistoryModel.js
import db from '../Config/DBConnect.js';

const RankingHistory = {
  async getByPeriod(periodo_id) {
    const [rows] = await db.query(
      'SELECT * FROM ranking_history WHERE periodo_id = ? ORDER BY rol, posicion ASC',
      [periodo_id]
    );
    return [rows];
  },
  async insertMany(historyArray) {
    if (!Array.isArray(historyArray) || historyArray.length === 0) return;
    const values = historyArray.map(h => [h.periodo_id, h.rol, h.user_id, h.puntaje_final, h.posicion]);
    await db.query(
      'INSERT INTO ranking_history (periodo_id, rol, user_id, puntaje_final, posicion) VALUES ?',
      [values]
    );
  }
};

export default RankingHistory;
