import db from '../Config/DBConnect.js';

export const getMaterialesReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, userId } = req.query;
    console.log('[INFO] getMaterialesReport - Parameters:', { dateFrom, dateTo, userId });
    console.log('[INFO] getMaterialesReport - Mode:', userId ? `Filtrando por userId=${userId}` : 'Modo ADMIN - Viendo todos los datos');

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Filtrar por usuario si viene en params
    if (userId) {
      whereClause += ' AND r.idUser = ?';
      params.push(userId);
    }

    if (dateFrom) {
      whereClause += ' AND r.registerDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND r.registerDate <= ?';
      params.push(dateTo);
    }

    const query = `
      SELECT 
        m.id,
        m.name,
        COUNT(*) as cantidad
      FROM request r
      INNER JOIN material m ON r.materialId = m.id
      ${whereClause}
      GROUP BY m.id, m.name
      ORDER BY cantidad DESC
    `;

    const [rows] = await db.query(query, params);
    console.log('[INFO] getMaterialesReport - Found', rows.length, 'materials');

    const total = rows.reduce((sum, row) => sum + (row.cantidad || 0), 0);

    const materialesData = rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      kg: row.cantidad || 0,
      percentage: total > 0 ? parseFloat(((row.cantidad / total) * 100).toFixed(2)) : 0,
      color: getColorByIndex(index),
      cantidad: row.cantidad
    }));

    res.json({ data: materialesData });
  } catch (err) {
    console.error('[ERROR] getMaterialesReport:', err);
    res.status(500).json({ error: 'Error al generar reporte', details: err.message });
  }
};

export const getScoresReport = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('[INFO] getScoresReport - Parameters:', { userId });
    console.log('[INFO] getScoresReport - Mode:', userId ? `Filtrando por userId=${userId}` : 'Modo ADMIN - Viendo todos los scores');

    let whereClause = 'WHERE s.state = 1';
    const params = [];

    // Filtrar por usuario si viene en params (calificaciones recibidas por ese usuario)
    if (userId) {
      whereClause += ' AND s.ratedToUserId = ?';
      params.push(userId);
    }

    // Query para estadísticas generales
    const queryStats = `
      SELECT 
        s.score,
        COUNT(*) as count
      FROM score s
      ${whereClause}
      GROUP BY s.score
      ORDER BY s.score DESC
    `;

    // Query para detalles de todas las calificaciones
    const queryDetails = `
      SELECT 
        s.id,
        s.score,
        s.comment,
        s.createdDate,
        s.ratedByUserId,
        s.ratedToUserId,
        COALESCE(CONCAT(p_by.firstname, ' ', p_by.lastname), u_by.email) as ratedByUsername,
        COALESCE(CONCAT(p_to.firstname, ' ', p_to.lastname), u_to.email) as ratedToUsername
      FROM score s
      LEFT JOIN users u_by ON s.ratedByUserId = u_by.id
      LEFT JOIN person p_by ON p_by.userId = u_by.id
      LEFT JOIN users u_to ON s.ratedToUserId = u_to.id
      LEFT JOIN person p_to ON p_to.userId = u_to.id
      ${whereClause}
      ORDER BY s.createdDate DESC
      LIMIT 100
    `;

    console.log('[DEBUG] queryStats:', queryStats);
    console.log('[DEBUG] queryStats params:', params);
    
    const [statsRows] = await db.query(queryStats, params);
    const [detailsRows] = await db.query(queryDetails, params);
    
    console.log('[INFO] getScoresReport - Found', statsRows.length, 'score groups');
    console.log('[INFO] getScoresReport - Found', detailsRows.length, 'score details');
    console.log('[DEBUG] detailsRows:', detailsRows);

    // Calcular estadísticas
    const scoreCounts = {
      count_1: 0,
      count_2: 0,
      count_3: 0,
      count_4: 0,
      count_5: 0,
      total: 0,
      average: 0,
      details: detailsRows.map(row => ({
        id: row.id,
        score: row.score,
        comment: row.comment,
        createdDate: row.createdDate,
        ratedByUserId: row.ratedByUserId,
        ratedToUserId: row.ratedToUserId,
        ratedByUsername: row.ratedByUsername,
        ratedToUsername: row.ratedToUsername
      }))
    };

    let totalScore = 0;
    let totalCount = 0;

    statsRows.forEach(row => {
      const score = row.score;
      const count = row.count || 0;
      scoreCounts[`count_${score}`] = count;
      totalScore += score * count;
      totalCount += count;
    });

    scoreCounts.total = totalCount;
    scoreCounts.average = totalCount > 0 ? totalScore / totalCount : 0;

    console.log('[INFO] getScoresReport - Statistics:', { 
      total: scoreCounts.total, 
      average: scoreCounts.average,
      details_count: scoreCounts.details.length 
    });
    console.log('[DEBUG] Response object:', scoreCounts);
    res.json(scoreCounts);
  } catch (err) {
    console.error('[ERROR] getScoresReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de scores', details: err.message });
  }
};

function getColorByIndex(index) {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];
  return colors[index % colors.length];
}
