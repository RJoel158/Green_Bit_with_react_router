/**
 * Report Service - Reportes de materiales y calificaciones
 */
import { apiUrl } from '../config/environment';

export interface MaterialReport {
  name: string;
  percentage: number;
  kg: number;
  color: string;
}

export interface ScoreDetail {
  id: number;
  score: number;
  comment: string;
  createdDate: string;
  ratedByUserId: number;
  ratedToUserId: number;
  ratedByUsername: string;
  ratedToUsername: string;
}

export interface ScoresReport {
  count_1: number;
  count_2: number;
  count_3: number;
  count_4: number;
  count_5: number;
  total: number;
  average: number;
  details: ScoreDetail[];
}

/**
 * Obtener reporte de materiales reciclados
 */
export const getMaterialesReport = async (dateFrom?: string, dateTo?: string, userId?: number): Promise<MaterialReport[]> => {
  try {
    console.log('📊 reportService.getMaterialesReport - Obteniendo...');

    const url = new URL(apiUrl('/api/reports/materiales'));
    if (dateFrom) url.searchParams.append('dateFrom', dateFrom);
    if (dateTo) url.searchParams.append('dateTo', dateTo);
    if (userId) url.searchParams.append('userId', userId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ reportService.getMaterialesReport - Éxito:', data);

    return data.data || [];
  } catch (error) {
    console.error('❌ reportService.getMaterialesReport - Error:', error);
    return [];
  }
};

/**
 * Obtener reporte de calificaciones (scores)
 */
export const getScoresReport = async (userId?: number): Promise<ScoresReport | null> => {
  try {
    console.log('⭐ reportService.getScoresReport - Obteniendo...');

    const url = new URL(apiUrl('/api/reports/scores'));
    if (userId) url.searchParams.append('userId', userId.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ reportService.getScoresReport - Éxito:', data);

    return data;
  } catch (error) {
    console.error('❌ reportService.getScoresReport - Error:', error);
    return null;
  }
};
