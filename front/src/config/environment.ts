// src/config/environment.ts
/**
 * Configuración de variables de entorno para el frontend
 * Centraliza todas las variables de entorno en un solo lugar
 */

// Validar que las variables requeridas estén presentes
const requiredEnvVars = ['VITE_API_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variables de entorno requeridas faltantes:', missingEnvVars);
}

export const config = {
  // Información de la aplicación
  app: {
    name: import.meta.env.VITE_APP_NAME || 'GreenBit Recycling',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
  },

  // Configuración del API
  api: {
    baseUrl: import.meta.env.VITE_API_URL,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    endpoints: {
      requests: '/api/request',
      materials: '/api/material',
      announcements: '/api/announcement',
      upload: '/api/upload',
      users: '/api/users',
      health: '/health',
      dbStatus: '/api/db-status',
    }
  },

  // Configuración de mapas
  map: {
    defaultCenter: {
      lat: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT || '-17.393'),
      lng: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG || '-66.157'),
    },
    defaultZoom: parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || '14'),
    tileUrl: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  },

  // Configuración de archivos
  files: {
    maxUploadSize: parseInt(import.meta.env.VITE_MAX_UPLOAD_SIZE || '10485760'), // 10MB
    allowedImageExtensions: (import.meta.env.VITE_ALLOWED_IMAGE_EXTENSIONS || '.jpg,.jpeg,.png,.webp,.gif').split(','),
    maxImagesPerRequest: parseInt(import.meta.env.VITE_MAX_IMAGES_PER_REQUEST || '10'),
  },

  // Configuración de UI
  ui: {
    itemsPerPage: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE || '20'),
    debounceDelay: parseInt(import.meta.env.VITE_DEBOUNCE_DELAY || '300'),
    toastDuration: parseInt(import.meta.env.VITE_TOAST_DURATION || '3000'),
  },

  // Configuración de clustering
  clustering: {
    maxDistance: parseInt(import.meta.env.VITE_CLUSTER_MAX_DISTANCE || '100'),
    minZoom: parseInt(import.meta.env.VITE_CLUSTER_MIN_ZOOM || '10'),
    maxZoom: parseInt(import.meta.env.VITE_CLUSTER_MAX_ZOOM || '18'),
  },

  // Configuración de desarrollo
  dev: {
    enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    showDebugInfo: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
  }
};

// Función helper para construir URLs del API
export const apiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

// Función helper para logging con control de entorno
export const debugLog = (message: string, data?: any): void => {
  if (config.dev.enableDebugLogs) {
    console.log(`[${config.app.name}] ${message}`, data || '');
  }
};

// Exportar configuración por defecto
export default config;