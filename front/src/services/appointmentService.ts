// services/appointmentService.ts
import api from './api';
import { API_ENDPOINTS } from '../config/endpoints';

export interface Appointment {
  id: number;
  idRequest: number;
  acceptedDate: string;
  collectorId: number;
  acceptedHour: string;
  state: number;
  description: string;
  materialId: number;
  recyclerId?: number;
  recyclerName?: string;
  recyclerPhone?: string;
  recyclerEmail?: string;
  collectorName?: string;
  collectorPhone?: string;
  collectorEmail?: string;
  materialName?: string;
}

// Obtener appointments por collector y estado
export const getAppointmentsByCollector = async (
  collectorId: number, 
  state?: number, 
  limit?: number
): Promise<Appointment[]> => {
  try {
    const params = new URLSearchParams();
    
    if (state !== undefined) {
      params.append('state', state.toString());
    }
    if (limit !== undefined) {
      params.append('limit', limit.toString());
    }
    
    const url = API_ENDPOINTS.APPOINTMENTS.GET_BY_COLLECTOR(collectorId);
    const queryString = params.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await api.get<{ success: boolean; data: Appointment[] }>(fullUrl);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching appointments by collector:', error);
    throw error;
  }
};

// Obtener appointments por recycler y estado
export const getAppointmentsByRecycler = async (
  recyclerId: number, 
  state?: number, 
  limit?: number
): Promise<Appointment[]> => {
  try {
    const params = new URLSearchParams();
    
    if (state !== undefined) {
      params.append('state', state.toString());
    }
    if (limit !== undefined) {
      params.append('limit', limit.toString());
    }
    
    const url = API_ENDPOINTS.APPOINTMENTS.GET_BY_RECYCLER(recyclerId);
    const queryString = params.toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await api.get<{ success: boolean; data: Appointment[] }>(fullUrl);
    return response.data.success ? response.data.data : [];
  } catch (error) {
    console.error('Error fetching appointments by recycler:', error);
    throw error;
  }
};