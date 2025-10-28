/**
 * Report Service - Genera reportes dinámicos desde datos del API
 */
import { apiUrl } from '../config/environment';

export interface MaterialReport {
  name: string;
  percentage: number;
  kg: number;
  color: string;
}

export interface CollectorReport {
  rank: number;
  name: string;
  kg: number;
  percentage: number;
}

export interface CitaReport {
  day: string;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface PuntuacionReport {
  stars: number;
  count: number;
  percentage: number;
  label: string;
}

/**
 * Obtener reporte de materiales reciclados
 */
export const getMaterialesReport = async (dateFrom?: string, dateTo?: string): Promise<MaterialReport[]> => {
  try {
    console.log('📊 reportService.getMaterialesReport - Obteniendo...');

    const url = new URL(apiUrl('/api/reports/materiales'));
    if (dateFrom) url.searchParams.append('dateFrom', dateFrom);
    if (dateTo) url.searchParams.append('dateTo', dateTo);

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
 * Obtener reporte de recolectores top
 */
export const getRecolectoresReport = async (dateFrom?: string, dateTo?: string, limit: number = 5): Promise<CollectorReport[]> => {
  try {
    console.log('📊 reportService.getRecolectoresReport - Obteniendo...');

    const url = new URL(apiUrl('/api/reports/recolectores'));
    if (dateFrom) url.searchParams.append('dateFrom', dateFrom);
    if (dateTo) url.searchParams.append('dateTo', dateTo);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ reportService.getRecolectoresReport - Éxito:', data);

    return data.data || [];
  } catch (error) {
    console.error('❌ reportService.getRecolectoresReport - Error:', error);
    return [];
  }
};

/**
 * Obtener reporte de citas/solicitudes por día
 */
export const getCitasReport = async (dateFrom?: string, dateTo?: string): Promise<CitaReport[]> => {
  try {
    console.log('📊 reportService.getCitasReport - Obteniendo...');

    const url = new URL(apiUrl('/api/reports/citas'));
    if (dateFrom) url.searchParams.append('dateFrom', dateFrom);
    if (dateTo) url.searchParams.append('dateTo', dateTo);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ reportService.getCitasReport - Éxito:', data);

    return data.data || [];
  } catch (error) {
    console.error('❌ reportService.getCitasReport - Error:', error);
    return [];
  }
};

/**
 * Obtener reporte de puntuaciones
 */
export const getPuntuacionesReport = async (dateFrom?: string, dateTo?: string): Promise<PuntuacionReport[]> => {
  try {
    console.log('📊 reportService.getPuntuacionesReport - Obteniendo...');

    const url = new URL(apiUrl('/api/reports/puntuaciones'));
    if (dateFrom) url.searchParams.append('dateFrom', dateFrom);
    if (dateTo) url.searchParams.append('dateTo', dateTo);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ reportService.getPuntuacionesReport - Éxito:', data);

    return data.data || [];
  } catch (error) {
    console.error('❌ reportService.getPuntuacionesReport - Error:', error);
    return [];
  }
};

/**
 * Generar y descargar PDF de un reporte
 */
export const downloadReportPDF = async (reportType: string, dateFrom?: string, dateTo?: string): Promise<void> => {
  try {
    console.log('📥 reportService.downloadReportPDF - Descargando:', reportType);

    const url = new URL(apiUrl(`/api/reports/${reportType}/pdf`));
    if (dateFrom) url.searchParams.append('dateFrom', dateFrom);
    if (dateTo) url.searchParams.append('dateTo', dateTo);

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // Descargar el archivo
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    console.log('✅ reportService.downloadReportPDF - Descargado');
  } catch (error) {
    console.error('❌ reportService.downloadReportPDF - Error:', error);
    throw error;
  }
};
