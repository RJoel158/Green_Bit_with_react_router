import db from '../config/DBConnect.js';

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

export const getRecolectionsReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    console.log('[INFO] getRecolectionsReport - Parameters:', { dateFrom, dateTo });

    let whereClause = 'WHERE ac.state = 4'; // Estado 4 = completado
    const params = [];

    // Si no se proporcionan fechas, obtener últimos 30 días
    let effectiveDateFrom = dateFrom;
    let effectiveDateTo = dateTo;
    
    if (!dateFrom && !dateTo) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      effectiveDateFrom = thirtyDaysAgo.toISOString().split('T')[0];
      effectiveDateTo = today.toISOString().split('T')[0];
      console.log('[INFO] getRecolectionsReport - No se proporcionaron fechas, usando últimos 30 días:', { effectiveDateFrom, effectiveDateTo });
    }

    if (effectiveDateFrom) {
      whereClause += ' AND DATE(ac.acceptedDate) >= ?';
      params.push(effectiveDateFrom);
    }

    if (effectiveDateTo) {
      whereClause += ' AND DATE(ac.acceptedDate) <= ?';
      params.push(effectiveDateTo);
    }

    // Query para obtener recolecciones agrupadas por fecha
    const query = `
      SELECT 
        DATE(ac.acceptedDate) as date,
        COUNT(*) as count
      FROM appointmentconfirmation ac
      ${whereClause}
      GROUP BY DATE(ac.acceptedDate)
      ORDER BY date ASC
    `;

    console.log('[DEBUG] getRecolectionsReport - Query:', query);
    console.log('[DEBUG] getRecolectionsReport - Params:', params);

    const [rows] = await db.query(query, params);
    console.log('[INFO] getRecolectionsReport - Found', rows.length, 'days with collections');
    console.log('[DEBUG] getRecolectionsReport - Rows:', rows);

    // Calcular total de recolecciones
    const totalCollections = rows.reduce((sum, row) => sum + (row.count || 0), 0);

    // Calcular rango de días
    let dayRange = 1;
    if (effectiveDateFrom && effectiveDateTo) {
      const startDate = new Date(effectiveDateFrom);
      const endDate = new Date(effectiveDateTo);
      dayRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      if (dayRange < 1) dayRange = 1;
    } else if (rows.length > 0) {
      // Si no hay fechas explícitas, calcular desde las fechas de los datos
      const dates = rows.map(row => new Date(row.date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      dayRange = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;
      if (dayRange < 1) dayRange = 1;
    }

    console.log('[DEBUG] getRecolectionsReport - totalCollections:', totalCollections, 'dayRange:', dayRange);

    // Calcular IDR (Índice Diario de Recolecciones)
    const cdi = dayRange > 0 ? parseFloat((totalCollections / dayRange).toFixed(2)) : 0;

    // Formatear datos para el gráfico
    const collectionsData = rows.map((row, index) => ({
      date: row.date,
      count: row.count || 0,
      color: getColorByIndex(index)
    }));

    res.json({
      data: collectionsData,
      summary: {
        totalCollections,
        dayRange,
        cdi,
        dailyAverage: cdi 
      }
    });
  } catch (err) {
    console.error('[ERROR] getRecolectionsReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de recolecciones', details: err.message });
  }
};

function getColorByIndex(index) {
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6'];
  return colors[index % colors.length];
}
