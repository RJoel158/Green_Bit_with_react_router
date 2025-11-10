// services/requestService.ts
import api from './api';
import { API_ENDPOINTS } from '../config/endpoints';

export interface Request {
  id: number;
  idUser: number;
  description: string;
  state: number;
  registerDate: string;
  materialId: number;
  latitude?: number;
  longitude?: number;
  modificationDate: string;
  materialName?: string;
  userName?: string;
}

// Obtener requests por usuario y estado
export const getRequestsByUserAndState = async (
  userId: number, 
  state?: number, 
  limit?: number
): Promise<Request[]> => {
  try {
    const params: Record<string, string> = {};
    
    if (state !== undefined) {
      params.state = state.toString();
    }
    if (limit !== undefined) {
      params.limit = limit.toString();
    }
    
    const response = await api.get(API_ENDPOINTS.REQUESTS.GET_BY_USER_STATE(userId), { params });
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching requests by user and state:', error);
    throw error;
  }
};