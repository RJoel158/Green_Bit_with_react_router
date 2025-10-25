import { apiUrl, config } from '../config/environment';

const ANNOUNCEMENT_API = apiUrl(config.api.endpoints.announcements);

console.log('[announcementService] API Base URL:', ANNOUNCEMENT_API);

// Obtener todos los anuncios
export const getAllAnnouncements = async () => {
  try {
    console.log('[announcementService] Obteniendo todos los anuncios');
    const response = await fetch(`${ANNOUNCEMENT_API}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[announcementService] Anuncios obtenidos:', data.data);
    return data.data;
  } catch (error) {
    console.error('[announcementService] Error en getAllAnnouncements:', error);
    throw error;
  }
};

// Obtener anuncio por ID
export const getAnnouncementById = async (id: number) => {
  try {
    console.log('[announcementService] Obteniendo anuncio:', id);
    const response = await fetch(`${ANNOUNCEMENT_API}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[announcementService] Anuncio obtenido:', data.data);
    return data.data;
  } catch (error) {
    console.error('[announcementService] Error en getAnnouncementById:', error);
    throw error;
  }
};

// Crear anuncio
export const createAnnouncement = async (title: string, imagePath: string, targetRole: string, createdBy: number) => {
  try {
    console.log('[announcementService] Creando anuncio:', { title, imagePath, targetRole, createdBy });
    
    const response = await fetch(`${ANNOUNCEMENT_API}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        imagePath,
        targetRole,
        createdBy
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[announcementService] Anuncio creado:', data);
    return data.data;
  } catch (error) {
    console.error('[announcementService] Error en createAnnouncement:', error);
    throw error;
  }
};

// Actualizar anuncio
export const updateAnnouncement = async (id: number, title: string, imagePath: string, targetRole: string, state: number) => {
  try {
    console.log('[announcementService] Actualizando anuncio:', { id, title, imagePath, targetRole, state });
    
    const response = await fetch(`${ANNOUNCEMENT_API}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        imagePath,
        targetRole,
        state
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[announcementService] Anuncio actualizado:', data);
    return data;
  } catch (error) {
    console.error('[announcementService] Error en updateAnnouncement:', error);
    throw error;
  }
};

// Eliminar anuncio
export const deleteAnnouncement = async (id: number) => {
  try {
    console.log('[announcementService] Eliminando anuncio:', id);
    
    const response = await fetch(`${ANNOUNCEMENT_API}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[announcementService] Anuncio eliminado:', data);
    return data;
  } catch (error) {
    console.error('[announcementService] Error en deleteAnnouncement:', error);
    throw error;
  }
};

// Obtener anuncios por rol
export const getAnnouncementsByRole = async (targetRole: string) => {
  try {
    console.log('[announcementService] Obteniendo anuncios por rol:', targetRole);
    
    const response = await fetch(`${ANNOUNCEMENT_API}/role/${targetRole}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[announcementService] Anuncios obtenidos por rol:', data.data);
    return data.data;
  } catch (error) {
    console.error('[announcementService] Error en getAnnouncementsByRole:', error);
    throw error;
  }
};
