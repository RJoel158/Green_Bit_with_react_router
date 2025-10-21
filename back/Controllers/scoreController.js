import * as ScoreModel from '../Models/scoreModel.js';

/**
 * Crear una calificación
 * POST /api/scores
 */
export const createScore = async (req, res) => {
  try {
    const { appointmentId, ratedByUserId, ratedToUserId, score, comment } = req.body;

    // Validaciones
    if (!appointmentId || !ratedByUserId || !ratedToUserId || !score) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: appointmentId, ratedByUserId, ratedToUserId, score'
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        error: 'La calificación debe estar entre 1 y 5'
      });
    }

    // Verificar si ya calificó
    const alreadyRated = await ScoreModel.hasUserRated(appointmentId, ratedByUserId);
    if (alreadyRated) {
      return res.status(400).json({
        success: false,
        error: 'Ya has calificado esta cita'
      });
    }

    // Crear calificación
    const scoreId = await ScoreModel.createScore(
      appointmentId,
      ratedByUserId,
      ratedToUserId,
      score,
      comment
    );

    res.status(201).json({
      success: true,
      message: 'Calificación creada exitosamente',
      data: { id: scoreId }
    });
  } catch (error) {
    console.error('[ERROR] scoreController.createScore:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la calificación'
    });
  }
};

/**
 * Verificar si un usuario ya calificó
 * GET /api/scores/check/:appointmentId/:userId
 */
export const checkUserRated = async (req, res) => {
  try {
    const { appointmentId, userId } = req.params;

    const hasRated = await ScoreModel.hasUserRated(appointmentId, userId);

    res.json({
      success: true,
      data: { hasRated }
    });
  } catch (error) {
    console.error('[ERROR] scoreController.checkUserRated:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar calificación'
    });
  }
};

/**
 * Obtener calificaciones de una cita
 * GET /api/scores/appointment/:appointmentId
 */
export const getAppointmentScores = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const scores = await ScoreModel.getScoresByAppointment(appointmentId);

    res.json({
      success: true,
      data: scores
    });
  } catch (error) {
    console.error('[ERROR] scoreController.getAppointmentScores:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener calificaciones'
    });
  }
};

/**
 * Obtener promedio de calificaciones de un usuario
 * GET /api/scores/user/:userId/average
 */
export const getUserAverageRating = async (req, res) => {
  try {
    const { userId } = req.params;

    const rating = await ScoreModel.getUserAverageRating(userId);

    res.json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('[ERROR] scoreController.getUserAverageRating:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener promedio de calificaciones'
    });
  }
};
