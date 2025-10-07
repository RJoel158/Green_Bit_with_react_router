# GreenBit Recycling Platform - Configuración

## 📋 Requisitos Previos

- Node.js 16+
- MySQL 8.0+
- Git

## 🔧 Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/RJoel158/Green_Bit_with_react_router.git
cd Green_Bit_with_react_router
```

### 2. Configuración del Backend

#### Instalar Dependencias

```bash
cd back
npm install
```

#### Configurar Variables de Entorno

Copiar el archivo `.env.example` a `.env` y configurar las variables:

```bash
cp .env.example .env
```

#### Variables de Entorno del Backend (`.env`)

```env
# === CONFIGURACIÓN DE BASE DE DATOS ===
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=greenbit_db

# === CONFIGURACIÓN DEL SERVIDOR ===
PORT=3000
HOST=localhost
NODE_ENV=development

# === CONFIGURACIÓN DE CORS ===
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# === CONFIGURACIÓN DE ARCHIVOS ===
UPLOAD_DIRECTORY=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.jpg,.jpeg,.png,.webp,.gif
MAX_FILES_PER_REQUEST=10

# === CONFIGURACIÓN DE EMAIL ===
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
EMAIL_FROM_NAME=GreenBit Platform
EMAIL_FROM_ADDRESS=noreply@greenbit.com

# === CONFIGURACIÓN DE SEGURIDAD ===
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=tu_session_secret_muy_seguro_aqui

# === CONFIGURACIÓN DE LOGS ===
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
```

#### Crear Base de Datos

```sql
CREATE DATABASE greenbit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```



#### Iniciar Servidor Backend

```bash
npm start
# o para desarrollo
npm run dev
```

### 3. Configuración del Frontend

#### Instalar Dependencias

```bash
cd ../front
npm install
```

#### Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `front`:

#### Variables de Entorno del Frontend (`.env`)

```env
# === INFORMACIÓN DE LA APLICACIÓN ===
VITE_APP_NAME=GreenBit Recycling
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development

# === CONFIGURACIÓN DEL API ===
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# === CONFIGURACIÓN DE MAPAS ===
VITE_DEFAULT_MAP_CENTER_LAT=-17.393
VITE_DEFAULT_MAP_CENTER_LNG=-66.157
VITE_DEFAULT_MAP_ZOOM=14
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>

# === CONFIGURACIÓN DE ARCHIVOS ===
VITE_MAX_UPLOAD_SIZE=10485760
VITE_ALLOWED_IMAGE_EXTENSIONS=.jpg,.jpeg,.png,.webp,.gif
VITE_MAX_IMAGES_PER_REQUEST=10

# === CONFIGURACIÓN DE UI ===
VITE_ITEMS_PER_PAGE=20
VITE_DEBOUNCE_DELAY=300
VITE_TOAST_DURATION=3000

# === CONFIGURACIÓN DE CLUSTERING ===
VITE_CLUSTER_MAX_DISTANCE=100
VITE_CLUSTER_MIN_ZOOM=10
VITE_CLUSTER_MAX_ZOOM=18

# === CONFIGURACIÓN DE DESARROLLO ===
VITE_ENABLE_DEBUG_LOGS=true
VITE_SHOW_DEBUG_INFO=true
```

#### Iniciar Servidor Frontend

```bash
npm run dev
```

## 🚀 Estructura del Proyecto

```
Green_Bit_with_react_router/
├── back/                     # Backend (Node.js + Express)
│   ├── config/              # Configuración de BD
│   ├── Controllers/         # Controladores del API
│   ├── Models/              # Modelos de datos
│   ├── Routes/              # Rutas del API
│   ├── Services/            # Servicios (email, etc.)
│   ├── uploads/             # Archivos subidos
│   ├── .env                 # Variables de entorno
│   ├── .gitignore          # Archivos ignorados por Git
│   └── server.js           # Punto de entrada
├── front/                   # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── config/          # Configuración centralizada
│   │   ├── assets/          # Recursos estáticos
│   │   └── ...
│   ├── .env                 # Variables de entorno
│   ├── .gitignore          # Archivos ignorados por Git
│   └── package.json        # Dependencias
└── README.md               # Este archivo
```

## 🔐 Seguridad

### Archivos Protegidos

Los archivos `.env` están incluidos en `.gitignore` para proteger información sensible como:

- Credenciales de base de datos
- Claves JWT
- Configuración de email
- Secretos de sesión

### Configuración Recomendada para Producción

- Cambiar `NODE_ENV=production`
- Usar contraseñas seguras para JWT y sesiones
- Configurar HTTPS
- Usar base de datos remota segura
- Configurar firewall y límites de tasa

## 🗺️ Funciones Principales

### Mapa de Puntos de Reciclaje

- **Clustering inteligente**: Agrupa marcadores cercanos
- **Carga optimizada**: Solo muestra puntos relevantes según zoom
- **Información detallada**: Nombre de materiales, descripciones
- **Carrusel de imágenes**: Visualización de fotos subidas

### Gestión de Solicitudes

- **Creación de requests**: Con ubicación, material, imágenes
- **Programación de recolección**: Modal con calendario
- **Estados de seguimiento**: Pendiente, programado, completado

## 🛠️ Comandos Útiles

### Backend

```bash
cd back
npm install          # Instalar dependencias
npm start           # Iniciar servidor
npm run dev         # Desarrollo con auto-reload
npm test            # Ejecutar pruebas
```

### Frontend

```bash
cd front
npm install          # Instalar dependencias
npm run dev         # Servidor de desarrollo
npm run build       # Construir para producción
npm run preview     # Previsualizar build
npm run lint        # Verificar código
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a BD**

   - Verificar que MySQL esté ejecutándose
   - Confirmar credenciales en `.env`
   - Verificar que la base de datos exista

2. **CORS Errors**

   - Verificar `CORS_ORIGIN` en backend `.env`
   - Confirmar que URLs coincidan entre frontend y backend

3. **Imágenes no se cargan**

   - Verificar permisos de la carpeta `uploads/`
   - Confirmar `UPLOAD_DIRECTORY` en `.env`
   - Verificar configuración de archivos estáticos

4. **Mapa no aparece**
   - Verificar variables de entorno del mapa
   - Confirmar conexión a internet para tiles
   - Revisar configuración de centro y zoom

## 📝 Logs y Debug

### Activar Debug Logs

En el frontend, configurar:

```env
VITE_ENABLE_DEBUG_LOGS=true
VITE_SHOW_DEBUG_INFO=true
```

En el backend:

```env
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Contacto

- **Proyecto**: GreenBit Recycling Platform
- **Repositorio**: https://github.com/RJoel158/Green_Bit_with_react_router
- **Issues**: https://github.com/RJoel158/Green_Bit_with_react_router/issues
