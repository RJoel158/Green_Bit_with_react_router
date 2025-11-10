/**
 * Report Service - Reportes de materiales y calificaciones
 */
import api from './api';
import { API_ENDPOINTS } from '../config/endpoints';

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

export interface CollectionData {
  date: string;
  count: number;
  color: string;
}

export interface CollectionsReport {
  data: CollectionData[];
  summary: {
    totalCollections: number;
    dayRange: number;
    cdi: number;
    dailyAverage: number;
  };
}

/**
 * Obtener reporte de materiales reciclados
 */
export const getMaterialesReport = async (dateFrom?: string, dateTo?: string, userId?: number): Promise<MaterialReport[]> => {
  try {
    console.log('📊 reportService.getMaterialesReport - Obteniendo...');

    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (userId) params.userId = userId.toString();

    const response = await api.get(API_ENDPOINTS.REPORTS.MATERIALS, { params });
    console.log('✅ reportService.getMaterialesReport - Éxito:', response.data);

    return response.data.data || [];
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

    const params: Record<string, string> = {};
    if (userId) params.userId = userId.toString();

    const response = await api.get(API_ENDPOINTS.REPORTS.SCORES, { params });
    console.log('✅ reportService.getScoresReport - Éxito:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ reportService.getScoresReport - Error:', error);
    return null;
  }
};

/**
 * Obtener reporte de recolecciones completadas
 */
export const getCollectionsReport = async (dateFrom?: string, dateTo?: string): Promise<CollectionsReport | null> => {
  try {
    console.log('🚛 reportService.getCollectionsReport - Obteniendo...');

    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await api.get(API_ENDPOINTS.REPORTS.COLLECTIONS, { params });
    console.log('✅ reportService.getCollectionsReport - Éxito:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ reportService.getCollectionsReport - Error:', error);
    return null;
  }
};
