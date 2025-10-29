// back/Models/rankingTopsModel.js
import db from '../config/DBConnect.js';

const RankingTops = {
  async insertMany(topsArray) {
    if (!Array.isArray(topsArray) || topsArray.length === 0) return;
    const values = topsArray.map(t => [t.periodo_id, t.rol, t.user_id, t.puntaje_final, t.posicion, t.fecha_cierre]);
    await db.query(
      'INSERT INTO ranking_tops (periodo_id, rol, user_id, puntaje_final, posicion, fecha_cierre) VALUES ?',
      [values]
    );
  },
  async getByPeriod(periodo_id) {
    const [rows] = await db.query(
      'SELECT * FROM ranking_tops WHERE periodo_id = ? ORDER BY rol, posicion ASC',
      [periodo_id]
    );
    return [rows];
  }
};

export default RankingTops;
