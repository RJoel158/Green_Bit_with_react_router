// Controllers/requestController.js
import * as RequestModel from "../Models/Forms/requestModel.js";
import * as ImageModel from "../Models/Forms/imageModel.js";
import * as ScheduleModel from "../Models/Forms/scheduleModel.js";
import { REQUEST_STATE } from "../shared/constants.js";
import db from "../Config/DBConnect.js";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de multer para subida de archivos usando variables de entorno
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || (5 * 1024 * 1024); // 5MB por defecto
const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg').split(',');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, `../${uploadDir}/images/`));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'request-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Solo se permiten archivos de imagen: ${allowedImageTypes.join(', ')}`), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize,
    files: 10 // máximo 10 archivos
  },
  fileFilter: fileFilter
});

/**
 * Mapear días del frontend a campos de la base de datos
 */
const mapDayToDbField = (day) => {
  const dayMapping = {
    'lun': 'monday',
    'mar': 'tuesday', 
    'mie': 'wednesday',
    'jue': 'thursday',
    'vie': 'friday',
    'sab': 'saturday',
    'dom': 'sunday'
  };
  return dayMapping[day] || null;
};

/**
 * Crear una nueva solicitud de reciclaje con imágenes y horarios
 */
export const createRequest = async (req, res) => {
  const conn = await db.getConnection();
  
  try {
    const { 
      idUser, 
      description, 
      materialId, 
      latitude, 
      longitude, 
      state = REQUEST_STATE.OPEN, // Por defecto OPEN (1) para que aparezca en el mapa
      availableDays,
      timeFrom,
      timeTo
    } = req.body;
    
    console.log("[INFO] createRequest controller called:", { 
      idUser, 
      description, 
      materialId, 
      latitude, 
      longitude, 
      state,
      availableDays,
      timeFrom,
      timeTo,
      files: req.files ? req.files.length : 0
    });

    // Validaciones básicas
    if (!idUser || isNaN(parseInt(idUser))) {
      return res.status(400).json({
        success: false,
        error: "ID de usuario requerido y debe ser válido"
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "La descripción es requerida"
      });
    }

    if (!materialId || isNaN(parseInt(materialId))) {
      return res.status(400).json({
        success: false,
        error: "ID de material requerido y debe ser válido"
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Debes subir al menos una imagen"
      });
    }

    // Validar horarios
    if (!timeFrom || !timeTo) {
      return res.status(400).json({
        success: false,
        error: "Horario de inicio y fin son requeridos"
      });
    }

    // Validar días disponibles
    let parsedDays = [];
    try {
      parsedDays = typeof availableDays === 'string' ? JSON.parse(availableDays) : availableDays;
      if (!Array.isArray(parsedDays) || parsedDays.length === 0) {
        throw new Error('Días disponibles requeridos');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: "Debes seleccionar al menos un día disponible"
      });
    }

    await conn.beginTransaction();

    try {
      // 1. Crear la solicitud principal
      const requestId = await RequestModel.create(
        conn,
        parseInt(idUser),
        description.trim(),
        parseInt(materialId),
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        state
      );

      console.log("[INFO] Request created with ID:", requestId);

      // 2. Guardar las imágenes
      const imagePaths = req.files.map(file => `/uploads/images/${file.filename}`);
      const imageIds = await ImageModel.createMultiple(conn, requestId, imagePaths);

      console.log("[INFO] Images created:", { count: imageIds.length, ids: imageIds });

      // 3. Crear el horario
      const dayValues = {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      };

      // Mapear días seleccionados
      parsedDays.forEach(day => {
        const dbField = mapDayToDbField(day);
        if (dbField) {
          dayValues[dbField] = 1;
        }
      });

      const scheduleId = await ScheduleModel.create(
        conn,
        timeFrom, // start_hour
        timeTo,   // end_hour
        dayValues.monday,
        dayValues.tuesday,
        dayValues.wednesday,
        dayValues.thursday,
        dayValues.friday,
        dayValues.saturday,
        dayValues.sunday,
        requestId
      );

      console.log("[INFO] Schedule created with ID:", scheduleId);

      await conn.commit();

      res.status(201).json({
        success: true,
        id: requestId,
        message: "Solicitud creada exitosamente",
        data: {
          requestId,
          imageIds,
          scheduleId,
          imagePaths
        }
      });

    } catch (err) {
      await conn.rollback();
      throw err;
    }

  } catch (error) {
    console.error("[ERROR] createRequest controller:", {
      body: req.body,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    let errorMessage = "Error al crear la solicitud";
    let statusCode = 500;

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = "Usuario o material no válido";
      statusCode = 400;
    } else if (error.message.includes('Solo se permiten archivos de imagen')) {
      errorMessage = "Solo se permiten archivos de imagen";
      statusCode = 400;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    conn.release();
  }
};

/**
 * Obtener todas las solicitudes con imágenes y horarios
 */
export const getAllRequests = async (req, res) => {
  try {
    console.log("[INFO] getAllRequests controller called");
    
    const requests = await RequestModel.getAll();
    
    // Obtener imágenes y horarios para cada solicitud
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const [images, schedule] = await Promise.all([
          ImageModel.getByRequestId(request.id),
          ScheduleModel.getByRequestId(request.id)
        ]);
        
        return {
          ...request,
          images,
          schedule
        };
      })
    );
    
    res.json({
      success: true,
      data: requestsWithDetails
    });
    
  } catch (error) {
    console.error("[ERROR] getAllRequests controller:", {
      message: error.message,
      stack: error.stack,
    });
    
    // Si hay problemas de conectividad con la base de datos, devolver datos mock
    if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log("[FALLBACK] Devolviendo datos mock debido a problemas de conectividad DB");
      
      const mockRequests = [
        {
          id: 1,
          idUser: 71,
          description: "vxfv fx",
          state: 1,
          registerDate: "2025-09-27T22:26:43Z",
          materialId: 19,
          latitude: -17.393577,
          longitude: -66.138159,
          modificationDate: null,
          images: [
            { id: 1, requestId: 1, imagePath: "/uploads/images/cardboard-sample.jpg" }
          ],
          schedule: {
            id: 1,
            requestId: 1,
            monday: 1,
            tuesday: 1,
            wednesday: 1,
            thursday: 0,
            friday: 1,
            saturday: 0,
            sunday: 0,
            timeFrom: "08:00",
            timeTo: "17:00"
          }
        },
        {
          id: 2,
          idUser: 71,
          description: "hola joel",
          state: 1,
          registerDate: "2025-09-27T22:43:51Z",
          materialId: 6,
          latitude: -17.388354,
          longitude: -66.155707,
          modificationDate: null,
          images: [
            { id: 2, requestId: 2, imagePath: "/uploads/images/plastic-bottles.jpg" }
          ],
          schedule: {
            id: 2,
            requestId: 2,
            monday: 0,
            tuesday: 1,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1,
            sunday: 0,
            timeFrom: "09:00",
            timeTo: "18:00"
          }
        },
        {
          id: 4,
          idUser: 71,
          description: "hola joel x2",
          state: 0,
          registerDate: "2025-09-27T23:23:26Z",
          materialId: 18,
          latitude: -17.389161,
          longitude: -66.145226,
          modificationDate: null,
          images: [
            { id: 3, requestId: 3, imagePath: "/uploads/images/aluminum-cans.jpg" }
          ],
          schedule: {
            id: 3,
            requestId: 3,
            monday: 1,
            tuesday: 1,
            wednesday: 0,
            thursday: 1,
            friday: 1,
            saturday: 0,
            sunday: 1,
            timeFrom: "07:00",
            timeTo: "16:00"
          }
        },
        {
          id: 5,
          idUser: 71,
          description: "cdscdsc",
          state: 1,
          registerDate: "2025-09-30T22:19:15Z",
          materialId: 20,
          latitude: -17.392322,
          longitude: -66.154987,
          modificationDate: null,
          images: [
            { id: 4, requestId: 4, imagePath: "/uploads/images/glass-bottles.jpg" }
          ],
          schedule: {
            id: 4,
            requestId: 4,
            monday: 1,
            tuesday: 0,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1,
            sunday: 0,
            timeFrom: "10:00",
            timeTo: "19:00"
          }
        }
      ];
      
      return res.json({
        success: true,
        data: mockRequests,
        fallback: true,
        message: "Datos de demostración - problemas de conectividad con BD"
      });
    }
    
    res.status(500).json({
      success: false,
      error: "Error al obtener solicitudes",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener solicitudes por usuario con imágenes y horarios
 */
export const getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log("[INFO] getUserRequests controller called with userId:", userId);
    
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        error: "ID de usuario inválido"
      });
    }
    
    const requests = await RequestModel.getByUserId(parseInt(userId));
    
    // Obtener imágenes y horarios para cada solicitud
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const [images, schedule] = await Promise.all([
          ImageModel.getByRequestId(request.id),
          ScheduleModel.getByRequestId(request.id)
        ]);
        
        return {
          ...request,
          images,
          schedule
        };
      })
    );
    
    res.json({
      success: true,
      data: requestsWithDetails
    });
    
  } catch (error) {
    console.error("[ERROR] getUserRequests controller:", {
      userId: req.params.userId,
      message: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al obtener solicitudes del usuario",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener solicitud por ID con imágenes y horarios
 */
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("[INFO] getRequestById controller called with id:", id);
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de solicitud inválido"
      });
    }
    
    const request = await RequestModel.getById(parseInt(id));
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: "Solicitud no encontrada"
      });
    }

    // Obtener imágenes y horarios
    const [images, schedule] = await Promise.all([
      ImageModel.getByRequestId(request.id),
      ScheduleModel.getByRequestId(request.id)
    ]);
    
    res.json({
      success: true,
      data: {
        ...request,
        images,
        schedule
      }
    });
    
  } catch (error) {
    console.error("[ERROR] getRequestById controller:", {
      id: req.params.id,
      message: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al obtener solicitud",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar estado de solicitud
 */
export const updateRequestState = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;
    
    console.log("[INFO] updateRequestState controller called:", { id, state });
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de solicitud inválido"
      });
    }
    
    if (!state) {
      return res.status(400).json({
        success: false,
        error: "Estado inválido"
      });
    }
    
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      
      const updated = await RequestModel.updateState(conn, parseInt(id), state);
      
      if (!updated) {
        await conn.rollback();
        return res.status(404).json({
          success: false,
          error: "Solicitud no encontrada"
        });
      }
      
      await conn.commit();
      
      res.json({
        success: true,
        message: "Estado de solicitud actualizado exitosamente"
      });
      
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
    
  } catch (error) {
    console.error("[ERROR] updateRequestState controller:", {
      id: req.params.id,
      body: req.body,
      message: error.message,
      stack: error.stack,
    });
    
    res.status(500).json({
      success: false,
      error: "Error al actualizar estado de solicitud",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Obtener con informacion del material y el horario
export const getRequestWithSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: "ID de solicitud inválido"
      });
    }

    console.log(`[INFO] getRequestWithSchedule: Fetching request ${id}`);
    const request = await RequestModel.getByIdWithAdditionalInfo(parseInt(id));

    if (!request) {
      console.log(`[WARN] getRequestWithSchedule: Request ${id} not found`);
      return res.status(404).json({
        success: false,
        error: "Solicitud no encontrada"
      });
    }

    console.log(`[INFO] getRequestWithSchedule: Returning request data:`, {
      id: request.id,
      name: request.name,
      imagesCount: request.images ? request.images.length : 0,
      images: request.images
    });

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error("[ERROR] getRequestWithSchedule controller:", {
      id: req.params.id,
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: "Error al obtener solicitud",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener requests por usuario y estado
export const getRequestsByUserAndState = async (req, res) => {
  try {
    const { userId } = req.params;
    const { state, limit } = req.query;
    
    const requests = await RequestModel.getRequestsByUserAndState(
      parseInt(userId), 
      state ? parseInt(state) : null, 
      limit ? parseInt(limit) : null
    );
    
    res.json({ 
      success: true, 
      data: requests,
      count: requests.length 
    });
  } catch (err) {
    console.error("[ERROR] getRequestsByUserAndState:", err.message);
    res.status(500).json({ success: false, error: "Error al obtener requests del usuario" });
  }
};