import api from './api';
import { API_ENDPOINTS } from '../config/endpoints';

console.log('[announcementService] Using centralized API');

// Obtener todos los anuncios
export const getAllAnnouncements = async () => {
  try {
    console.log('[announcementService] Obteniendo todos los anuncios');
    const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.GET_ALL);
    console.log('[announcementService] Anuncios obtenidos:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('[announcementService] Error en getAllAnnouncements:', error);
    throw error;
  }
};

// Obtener anuncio por ID
export const getAnnouncementById = async (id: number) => {
  try {
    console.log('[announcementService] Obteniendo anuncio:', id);
    const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.GET_BY_ID(id));
    console.log('[announcementService] Anuncio obtenido:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('[announcementService] Error en getAnnouncementById:', error);
    throw error;
  }
};

// Crear anuncio
export const createAnnouncement = async (title: string, imagePath: string, targetRole: string, createdBy: number) => {
  try {
    console.log('[announcementService] Creando anuncio:', { title, imagePath, targetRole, createdBy });
    
    const response = await api.post(API_ENDPOINTS.ANNOUNCEMENTS.CREATE, {
      title,
      imagePath,
      targetRole,
      createdBy
    });

    console.log('[announcementService] Anuncio creado:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('[announcementService] Error en createAnnouncement:', error);
    throw error;
  }
};

// Actualizar anuncio
export const updateAnnouncement = async (id: number, title: string, imagePath: string, targetRole: string, state: number) => {
  try {
    console.log('[announcementService] Actualizando anuncio:', { id, title, imagePath, targetRole, state });
    
    const response = await api.put(API_ENDPOINTS.ANNOUNCEMENTS.UPDATE(id), {
      title,
      imagePath,
      targetRole,
      state
    });

    console.log('[announcementService] Anuncio actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('[announcementService] Error en updateAnnouncement:', error);
    throw error;
  }
};

// Eliminar anuncio
export const deleteAnnouncement = async (id: number) => {
  try {
    console.log('[announcementService] Eliminando anuncio:', id);
    
    const response = await api.delete(API_ENDPOINTS.ANNOUNCEMENTS.DELETE(id));

    console.log('[announcementService] Anuncio eliminado:', response.data);
    return response.data;
  } catch (error) {
    console.error('[announcementService] Error en deleteAnnouncement:', error);
    throw error;
  }
};

// Obtener anuncios por rol
export const getAnnouncementsByRole = async (targetRole: string) => {
  try {
    console.log('[announcementService] Obteniendo anuncios por rol:', targetRole);
    
    const response = await api.get(API_ENDPOINTS.ANNOUNCEMENTS.GET_BY_ROLE(targetRole));

    console.log('[announcementService] Anuncios obtenidos por rol:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('[announcementService] Error en getAnnouncementsByRole:', error);
    throw error;
  }
};
