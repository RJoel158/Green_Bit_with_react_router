/**
 * Material Service - Consume API endpoints de materiales
 * Usa configuración centralizada de Vite (import.meta.env) desde config/environment
 */
import { apiUrl, config } from '../config/environment';

export interface Material {
  id: number;
  name: string;
  description: string;
  createdDate?: string;
  state?: number;
  modifiedBy?: number;
  modifiedDate?: string;
}

// Construimos la URL base del recurso materiales usando los helpers centralizados
const MATERIAL_API = apiUrl(config.api.endpoints.materials);

/**
 * Obtener todos los materiales activos (state=1)
 */
export const getAllMaterials = async (): Promise<Material[]> => {
  try {
    console.log('📥 materialService.getAllMaterials - Llamando:', MATERIAL_API);

    const response = await fetch(MATERIAL_API, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ materialService.getAllMaterials - Materiales obtenidos:', data.data || data);

    return data.data || data;
  } catch (error) {
    console.error('❌ materialService.getAllMaterials - Error:', error);
    throw error;
  }
};

/**
 * Obtener un material por ID
 */
export const getMaterialById = async (id: number): Promise<Material> => {
  try {
    console.log(`📥 materialService.getMaterialById - Llamando: ${MATERIAL_API}/${id}`);

    const response = await fetch(`${MATERIAL_API}/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ materialService.getMaterialById - Material obtenido:', data);

    return data;
  } catch (error) {
    console.error('❌ materialService.getMaterialById - Error:', error);
    throw error;
  }
};

/**
 * Crear un nuevo material
 */
export const createMaterial = async (name: string, description: string): Promise<{ id: number } & Record<string, any>> => {
  try {
    console.log('➕ materialService.createMaterial - Creando:', { name, description });

    const response = await fetch(MATERIAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ materialService.createMaterial - Material creado:', data);

    return data;
  } catch (error) {
    console.error('❌ materialService.createMaterial - Error:', error);
    throw error;
  }
};

/**
 * Actualizar un material existente
 */
export const updateMaterial = async (
  id: number,
  name: string,
  description: string,
  state?: number
): Promise<void> => {
  try {
    console.log('✏️ materialService.updateMaterial - Parámetros recibidos:', { id, name, description, state });
    console.log('✏️ materialService.updateMaterial - ID type:', typeof id, '| ID value:', id);
    
    const url = `${MATERIAL_API}/${id}`;
    console.log('✏️ materialService.updateMaterial - URL completa:', url);

    const body: any = { name, description };
    if (state !== undefined) body.state = state;

    console.log('✏️ materialService.updateMaterial - Body a enviar:', body);

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ materialService.updateMaterial - Material actualizado:', data);
  } catch (error) {
    console.error('❌ materialService.updateMaterial - Error:', error);
    throw error;
  }
};

/**
 * Eliminar un material (soft delete - state = 0)
 */
export const deleteMaterial = async (id: number): Promise<void> => {
  try {
    console.log('🗑️ materialService.deleteMaterial - Eliminando:', id);

    const response = await fetch(`${MATERIAL_API}/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ materialService.deleteMaterial - Material eliminado:', data);
  } catch (error) {
    console.error('❌ materialService.deleteMaterial - Error:', error);
    throw error;
  }
};
