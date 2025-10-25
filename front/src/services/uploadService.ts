import { apiUrl, config } from '../config/environment';

const UPLOAD_API = apiUrl(config.api.endpoints.upload || '/api/upload');

console.log('[uploadService] API Base URL:', UPLOAD_API);

// Subir imagen de anuncio
export const uploadAnnouncementImage = async (file: File) => {
  try {
    console.log('[uploadService] Subiendo imagen de anuncio:', file.name, 'Tamaño:', file.size);
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${UPLOAD_API}/announcement`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Error HTTP: ${response.status}`;
      console.error('[uploadService] Error en respuesta:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[uploadService] Imagen subida correctamente:', data);
    
    // Retornar los datos de la imagen
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error('Respuesta inválida del servidor');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido al subir imagen';
    console.error('[uploadService] Error en uploadAnnouncementImage:', message);
    throw new Error(message);
  }
};

// Obtener información de imagen
export const getAnnouncementImageInfo = async (filename: string) => {
  try {
    console.log('[uploadService] Obteniendo info de imagen:', filename);
    
    const response = await fetch(`${UPLOAD_API}/announcement/${filename}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[uploadService] Info de imagen obtenida:', data);
    return data.data;
  } catch (error) {
    console.error('[uploadService] Error en getAnnouncementImageInfo:', error);
    throw error;
  }
};

// Eliminar imagen
export const deleteAnnouncementImage = async (filename: string) => {
  try {
    console.log('[uploadService] Eliminando imagen:', filename);
    
    const response = await fetch(`${UPLOAD_API}/announcement/${filename}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('[uploadService] Imagen eliminada:', data);
    return data;
  } catch (error) {
    console.error('[uploadService] Error en deleteAnnouncementImage:', error);
    throw error;
  }
};
