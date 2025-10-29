import React, { useState, useEffect } from 'react';
import './FormComp.css';
import MapPopup from "./MapPopup"; // importar el componente del mapa
import MiniMapPreview from "./MiniMapPreview"; // importar el mini mapa
import { REQUEST_STATE } from '../../shared/constants';

interface Material {
  id: number;
  name: string;
  description?: string;
}

type FormData = {
  materialId: number;
  description: string;
  photos: File[];
  availableDays: string[];
  timeFrom: string;
  timeTo: string;
};

// Interfaz para manejar la ubicación con dirección
interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

const FormComp: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    materialId: 0,
    description: '',
    photos: [],
    availableDays: [],
    timeFrom: '',
    timeTo: ''
  });

  // Estado para las URLs de vista previa de las fotos
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  // Estados para el mapa - ahora con dirección
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const days = [
    { key: 'lun', label: 'Lun' },
    { key: 'mar', label: 'Mar' },
    { key: 'mie', label: 'Mié' },
    { key: 'jue', label: 'Jue' },
    { key: 'vie', label: 'Vie' },
    { key: 'sab', label: 'Sáb' },
    { key: 'dom', label: 'Dom' }
  ];

  const fallbackMaterials: Material[] = [
    { id: 1, name: 'Plástico PET', description: 'Botellas de plástico' },
    { id: 2, name: 'Cartón', description: 'Cajas de cartón' },
    { id: 3, name: 'Papel', description: 'Papel de oficina' },
    { id: 4, name: 'Vidrio', description: 'Botellas de vidrio' },
    { id: 5, name: 'Metal', description: 'Latas de aluminio' }
  ];

  const checkServerHealth = async () => {
    try {
      console.log("Verificando salud del servidor...");
  const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Respuesta del health check:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Datos del health check:", data);
      }
      
      return response.ok;
    } catch (error) {
      console.error("Error en health check:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setApiError(null);
        setLoading(true);
        
        console.log("Intentando obtener materiales...");
        
        // Verificar salud del servidor primero
        const serverAvailable = await checkServerHealth();
        
        if (!serverAvailable) {
          console.warn("Servidor no disponible, usando materiales de ejemplo");
          setMaterials(fallbackMaterials);
          setApiError("Servidor no disponible. Usando materiales de ejemplo.");
          setLoading(false);
          return;
        }

        // Intentar obtener materiales reales
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/material`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json', 
            'Accept': 'application/json' 
          },
          signal: AbortSignal.timeout(10000)
        });

        console.log("Respuesta de materiales:", {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });

        if (response.ok) {
          const materialsData = await response.json();
          console.log("Materiales recibidos:", materialsData);
          
          if (Array.isArray(materialsData) && materialsData.length > 0) {
            setMaterials(materialsData);
            console.log("Materiales cargados correctamente:", materialsData.length);
          } else if (materialsData.data && Array.isArray(materialsData.data)) {
            setMaterials(materialsData.data);
          } else {
            console.warn("Formato de materiales incorrecto, usando fallback");
            setMaterials(fallbackMaterials);
            setApiError("Formato de datos incorrecto. Usando materiales de ejemplo.");
          }
        } else {
          console.error("Error del servidor:", response.status, response.statusText);
          setMaterials(fallbackMaterials);
          setApiError(`Error del servidor (${response.status}). Usando materiales de ejemplo.`);
        }
      } catch (error) {
        console.error("Error completo al obtener materiales:", error);
        setMaterials(fallbackMaterials);
        setApiError("Error de conexión. Usando materiales de ejemplo.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Limpiar URLs de vista previa cuando el componente se desmonta
  useEffect(() => {
    return () => {
      photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviewUrls]);

  const retryLoadMaterials = () => {
    setLoading(true);
    setApiError(null);
    // Recargar la página para reintentar
    window.location.reload();
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, materialId: parseInt(e.target.value) });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limitar a 150 caracteres
    if (value.length <= 150) {
      setFormData({ ...formData, description: value });
    }
  };

  // FUNCIÓN CORREGIDA: Ahora agrega fotos en lugar de reemplazar
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentPhotos = formData.photos;
      const currentPreviews = photoPreviewUrls;
      
      // Verificar cuántas fotos se pueden agregar (máximo 5 total)
      const remainingSlots = 5 - currentPhotos.length;
      
      if (remainingSlots <= 0) {
        setMensaje("Ya has alcanzado el límite máximo de 5 fotos");
        e.target.value = ''; // Limpiar el input
        return;
      }
      
      // Si hay más archivos nuevos de los que se pueden agregar, tomar solo los primeros
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      if (newFiles.length > remainingSlots) {
        setMensaje(`Solo se pueden agregar ${remainingSlots} foto(s) más. Límite máximo: 5 fotos`);
      } else {
        // Limpiar mensaje si todo está bien
        if (mensaje.includes("foto")) {
          setMensaje("");
        }
      }
      
      // Crear URLs de vista previa para las nuevas fotos
      const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
      
      // Combinar fotos existentes con las nuevas
      const updatedPhotos = [...currentPhotos, ...filesToAdd];
      const updatedPreviews = [...currentPreviews, ...newPreviewUrls];
      
      // Actualizar el estado
      setFormData({ ...formData, photos: updatedPhotos });
      setPhotoPreviewUrls(updatedPreviews);
      
      // Limpiar el input para permitir seleccionar las mismas fotos de nuevo si es necesario
      e.target.value = '';
    }
  };

  // Función para eliminar una foto específica
  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    const newPreviewUrls = photoPreviewUrls.filter((_, i) => i !== index);
    
    // Revocar la URL de la foto eliminada
    URL.revokeObjectURL(photoPreviewUrls[index]);
    
    setFormData({ ...formData, photos: newPhotos });
    setPhotoPreviewUrls(newPreviewUrls);
    
    // Limpiar mensaje de límite si hay espacio disponible ahora
    if (mensaje.includes("límite") && newPhotos.length < 5) {
      setMensaje("");
    }
  };

  const handleDayToggle = (day: string) => {
    const updatedDays = formData.availableDays.includes(day)
      ? formData.availableDays.filter(d => d !== day)
      : [...formData.availableDays, day];
    setFormData({ ...formData, availableDays: updatedDays });
  };

  const handleTimeChange = (field: 'timeFrom' | 'timeTo', value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Función separada para abrir el mapa
  const openMapModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMap(true);
  };

  // Función para seleccionar ubicación con dirección
  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setSelectedLocation({ lat, lng, address });
    setShowMap(false);
  };

  const handleSubmit = async () => {
    if (formData.materialId === 0) return setMensaje("Debes seleccionar un material");
    if (!formData.description.trim()) return setMensaje("Debes proporcionar una descripción");
    if (formData.description.length > 150) return setMensaje("La descripción no puede exceder 150 caracteres");
    if (formData.photos.length === 0) return setMensaje("Debes subir al menos una foto");
    if (formData.availableDays.length === 0) return setMensaje("Debes seleccionar al menos un día disponible");
    if (!formData.timeFrom || !formData.timeTo) return setMensaje("Debes especificar el horario disponible");
    
    // Validar que la hora de inicio no sea mayor que la hora de fin
    if (formData.timeFrom >= formData.timeTo) {
      return setMensaje("La hora de inicio debe ser menor que la hora de fin");
    }
    
    if (!selectedLocation) return setMensaje("Debes seleccionar la ubicación en el mapa");

    setSubmitting(true);
    setMensaje("");

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setMensaje("Debes iniciar sesión para crear una solicitud");
        setSubmitting(false);
        return;
      }

      const user = JSON.parse(userStr);

      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      
      // Agregar datos básicos
      formDataToSend.append('idUser', user.id.toString());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('materialId', formData.materialId.toString());
      formDataToSend.append('latitude', selectedLocation.lat.toString());
      formDataToSend.append('longitude', selectedLocation.lng.toString());
      formDataToSend.append('state', REQUEST_STATE.OPEN.toString()); // Estado 1 = OPEN (disponible para recoger)
      
      // Agregar horarios
      formDataToSend.append('timeFrom', formData.timeFrom);
      formDataToSend.append('timeTo', formData.timeTo);
      formDataToSend.append('availableDays', JSON.stringify(formData.availableDays));
      
      // Agregar archivos de imagen
      formData.photos.forEach((photo) => {
        formDataToSend.append('photos', photo);
      });

      console.log("Enviando solicitud con FormData...");

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/request`, {
        method: 'POST',
        body: formDataToSend, // No establecer Content-Type, el navegador lo hace automáticamente
      });

      console.log("Respuesta de solicitud:", {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Datos de respuesta:", data);

      if (data.success) {
        setMensaje("Solicitud creada exitosamente!");
        setFormData({ 
          materialId: 0, 
          description: '', 
          photos: [], 
          availableDays: [], 
          timeFrom: '', 
          timeTo: '' 
        });
        setSelectedLocation(null);
        
        // Limpiar las URLs de vista previa
        photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        setPhotoPreviewUrls([]);
      } else {
        setMensaje(data.error || "Error desconocido al crear la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      setMensaje("No se pudo conectar al servidor para crear la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recycle-form-container">
      <h1 className="form-title">Registra tu material de reciclaje</h1>

      {apiError && (
        <div className="alert alert-warning mb-3">
          {apiError}
          <button type="button" onClick={retryLoadMaterials} className="btn btn-sm btn-outline-primary ms-2">
            Reintentar
          </button>
        </div>
      )}

      <div className="form-card">
        <div className="form-steps">
          {/* Paso 1 - Material y Descripción */}
          <div className="step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3>Cuenta lo que quieres reciclar</h3>
            </div>

            <div className="form-group">
              <label htmlFor="material">Material</label>
              <select 
                id="material" 
                value={formData.materialId} 
                onChange={handleMaterialChange} 
                className="select-input" 
                disabled={loading}
              >
                <option value={0}>
                  {loading ? 'Cargando materiales...' : 'Selecciona un material'}
                </option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name} {material.description ? `- ${material.description}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea 
                id="description" 
                value={formData.description} 
                onChange={handleDescriptionChange} 
                className="textarea-input" 
                placeholder="Describe el material..." 
                maxLength={150}
              />
              <div 
                style={{ 
                  fontSize: '12px', 
                  color: formData.description.length >= 150 ? '#dc3545' : '#666',
                  marginTop: '4px',
                  textAlign: 'right'
                }}
              >
                {formData.description.length}/150 caracteres
              </div>
            </div>
          </div>

          {/* Paso 2 - Fotos CON LÍMITE DE 5 */}
          <div className="step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h3>Comparte imágenes de los materiales</h3>
            </div>

            <div className={`photo-upload-section ${formData.photos.length >= 5 ? 'limit-reached' : ''}`}>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="file-input" 
                id="photo-upload"
                disabled={formData.photos.length >= 5}
              />
              <label 
                htmlFor="photo-upload" 
                className={`upload-label ${formData.photos.length >= 5 ? 'upload-disabled' : ''}`}
              >
                {formData.photos.length >= 5 ? 'Límite alcanzado' : 'Subir fotos'}
              </label>
              
              <div className="photo-count-container">
                {formData.photos.length > 0 && (
                  <p className={`photo-count ${formData.photos.length >= 5 ? 'limit-reached' : ''}`}>
                    {formData.photos.length} de 5 foto(s) seleccionada(s)
                  </p>
                )}
                <p className="photo-limit-text">Máximo 5 fotos permitidas</p>
              </div>

              {/* Vista previa de las fotos */}
              {photoPreviewUrls.length > 0 && (
                <div className="photo-preview-container">
                  {photoPreviewUrls.map((url, index) => (
                    <div key={index} className="photo-preview">
                      <img 
                        src={url} 
                        alt={`Vista previa ${index + 1}`} 
                        className="preview-image"
                      />
                      <button 
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="remove-photo-button"
                        aria-label={`Eliminar foto ${index + 1}`}
                      >
                        ✕
                      </button>
                      <div className="photo-info">
                        <span className="photo-name">
                          {formData.photos[index]?.name || `Imagen ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Paso 3 - Ubicación y Disponibilidad */}
          <div className="step">
            <div className="step-header">
              <span className="step-number">3</span>
              <h3>Danos tu disponibilidad</h3>
            </div>

            {/* SECCIÓN DE UBICACIÓN - MEJORADA CON MINI MAPA */}
            <div className="location-container">
              <h4>Ubicación de recojo</h4>
              
              {!selectedLocation ? (
                <div className="location-selector">
                  <p>Selecciona dónde pueden recoger el material</p>
                  <button 
                    type="button" 
                    onClick={openMapModal}
                    className="map-open-button"
                  >
                    Abrir mapa para seleccionar ubicación
                  </button>
                </div>
              ) : (
                <div className="location-selected">
                  {/* Mini mapa de vista previa */}
                  <MiniMapPreview 
                    lat={selectedLocation.lat} 
                    lng={selectedLocation.lng} 
                    address={selectedLocation.address}
                  />
                  
                  <button 
                    type="button" 
                    onClick={openMapModal}
                    className="map-change-button"
                    style={{ width: '100%', marginTop: '10px' }}
                  >
                    Cambiar ubicación
                  </button>
                </div>
              )}
            </div>

            {/* Días disponibles */}
            <div className="availability-section">
              <h4>Días disponibles</h4>
              <div className="days-selector">
                {days.map((day) => (
                  <button 
                    key={day.key} 
                    type="button" 
                    className={`day-button ${formData.availableDays.includes(day.key) ? 'selected' : ''}`} 
                    onClick={() => handleDayToggle(day.key)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horario */}
            <div className="time-section">
              <h4>Posible horario</h4>
              <div className="time-selector">
                <div className="time-input-group">
                  <label htmlFor="time-from">Desde:</label>
                  <input 
                    id="time-from"
                    type="time" 
                    value={formData.timeFrom} 
                    onChange={(e) => handleTimeChange('timeFrom', e.target.value)} 
                    className="time-input" 
                  />
                </div>
                <div className="time-input-group">
                  <label htmlFor="time-to">Hasta:</label>
                  <input 
                    id="time-to"
                    type="time" 
                    value={formData.timeTo} 
                    onChange={(e) => handleTimeChange('timeTo', e.target.value)} 
                    className="time-input" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleSubmit} 
              className="confirm-button" 
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Confirmar"}
            </button>

            {mensaje && (
              <div className={`alert mt-3 ${mensaje.includes("exitosamente") ? "alert-success" : "alert-danger"}`}>
                {mensaje}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DEL MAPA - RENDERIZADO CONDICIONALMENTE */}
      {showMap && (
        <div className="map-overlay">
          <div className="map-modal-container">
            <div className="map-modal-header">
              <h3>Selecciona tu ubicación</h3>
              <button 
                type="button"
                className="map-close-button" 
                onClick={() => setShowMap(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="map-content">
              <MapPopup
                onSelect={handleLocationSelect}
                initialCoords={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : undefined}
              />
            </div>
            
            <div className="map-modal-actions">
              <button 
                type="button"
                className="cancel-button" 
                onClick={() => setShowMap(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormComp;