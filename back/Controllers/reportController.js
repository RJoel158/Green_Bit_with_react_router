/**
 * Report Controller - Genera reportes agregados desde datos de la base de datos
 */
import db from '../Config/DBConnect.js';

/**
 * Reporte de Materiales - Cantidad de solicitudes recicladas por tipo de material
 * GET /api/reports/materiales?dateFrom=2025-01-01&dateTo=2025-12-31
 */
export const getMaterialesReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    console.log('[INFO] reportController.getMaterialesReport - Parameters:', { dateFrom, dateTo });

    // Construir la cláusula WHERE dinámicamente
    let whereClause = 'WHERE ac.state IN (0, 1, 3, 4)'; // Todos los estados completados/activos
    const params = [];

    if (dateFrom) {
      whereClause += ' AND ac.acceptedDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND ac.acceptedDate <= ?';
      params.push(dateTo);
    }

    // Query: Agrupar por material y contar solicitudes
    const query = `
      SELECT 
        m.id,
        m.name,
        COUNT(DISTINCT r.id) as recolecciones
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN material m ON r.materialId = m.id
      ${whereClause}
      GROUP BY m.id, m.name
      ORDER BY recolecciones DESC
    `;

    const [rows] = await db.query(query, params);

    console.log('[INFO] reportController.getMaterialesReport - Found', rows.length, 'materials');

    // Calcular total para porcentajes
    const total = rows.reduce((sum, row) => sum + (row.recolecciones || 0), 0);

    // Transformar datos al formato esperado por el frontend
    const materialesData = rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      kg: row.recolecciones || 0, // Usar cantidad de solicitudes como "kg"
      percentage: total > 0 ? parseFloat(((row.recolecciones / total) * 100).toFixed(2)) : 0,
      color: getColorByIndex(index),
      recolecciones: row.recolecciones
    }));

    res.json(materialesData);
  } catch (err) {
    console.error('[ERROR] reportController.getMaterialesReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de materiales', details: err.message });
  }
};

/**
 * Reporte de Recolectores Top - Top N recolectores por kg reciclado
 * GET /api/reports/recolectores?dateFrom=2025-01-01&dateTo=2025-12-31&limit=5
 */
export const getRecolectoresReport = async (req, res) => {
  try {
    const { dateFrom, dateTo, limit = 5 } = req.query;

    console.log('[INFO] reportController.getRecolectoresReport - Parameters:', { dateFrom, dateTo, limit });

    // Construir la cláusula WHERE dinámicamente
    let whereClause = 'WHERE ac.state IN (0, 1, 3, 4)'; // Todos los estados activos/completados
    const params = [];

    if (dateFrom) {
      whereClause += ' AND ac.acceptedDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND ac.acceptedDate <= ?';
      params.push(dateTo);
    }

    // Query: Agrupar por recolector y contar citas
    const limitValue = parseInt(limit) || 5;
    const query = `
      SELECT 
        u.id,
        COALESCE(CONCAT(p.firstname, ' ', p.lastname), u.email) as name,
        COUNT(DISTINCT ac.id) as kg
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN users u ON ac.collectorId = u.id
      LEFT JOIN person p ON p.userId = u.id
      ${whereClause}
      GROUP BY u.id, name
      ORDER BY kg DESC
      LIMIT ${limitValue}
    `;

    const [rows] = await db.query(query, params);

    console.log('[INFO] reportController.getRecolectoresReport - Found', rows.length, 'collectors');

    // Calcular total para porcentajes
    const total = rows.reduce((sum, row) => sum + (row.kg || 0), 0);

    // Transformar datos al formato esperado por el frontend
    const recolectoresData = rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      kg: row.kg || 0,
      percentage: total > 0 ? parseFloat(((row.kg / total) * 100).toFixed(2)) : 0,
      recolecciones: row.kg
    }));

    res.json(recolectoresData);
  } catch (err) {
    console.error('[ERROR] reportController.getRecolectoresReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de recolectores', details: err.message });
  }
};

/**
 * Reporte de Citas - Citas completadas vs pendientes por día
 * GET /api/reports/citas?dateFrom=2025-01-01&dateTo=2025-12-31
 */
export const getCitasReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    console.log('[INFO] reportController.getCitasReport - Parameters:', { dateFrom, dateTo });

    // Construir la cláusula WHERE dinámicamente
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND ac.acceptedDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND ac.acceptedDate <= ?';
      params.push(dateTo);
    }

    // Query: Agrupar por fecha y contar estados
    const query = `
      SELECT 
        DATE(ac.acceptedDate) as day,
        SUM(CASE WHEN ac.state = 4 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN ac.state = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN ac.state = 5 THEN 1 ELSE 0 END) as cancelled
      FROM appointmentconfirmation ac
      ${whereClause}
      GROUP BY DATE(ac.acceptedDate)
      ORDER BY day ASC
    `;

    const [rows] = await db.query(query, params);

    console.log('[INFO] reportController.getCitasReport - Found', rows.length, 'days');

    // Transformar datos al formato esperado por el frontend
    const citasData = rows.map(row => ({
      day: row.day,
      completed: row.completed || 0,
      pending: row.pending || 0,
      cancelled: row.cancelled || 0
    }));

    res.json(citasData);
  } catch (err) {
    console.error('[ERROR] reportController.getCitasReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de citas', details: err.message });
  }
};

/**
 * Reporte de Puntuaciones - Distribución de calificaciones (1-5 estrellas)
 * GET /api/reports/puntuaciones?dateFrom=2025-01-01&dateTo=2025-12-31
 */
export const getPuntuacionesReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    console.log('[INFO] reportController.getPuntuacionesReport - Parameters:', { dateFrom, dateTo });

    // Construir la cláusula WHERE dinámicamente
    let whereClause = 'WHERE s.state = 1';
    const params = [];

    if (dateFrom) {
      whereClause += ' AND ac.acceptedDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND ac.acceptedDate <= ?';
      params.push(dateTo);
    }

    // Query: Agrupar por puntuación
    const query = `
      SELECT 
        s.score as stars,
        COUNT(*) as count
      FROM score s
      JOIN appointmentconfirmation ac ON s.appointmentConfirmationId = ac.id
      ${whereClause}
      GROUP BY s.score
      ORDER BY s.score ASC
    `;

    const [rows] = await db.query(query, params);

    console.log('[INFO] reportController.getPuntuacionesReport - Found', rows.length, 'score groups');

    // Calcular total de puntuaciones
    const totalScores = rows.reduce((sum, row) => sum + row.count, 0);

    // Asegurar que tenemos todas las estrellas (1-5)
    const starsMap = {};
    for (let i = 1; i <= 5; i++) {
      starsMap[i] = { stars: i, count: 0, percentage: 0 };
    }

    // Llenar con datos de la BD
    rows.forEach(row => {
      if (starsMap[row.stars]) {
        starsMap[row.stars].count = row.count;
        starsMap[row.stars].percentage = totalScores > 0 ? parseFloat(((row.count / totalScores) * 100).toFixed(2)) : 0;
      }
    });

    // Convertir a array
    const puntuacionesData = Object.values(starsMap).map(item => ({
      stars: item.stars,
      count: item.count,
      percentage: item.percentage,
      label: getStarLabel(item.stars)
    }));

    res.json(puntuacionesData);
  } catch (err) {
    console.error('[ERROR] reportController.getPuntuacionesReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de puntuaciones', details: err.message });
  }
};

/**
 * Reporte de Instituciones - Top instituciones por kg reciclado
 * GET /api/reports/instituciones?dateFrom=2025-01-01&dateTo=2025-12-31
 */
export const getInstitucionsReport = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    console.log('[INFO] reportController.getInstitucionsReport - Parameters:', { dateFrom, dateTo });

    // Construir la cláusula WHERE dinámicamente
    let whereClause = 'WHERE ac.state = 4'; // COMPLETED = 4
    const params = [];

    if (dateFrom) {
      whereClause += ' AND ac.acceptedDate >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      whereClause += ' AND ac.acceptedDate <= ?';
      params.push(dateTo);
    }

    // Query: Agrupar por institución (usuario recolector) y sumar kg
    // Solo incluir si el usuario tiene institución asociada
    const query = `
      SELECT 
        COALESCE(i.id, u.id) as id,
        COALESCE(i.companyName, CONCAT('Colector-', u.id)) as name,
        COALESCE(SUM(CAST(SUBSTRING_INDEX(r.description, ' ', 1) AS DECIMAL(10,2))), 0) as kg,
        COUNT(DISTINCT ac.id) as recolecciones
      FROM appointmentconfirmation ac
      JOIN request r ON ac.idRequest = r.id
      JOIN users u ON ac.collectorId = u.id
      LEFT JOIN institution i ON i.userId = u.id
      ${whereClause}
      GROUP BY COALESCE(i.id, u.id), name
      ORDER BY kg DESC
      LIMIT 10
    `;

    const [rows] = await db.query(query, params);

    console.log('[INFO] reportController.getInstitucionsReport - Found', rows.length, 'institutions');

    // Calcular total de kg para porcentajes
    const totalKg = rows.reduce((sum, row) => sum + parseFloat(row.kg || 0), 0);

    // Transformar datos al formato esperado por el frontend
    const institucionesData = rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      kg: parseFloat(row.kg || 0),
      meta: 1000, // Meta fija para este ejemplo
      percentage: totalKg > 0 ? parseFloat(((row.kg / totalKg) * 100).toFixed(2)) : 0,
      recolecciones: row.recolecciones
    }));

    res.json(institucionesData);
  } catch (err) {
    console.error('[ERROR] reportController.getInstitucionsReport:', err);
    res.status(500).json({ error: 'Error al generar reporte de puntuaciones', details: err.message });
  }
};

/**
 * Descargar PDF de un reporte
 * GET /api/reports/:reportType/pdf?dateFrom=2025-01-01&dateTo=2025-12-31
 */
export const downloadReportPDF = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { dateFrom, dateTo } = req.query;

    console.log('[INFO] reportController.downloadReportPDF - Parameters:', { reportType, dateFrom, dateTo });

    // Por ahora retornamos un error - necesitaría instalar una librería como pdfkit o jsPDF
    res.status(501).json({ 
      error: 'PDF download not yet implemented',
      message: 'Para implementar descarga de PDF, instala: npm install pdfkit'
    });
  } catch (err) {
    console.error('[ERROR] reportController.downloadReportPDF:', err);
    res.status(500).json({ error: 'Error al generar PDF', details: err.message });
  }
};

/**
 * Funciones auxiliares
 */

/**
 * Obtener color basado en índice (para gráficos)
 */
function getColorByIndex(index) {
  const colors = [
    '#10B981', // Verde esmeralda
    '#3B82F6', // Azul
    '#F59E0B', // Ámbar
    '#EF4444', // Rojo
    '#8B5CF6', // Púrpura
    '#06B6D4', // Cyan
    '#EC4899', // Rosa
    '#14B8A6', // Turquesa
  ];
  return colors[index % colors.length];
}

/**
 * Obtener etiqueta de estrellas
 */
function getStarLabel(stars) {
  const labels = {
    1: 'Muy Malo ⭐',
    2: 'Malo ⭐⭐',
    3: 'Normal ⭐⭐⭐',
    4: 'Bueno ⭐⭐⭐⭐',
    5: 'Excelente ⭐⭐⭐⭐⭐'
  };
  return labels[stars] || `${stars} Estrellas`;
}
