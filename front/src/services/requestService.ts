// services/requestService.ts
import { apiUrl } from '../config/environment';

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
    let url = apiUrl(`/api/request/user/${userId}/state`);
    const params = new URLSearchParams();
    
    if (state !== undefined) {
      params.append('state', state.toString());
    }
    if (limit !== undefined) {
      params.append('limit', limit.toString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching requests by user and state:', error);
    throw error;
  }
};