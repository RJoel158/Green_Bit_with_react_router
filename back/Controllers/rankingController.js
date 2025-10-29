// Eliminar periodo (solo actualiza estado)
const deletePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    await RankingPeriod.markDeleted(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Editar periodo
const updatePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.body;
    await RankingPeriod.update(id, { fecha_inicio, fecha_fin });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Crear nuevo periodo
const createPeriod = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.body;
    // Validar que no haya periodo activo
    const [activos] = await db.query("SELECT id FROM ranking_periods WHERE estado = 'activo'");
    if (activos.length > 0) {
      return res.status(400).json({ success: false, error: 'Ya existe un periodo activo. Debe cerrarlo o eliminarlo antes de crear uno nuevo.' });
    }
    // Validar fecha de inicio
    if (new Date(fecha_inicio) < new Date()) {
      return res.status(400).json({ success: false, error: 'No se puede crear un periodo con fecha de inicio en el pasado.' });
    }
    await RankingPeriod.create({ fecha_inicio, fecha_fin, estado: 'activo' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
import RankingPeriod from '../Models/rankingPeriodModel.js';
import RankingHistory from '../Models/rankingHistoryModel.js';
import RankingTops from '../Models/rankingTopsModel.js';
import db from '../Config/DBConnect.js';

const RankingController = {
  // Ranking en tiempo real por periodo
  getLiveRankingByPeriod: async (req, res) => {
    const { periodo_id } = req.params;
    try {
      // Top 10 recicladores por score global (roleId=3)
      const [recicladores] = await db.query(`
        SELECT u.id AS user_id, u.email, 'reciclador' AS rol, u.score AS puntaje_final
        FROM users u
        WHERE u.roleId = 3
        ORDER BY u.score DESC
        LIMIT 10
      `);
      // Top 10 recolectores por score global (roleId=2)
      const [recolectores] = await db.query(`
        SELECT u.id AS user_id, u.email, 'recolector' AS rol, u.score AS puntaje_final
        FROM users u
        WHERE u.roleId = 2
        ORDER BY u.score DESC
        LIMIT 10
      `);
      res.json({ success: true, recicladores, recolectores });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  // Listar todos los periodos (compatibilidad frontend)
  getPeriods: async (req, res) => {
    try {
      const [periods] = await db.query("SELECT * FROM ranking_periods ORDER BY fecha_inicio DESC");
      res.json({ success: true, periods });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Solo periodos cerrados con fecha de cierre
  getClosedPeriods: async (req, res) => {
    try {
      const [periods] = await db.query("SELECT id, fecha_fin, estado FROM ranking_periods WHERE estado = 'cerrado' ORDER BY fecha_fin DESC");
      res.json({ success: true, periods });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Obtener top 10 recicladores y recolectores de ranking_tops por periodo
  getTopsByPeriod: async (req, res) => {
    const { periodo_id } = req.params;
    try {
      // Consulta el top real del periodo desde ranking_tops
      const [tops] = await db.query(`
        SELECT t.*, u.email
        FROM ranking_tops t
        INNER JOIN users u ON t.user_id = u.id
        WHERE t.periodo_id = ?
        ORDER BY t.rol, t.posicion ASC
      `, [periodo_id]);
      res.json({ success: true, tops });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Listar ranking histórico por periodo
  getHistory: async (req, res) => {
    const { periodo_id } = req.params;
    try {
      const [rows] = await RankingHistory.getByPeriod(periodo_id);
      res.json({ success: true, history: rows });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Cerrar periodo y registrar ranking
  closePeriod: async (req, res) => {
    const { periodo_id } = req.body;
    try {
      console.log('[RANKING] Cerrando periodo:', periodo_id);
      // 1. Actualizar estado del periodo
      await RankingPeriod.close(periodo_id);
      console.log('[RANKING] Periodo cerrado en BD');

      // 2. Obtener top 5 recicladores y top 5 recolectores usando el nombre del rol
      // Recicladores: roleId=3, sumar score por ratedToUserId
      const [recicladores] = await db.query(
        `SELECT u.id AS user_id, 'reciclador' AS rol, u.score AS puntaje_final
         FROM users u
         WHERE u.roleId = 3
         ORDER BY u.score DESC
         LIMIT 5`
      );
      // Recolectores: roleId=2, sumar score por ratedToUserId
      const [recolectores] = await db.query(
        `SELECT u.id AS user_id, 'recolector' AS rol, u.score AS puntaje_final
         FROM users u
         WHERE u.roleId = 2
         ORDER BY u.score DESC
         LIMIT 5`
      );
      console.log('[RANKING] Recicladores:', recicladores);
      console.log('[RANKING] Recolectores:', recolectores);

      // Unir y asignar posición
      const topsPorRol = [
        ...recicladores.map((r, i) => ({
          periodo_id,
          rol: r.rol,
          user_id: r.user_id,
          puntaje_final: r.puntaje_final,
          posicion: i+1,
          fecha_cierre: new Date().toISOString().slice(0, 19).replace('T', ' ')
        })),
        ...recolectores.map((r, i) => ({
          periodo_id,
          rol: r.rol,
          user_id: r.user_id,
          puntaje_final: r.puntaje_final,
          posicion: i+1,
          fecha_cierre: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }))
      ];
      console.log('[RANKING] Tops por rol:', topsPorRol);

      if (topsPorRol.length > 0) {
        await RankingTops.insertMany(topsPorRol);
        console.log('[RANKING] Tops guardados en ranking_tops');
        // Guardar en historial (sin fecha_cierre)
        const rankingWithPos = topsPorRol.map(({fecha_cierre, ...rest}) => rest);
        await RankingHistory.insertMany(rankingWithPos);
        console.log('[RANKING] Ranking guardado en historial');

        // --- DECAY GLOBAL ---
        // Decay: 1° -30%, 2° -25%, 3° -20%, 4° -15%, 5° -10%, resto -5%
        // Aplica decay a los top 5
        const recicladorDecays = [0.3, 0.25, 0.2, 0.15, 0.1];
        for (let i = 0; i < recicladores.length; i++) {
          const userId = recicladores[i].user_id;
          const decay = recicladorDecays[i] ?? 0.05;
          await db.query('UPDATE users SET score = ROUND(score * (1 - ?)) WHERE id = ?', [decay, userId]);
        }
        const recolectorDecays = [0.3, 0.25, 0.2, 0.15, 0.1];
        for (let i = 0; i < recolectores.length; i++) {
          const userId = recolectores[i].user_id;
          const decay = recolectorDecays[i] ?? 0.05;
          await db.query('UPDATE users SET score = ROUND(score * (1 - ?)) WHERE id = ?', [decay, userId]);
        }
        // Decay para el resto de usuarios de cada rol
        const ids = [...recicladores.map(r => r.user_id), ...recolectores.map(r => r.user_id)];
        if (ids.length > 0) {
          await db.query('UPDATE users SET score = ROUND(score * 0.95) WHERE roleId IN (2,3) AND id NOT IN (?)', [ids]);
        }
        res.json({ success: true, ranking: topsPorRol });
      } else {
        res.json({ success: false, message: 'No hay puntajes para guardar en el ranking de este periodo.' });
      }
    } catch (err) {
      console.error('[RANKING] Error al cerrar periodo:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

export default {
  ...RankingController,
  createPeriod,
  updatePeriod,
  deletePeriod,
};
