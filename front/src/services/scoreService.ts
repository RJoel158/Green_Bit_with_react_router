import { apiUrl } from '../config/environment';

export interface CreateScoreData {
  appointmentId: number;
  ratedByUserId: number;
  ratedToUserId: number;
  score: number;
  comment?: string;
}

export interface Score {
  id: number;
  appointmentConfirmationId: number;
  ratedByUserId: number;
  ratedToUserId: number;
  score: number;
  comment: string | null;
  createdDate: string;
  state: number;
  raterName: string;
  ratedName: string;
}

export interface UserRating {
  totalRatings: number;
  averageScore: number;
}

/**
 * Crear una calificación
 */
export const createScore = async (scoreData: CreateScoreData) => {
  try {
    const response = await fetch(apiUrl('/api/scores'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scoreData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear calificación');
    }

    return await response.json();
  } catch (error) {
    console.error('[scoreService] Error creating score:', error);
    throw error;
  }
};

/**
 * Verificar si un usuario ya calificó una cita
 */
export const checkUserRated = async (appointmentId: number, userId: number): Promise<boolean> => {
  try {
    const response = await fetch(apiUrl(`/api/scores/check/${appointmentId}/${userId}`));
    
    if (!response.ok) {
      throw new Error('Error al verificar calificación');
    }

    const data = await response.json();
    return data.data.hasRated;
  } catch (error) {
    console.error('[scoreService] Error checking if user rated:', error);
    return false;
  }
};

/**
 * Obtener calificaciones de una cita
 */
export const getAppointmentScores = async (appointmentId: number): Promise<Score[]> => {
  try {
    const response = await fetch(apiUrl(`/api/scores/appointment/${appointmentId}`));
    
    if (!response.ok) {
      throw new Error('Error al obtener calificaciones');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('[scoreService] Error getting appointment scores:', error);
    return [];
  }
};

/**
 * Obtener promedio de calificaciones de un usuario
 */
export const getUserAverageRating = async (userId: number): Promise<UserRating> => {
  try {
    const response = await fetch(apiUrl(`/api/scores/user/${userId}/average`));
    
    if (!response.ok) {
      throw new Error('Error al obtener promedio de calificación');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('[scoreService] Error getting user average rating:', error);
    return { totalRatings: 0, averageScore: 0 };
  }
};
