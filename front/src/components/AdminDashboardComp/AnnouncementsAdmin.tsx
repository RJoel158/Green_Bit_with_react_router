import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement
} from '../../services/announcementService.ts';
import { uploadAnnouncementImage } from '../../services/uploadService.ts';
import CommonHeader from '../CommonComp/CommonHeader';
import SuccessModal from '../CommonComp/SuccesModal';
import ConfirmModal from '../CommonComp/ConfirmModal';
import { config } from '../../config/environment';

interface Announcement {
  id: number;
  title: string;
  imagePath: string;
  targetRole: 'recolector' | 'reciclador' | 'both';
  state: number;
  createdDate: string;
  createdBy: number;
}

interface FormData {
  title: string;
  imagePath: string;
  targetRole: 'recolector' | 'reciclador' | 'both';
  state: number;
  createdBy: number;
}

const AnnouncementsAdmin: React.FC = () => {
  // Estados principales
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Estados para el modal de éxito/error
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    title: '',
    imagePath: '',
    targetRole: 'both',
    state: 1,
    createdBy: 1
  });

  // Estados del modal de creación
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    imagePath: '',
    targetRole: 'both' as 'recolector' | 'reciclador' | 'both',
  });

  // Cargar anuncios al montar el componente
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAnnouncements();
      setAnnouncements(data);
      
      // Aplicar filtros a los anuncios cargados (solo activos)
      const filtered = applyFilters(data, searchTerm, 1);
      setFilteredAnnouncements(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar anuncios';
      setError(message);
      console.error('❌ Error cargando anuncios:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplicar filtros (búsqueda + estado)
   */
  const applyFilters = (items: Announcement[], search: string, state?: 0 | 1) => {
    let filtered = items;

    // Filtrar por búsqueda
    if (search.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrar por estado solo si se especifica
    if (state !== undefined) {
      filtered = filtered.filter(item => item.state === state);
    }

    return filtered;
  };

  // Debug: Log when previewImage changes
  useEffect(() => {
    console.log('🎬 [Effect] previewImage cambió a:', previewImage);
  }, [previewImage]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = applyFilters(announcements, term, 1);
    setFilteredAnnouncements(filtered);
  };

  const handleSelectAnnouncement = async (announcement: Announcement) => {
    try {
      const fullData = await getAnnouncementById(announcement.id);
      setSelectedAnnouncement(fullData);
      setFormData({
        title: fullData.title,
        imagePath: fullData.imagePath,
        targetRole: fullData.targetRole,
        state: fullData.state,
        createdBy: fullData.createdBy
      });
      
      // Convertir URL relativa a absoluta apuntando al backend usando config
      let imageUrl = fullData.imagePath;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${config.api.baseUrl}${imageUrl}`;
      }
      
      setPreviewImage(imageUrl || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar anuncio';
      setError(message);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'state' ? parseInt(value) : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      console.log('📸 Subiendo imagen:', file.name, file.size, file.type);

      // Subir imagen
      const uploadedData = await uploadAnnouncementImage(file);
      
      console.log('✅ Respuesta del servidor:', uploadedData);
      console.log('📝 uploadedData.url:', uploadedData?.url);

      // Obtener el path relativo del servidor
      const relativePath = uploadedData?.url;
      
      if (!relativePath) {
        throw new Error('No se recibió URL de imagen del servidor');
      }
      
      // Para preview: convertir path relativo a URL absoluta
      let previewUrl = relativePath;
      if (!previewUrl.startsWith('http')) {
        previewUrl = `${config.api.baseUrl}${relativePath}`;
        console.log('🔗 URL convertida a absoluta para preview:', previewUrl);
      }
      
      console.log('🖼️ URL para preview:', previewUrl);
      
      // Actualizar preview con la URL del servidor
      setPreviewImage(previewUrl);
      console.log('✅ previewImage actualizado a:', previewUrl);
      
      if (showModal) {
        // Estamos en el modal de crear - guardar el path relativo
        setNewAnnouncement(prev => ({
          ...prev,
          imagePath: relativePath  // Solo el path relativo
        }));
        console.log('✅ Imagen guardada en newAnnouncement:', relativePath);
      } else {
        // Estamos editando - guardar el path relativo
        setFormData(prev => ({
          ...prev,
          imagePath: relativePath  // Solo el path relativo
        }));
        console.log('✅ Imagen guardada en formData:', relativePath);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir imagen';
      console.error('❌ Error en upload:', err);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedAnnouncement) return;

    try {
      setLoading(true);
      setError(null);

      await updateAnnouncement(
        selectedAnnouncement.id,
        formData.title,
        formData.imagePath,
        formData.targetRole,
        formData.state
      );

      // Actualizar inmediatamente la lista local
      const updatedAnnouncements = announcements.map(a =>
        a.id === selectedAnnouncement.id
          ? { ...a, title: formData.title, imagePath: formData.imagePath, targetRole: formData.targetRole, state: formData.state }
          : a
      );
      setAnnouncements(updatedAnnouncements);

      // Reaplica los filtros con los datos actualizados (solo activos)
      const filtered = applyFilters(updatedAnnouncements, searchTerm, 1);
      setFilteredAnnouncements(filtered);

      setSelectedAnnouncement(null);
      setSuccessMessage({
        title: '¡Anuncio Actualizado!',
        message: 'El anuncio ha sido actualizado correctamente.'
      });
      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar anuncio';
      setError(message);
      setErrorModalMessage(`❌ Error: ${message}`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    // Mostrar modal de confirmación
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  /**
   * Confirmar eliminación del anuncio (Soft delete: cambiar estado a 0)
   */
  const handleConfirmDeleteAnnouncement = async () => {
    if (!selectedAnnouncement) return;

    try {
      setLoading(true);
      setError(null);

      // Soft delete: actualizar estado a 0 (inactivo)
      await updateAnnouncement(
        selectedAnnouncement.id,
        selectedAnnouncement.title,
        selectedAnnouncement.imagePath,
        selectedAnnouncement.targetRole,
        0  // state = 0 (inactivo)
      );

      // Actualizar lista local: cambiar estado del anuncio a 0 (inactivo)
      const updated = announcements.map(a =>
        a.id === selectedAnnouncement.id ? { ...a, state: 0 } : a
      );
      setAnnouncements(updated);

      // Reaplica los filtros (solo activos, el inactivo desaparece de la vista)
      const filtered = applyFilters(updated, searchTerm, 1);
      setFilteredAnnouncements(filtered);

      setSelectedAnnouncement(null);
      setSuccessMessage({
        title: '¡Anuncio Desactivado!',
        message: 'El anuncio ha sido desactivado y no aparecerá en ninguna pantalla.'
      });
      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar anuncio';
      setError(message);
      setErrorModalMessage(`❌ Error: ${message}`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!newAnnouncement.title || !newAnnouncement.title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!newAnnouncement.imagePath || !newAnnouncement.imagePath.trim()) {
      setError('Debes subir una imagen primero');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener el usuario autenticado
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user || !user.id) {
        setError('Usuario no autenticado. Por favor, inicia sesión');
        return;
      }

      console.log('📤 Creando anuncio:', {
        title: newAnnouncement.title,
        imagePath: newAnnouncement.imagePath,
        targetRole: newAnnouncement.targetRole,
        createdBy: user.id
      });

      await createAnnouncement(
        newAnnouncement.title.trim(),
        newAnnouncement.imagePath,
        newAnnouncement.targetRole,
        user.id
      );

      console.log('✅ Anuncio creado exitosamente');

      // Limpiar todo
      setShowModal(false);
      setNewAnnouncement({ title: '', imagePath: '', targetRole: 'both' });
      setPreviewImage(null);
      setError(null);

      // Recargar lista
      await loadAnnouncements();
      
      setSuccessMessage({
        title: '¡Anuncio Creado!',
        message: 'El nuevo anuncio ha sido creado correctamente.'
      });
      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al crear anuncio';
      console.error('❌ Error:', err);
      setError(message);
      setErrorModalMessage(`❌ Error: ${message}`);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFormData = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      imagePath: '',
      targetRole: 'both',
      state: 1,
      createdBy: 1
    });
    setPreviewImage(null);
  };

  const handleOpenModal = () => {
    setNewAnnouncement({ title: '', imagePath: '', targetRole: 'both' });
    setPreviewImage(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewAnnouncement({ title: '', imagePath: '', targetRole: 'both' });
    setPreviewImage(null);
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#FAF8F1', 
      overflow: 'hidden',
      height: '100vh'
    }}>
      {/* Header */}
      <CommonHeader
        title="Anuncios"
        searchPlaceholder="Buscar anuncio..."
        searchQuery={searchTerm}
        onSearch={handleSearch}
        onCreateNew={handleOpenModal}
        createButtonText="+ Crear anuncio"
      />

      {/* Filtro de Estado */}

      {/* Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #fecaca'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          gap: '1rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #149D52',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando anuncios...</p>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            height: 'fit-content'
          }}>
            {/* Table Section */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  color: '#149D52',
                  margin: 0
                }}>
                  Lista de Anuncios ({filteredAnnouncements.length})
                </h2>
              </div>

              <div style={{
                overflow: 'hidden',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#dcfce7',
                      borderBottom: '2px solid #149D52'
                    }}>
                      <th style={{
                        padding: '0.875rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#149D52'
                      }}>
                        Título
                      </th>
                      <th style={{
                        padding: '0.875rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#149D52'
                      }}>
                        Rol
                      </th>
                      <th style={{
                        padding: '0.875rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#149D52'
                      }}>
                        Estado
                      </th>
                      <th style={{
                        padding: '0.875rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#149D52'
                      }}>
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnnouncements.length > 0 ? (
                      filteredAnnouncements.map((announcement) => (
                        <tr 
                          key={announcement.id}
                          onClick={() => handleSelectAnnouncement(announcement)}
                          style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: selectedAnnouncement?.id === announcement.id ? '#e8f5e9' : '#FAF8F1',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedAnnouncement?.id !== announcement.id) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedAnnouncement?.id === announcement.id ? '#e8f5e9' : '#FAF8F1';
                          }}
                        >
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#374151',
                            fontWeight: '500'
                          }}>
                            {announcement.title}
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            <span style={{
                              backgroundColor: '#e3f2fd',
                              color: '#1565c0',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {announcement.targetRole}
                            </span>
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            <span style={{
                              backgroundColor: announcement.state === 1 ? '#e8f5e9' : '#ffebee',
                              color: announcement.state === 1 ? '#2d8659' : '#c62828',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {announcement.state === 1 ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            {new Date(announcement.createdDate).toLocaleDateString('es-ES')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{
                          padding: '3rem 1.5rem',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          color: '#9ca3af'
                        }}>
                          No hay anuncios disponibles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Section */}
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#149D52',
                    margin: 0
                  }}>
                    {selectedAnnouncement ? 'Editar Anuncio' : 'Selecciona un anuncio'}
                  </h3>
                  {selectedAnnouncement && (
                    <button 
                      onClick={handleCloseFormData}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem'
                      }}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {/* Título */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Título
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    disabled={!selectedAnnouncement}
                    placeholder="Título del anuncio"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: selectedAnnouncement ? '#ffffff' : '#f3f4f6',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                      cursor: selectedAnnouncement ? 'text' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                {/* Imagen */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Imagen
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '1.5rem',
                    border: '2px dashed #149D52',
                    borderRadius: '0.5rem',
                    cursor: selectedAnnouncement || showModal ? 'pointer' : 'not-allowed',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    minHeight: '80px',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAnnouncement || showModal) {
                      e.currentTarget.style.backgroundColor = '#e8f5e9';
                      e.currentTarget.style.borderColor = '#0d7d3a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.borderColor = '#149D52';
                  }}
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={uploading || (!selectedAnnouncement && !showModal)}
                      style={{
                        display: 'none'
                      }}
                    />
                    <span style={{
                      pointerEvents: 'none',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      {uploading ? 'Subiendo...' : 'Haz clic o arrastra una imagen'}
                    </span>
                  </label>
                  {previewImage && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '2rem',
                      border: '3px solid #149D52',
                      borderRadius: '0.75rem',
                      backgroundColor: '#e8f5e9',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1.5rem'
                    }}>
                      <div style={{
                        width: '100%',
                        backgroundColor: '#ffffff',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '240px',
                        border: '1px solid #d1d5db'
                      }}>
                        <img 
                          src={previewImage} 
                          alt="Vista previa"
                          style={{
                            maxWidth: '90%',
                            maxHeight: '220px',
                            objectFit: 'contain'
                          }}
                          onError={() => console.error('❌ Error cargando:', previewImage)}
                          onLoad={() => console.log('✅ Imagen cargada OK')}
                        />
                      </div>
                      <div style={{
                        fontSize: '0.9rem',
                        color: '#149D52',
                        fontWeight: '600',
                        textAlign: 'center'
                      }}>
                        ✅ Imagen cargada correctamente
                      </div>
                    </div>
                  )}
                </div>

                {/* Rol */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Mostrar a
                  </label>
                  <select
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleFormChange}
                    disabled={!selectedAnnouncement}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: selectedAnnouncement ? '#ffffff' : '#f3f4f6',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                      cursor: selectedAnnouncement ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="recolector">Recolector</option>
                    <option value="reciclador">Reciclador</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>

                {/* Botones */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button 
                    onClick={handleDeleteAnnouncement}
                    disabled={!selectedAnnouncement}
                    style={{
                      flex: 1,
                      backgroundColor: selectedAnnouncement ? '#fee2e2' : '#f3f4f6',
                      color: selectedAnnouncement ? '#991b1b' : '#9ca3af',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid ' + (selectedAnnouncement ? '#fecaca' : '#e5e7eb'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: selectedAnnouncement ? 'pointer' : 'not-allowed',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnnouncement) {
                        e.currentTarget.style.backgroundColor = '#fca5a5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAnnouncement) {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={!selectedAnnouncement}
                    style={{
                      flex: 1,
                      backgroundColor: selectedAnnouncement ? '#149D52' : '#d1d5db',
                      color: '#ffffff',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: selectedAnnouncement ? 'pointer' : 'not-allowed',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnnouncement) {
                        e.currentTarget.style.backgroundColor = '#0d7d3a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAnnouncement) {
                        e.currentTarget.style.backgroundColor = '#149D52';
                      }
                    }}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear anuncio */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#149D52',
                margin: 0
              }}>
                Crear Nuevo Anuncio
              </h2>
              <button 
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Título *
                </label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Nueva Promoción..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#149D52'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Imagen *
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  padding: '1.5rem',
                  border: '2px dashed #149D52',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.3s ease',
                  minHeight: '100px',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e9';
                  e.currentTarget.style.borderColor = '#0d7d3a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.borderColor = '#149D52';
                }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{
                      display: 'none'
                    }}
                    required
                  />
                  <span style={{
                    pointerEvents: 'none',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    {uploading ? 'Subiendo...' : 'Haz clic o arrastra una imagen'}
                  </span>
                </label>
                {previewImage && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    border: '2px solid #149D52',
                    borderRadius: '0.5rem',
                    backgroundColor: '#e8f5e9',
                    textAlign: 'center'
                  }}>
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      style={{
                        maxWidth: '100%',
                        maxHeight: '150px',
                        borderRadius: '0.375rem',
                        marginBottom: '0.75rem',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        console.error('❌ Error cargando imagen:', previewImage);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={() => console.log('✅ Imagen previsualizacion cargada')}
                    />
                    <small style={{
                      display: 'block',
                      color: '#149D52',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      Imagen cargada correctamente
                    </small>
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Mostrar a
                </label>
                <select
                  name="targetRole"
                  value={newAnnouncement.targetRole}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, targetRole: e.target.value as 'recolector' | 'reciclador' | 'both' }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#fafafa',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#149D52'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                >
                  <option value="recolector">Recolector</option>
                  <option value="reciclador">Reciclador</option>
                  <option value="both">Ambos</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    flex: 1,
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'background-color 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#149D52',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'background-color 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d7d3a'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#149D52'}
                >
                  Crear Anuncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <SuccessModal
          title={successMessage.title}
          message={successMessage.message}
          onClose={() => setShowSuccessModal(false)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmModal && confirmAction === 'delete' && selectedAnnouncement && (
        <ConfirmModal
          title="¿Eliminar Anuncio?"
          message={`¿Está seguro de que desea eliminar el anuncio "${selectedAnnouncement.title}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDeleteAnnouncement}
          onCancel={() => {
            setShowConfirmModal(false);
            setConfirmAction(null);
          }}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDangerous={true}
        />
      )}

      {/* Modal de error */}
      {showErrorModal && (
        <SuccessModal
          title="❌ Error"
          message={errorModalMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};

export default AnnouncementsAdmin;
