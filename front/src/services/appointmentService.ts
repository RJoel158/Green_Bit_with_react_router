// services/appointmentService.ts
import { apiUrl } from '../config/environment';

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
  collectorName?: string;
  materialName?: string;
}

// Obtener appointments por collector y estado
export const getAppointmentsByCollector = async (
  collectorId: number, 
  state?: number, 
  limit?: number
): Promise<Appointment[]> => {
  try {
    let url = apiUrl(`/api/appointments/collector/${collectorId}`);
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
    let url = apiUrl(`/api/appointments/recycler/${recyclerId}`);
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
    console.error('Error fetching appointments by recycler:', error);
    throw error;
  }
};