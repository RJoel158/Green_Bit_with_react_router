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
      const [tops] = await db.query("SELECT * FROM ranking_tops WHERE periodo_id = ? ORDER BY rol, posicion ASC", [periodo_id]);
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
      const [recicladores] = await db.query(`
        SELECT s.ratedToUserId AS user_id, r.name AS rol, SUM(s.score) AS puntaje_final
        FROM score s
        INNER JOIN users u ON s.ratedToUserId = u.id
        INNER JOIN role r ON u.roleId = r.id AND r.name = 'reciclador'
        WHERE s.createdDate BETWEEN (
          SELECT fecha_inicio FROM ranking_periods WHERE id = ?
        ) AND (
          SELECT fecha_fin FROM ranking_periods WHERE id = ?
        )
        GROUP BY s.ratedToUserId, r.name
        ORDER BY puntaje_final DESC
        LIMIT 5
      `, [periodo_id, periodo_id]);
      // Recolectores: roleId=2, sumar score por ratedToUserId
      const [recolectores] = await db.query(`
        SELECT s.ratedToUserId AS user_id, r.name AS rol, SUM(s.score) AS puntaje_final
        FROM score s
        INNER JOIN users u ON s.ratedToUserId = u.id
        INNER JOIN role r ON u.roleId = r.id AND r.name = 'recolector'
        WHERE s.createdDate BETWEEN (
          SELECT fecha_inicio FROM ranking_periods WHERE id = ?
        ) AND (
          SELECT fecha_fin FROM ranking_periods WHERE id = ?
        )
        GROUP BY s.ratedToUserId, r.name
        ORDER BY puntaje_final DESC
        LIMIT 5
      `, [periodo_id, periodo_id]);
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
        // Obtener todos los usuarios activos
        const [users] = await db.query(`SELECT u.id, r.name AS rol FROM users u INNER JOIN role r ON u.roleId = r.id WHERE u.state = 1`);
        for (const user of users) {
          // Buscar si está en el ranking actual
          const top = topsPorRol.find(t => t.user_id === user.id && t.rol === user.rol);
          let puntaje = top ? top.puntaje_final : 0;
          let posicion = top ? top.posicion : null;
          // Decay escalonado
          let decay = 0.05; // fuera del top 10
          if (posicion && posicion <= 5) decay = 0.20;
          else if (posicion && posicion <= 10) decay = 0.10;
          const puntaje_final_decay = Number(puntaje) * (1 - decay);
          // Actualizar ranking_tops si existe
          if (top) {
            await db.query(`UPDATE ranking_tops SET puntaje_final = ? WHERE periodo_id = ? AND user_id = ? AND rol = ?`, [puntaje_final_decay, periodo_id, user.id, user.rol]);
          }
          // Si quieres guardar el puntaje global, aquí puedes actualizar/insertar en otra tabla
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
