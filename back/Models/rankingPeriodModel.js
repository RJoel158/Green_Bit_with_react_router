// back/Models/rankingPeriodModel.js
import db from '../Config/DBConnect.js';

const RankingPeriod = {
  async create({ fecha_inicio, fecha_fin, estado }) {
    const [res] = await db.query(
      'INSERT INTO ranking_periods (fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?)',
      [fecha_inicio, fecha_fin, estado]
    );
    return res.insertId;
  },
  async update(id, { fecha_inicio, fecha_fin }) {
    await db.query(
      'UPDATE ranking_periods SET fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
      [fecha_inicio, fecha_fin, id]
    );
  },
  async close(id) {
    await db.query(
      "UPDATE ranking_periods SET estado = 'cerrado', fecha_fin = NOW() WHERE id = ?",
      [id]
    );
  },
  async markDeleted(id) {
    await db.query(
      "UPDATE ranking_periods SET estado = 'eliminado' WHERE id = ?",
      [id]
    );
  }
};

export default RankingPeriod;
