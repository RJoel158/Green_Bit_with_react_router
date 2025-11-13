import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import * as materialService from '../../services/materialService.ts';
import CommonHeader from '../CommonComp/CommonHeader';
import SuccessModal from '../CommonComp/SuccesModal';
import ConfirmModal from '../CommonComp/ConfirmModal';

interface Material {
  id: number;
  name: string;
  description: string;
  createdDate?: string;
  state?: number;
}

interface FormData {
  name: string;
  description: string;
}

export default function MaterialesAdmin() {
  // Estados principales
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [filteredMateriales, setFilteredMateriales] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    name: '',
    description: '',
  });

  // Estados del modal de creación
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
  });

  /**
   * Cargar materiales del backend al montar el componente
   */
  useEffect(() => {
    loadMaterials();
  }, []);

  /**
   * Cargar materiales desde el backend
   */
  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await materialService.getAllMaterials();
      console.log('📥 Materiales cargados:', data);
      console.log('📥 Primer material structure:', data[0]); // Ver estructura del objeto
      setMateriales(data);
      
      // Aplicar filtros a los materiales cargados (solo activos)
      const filtered = applyFilters(data, searchTerm, 1);
      setFilteredMateriales(filtered);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar materiales';
      setError(message);
      console.error('❌ Error cargando materiales:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplicar filtros (búsqueda + estado opcional)
   */
  const applyFilters = (materials: Material[], search: string, state?: 0 | 1) => {
    let filtered = materials;

    // Filtrar por búsqueda
    if (search.trim()) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtrar por estado solo si se especifica (1 = Activo, 0 = Inactivo)
    if (state !== undefined) {
      filtered = filtered.filter(material => material.state === state);
    }

    return filtered;
  };

  /**
   * Filtrar materiales por nombre
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = applyFilters(materiales, term, 1);
    setFilteredMateriales(filtered);
  };

  /**
   * Seleccionar un material y cargar sus datos en el formulario
   */
  const handleSelectMaterial = (material: Material) => {
    console.log('✅ Material seleccionado:', material);
    console.log('✅ Material.id:', material.id, 'Type:', typeof material.id);
    
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
    });
  };

  /**
   * Actualizar campos del formulario
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value as any,
    }));
  };

  /**
   * Guardar cambios del material seleccionado
   */
  const handleSaveChanges = async () => {
    console.log('🔍 DEBUG handleSaveChanges - selectedMaterial:', selectedMaterial);
    console.log('🔍 DEBUG handleSaveChanges - selectedMaterial.id:', selectedMaterial?.id);
    
    if (!selectedMaterial) {
      setError('No hay material seleccionado');
      return;
    }

    if (!selectedMaterial.id) {
      setError('El ID del material es inválido');
      console.error('❌ ERROR: selectedMaterial.id es undefined o null', selectedMaterial);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📤 Enviando actualización:', {
        id: selectedMaterial.id,
        name: formData.name,
        description: formData.description,
        state: selectedMaterial.state
      });

      await materialService.updateMaterial(
        selectedMaterial.id,
        formData.name,
        formData.description,
        selectedMaterial.state  // Mantener el estado actual
      );

      // Actualizar inmediatamente la lista local sin esperar al servidor
      const updatedMateriales = materiales.map(m => 
        m.id === selectedMaterial.id 
          ? { ...m, name: formData.name, description: formData.description, state: selectedMaterial.state }
          : m
      );
      setMateriales(updatedMateriales);

      // Reaplica los filtros con los datos actualizados (solo activos)
      const filtered = applyFilters(updatedMateriales, searchTerm, 1);
      setFilteredMateriales(filtered);

      // Deseleccionar el material
      handleCloseFormData();

      setSuccessMessage({
        title: '¡Material Actualizado!',
        message: 'El material ha sido actualizado correctamente.'
      });
      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar material';
      setError(message);
      setErrorModalMessage(`❌ Error: ${message}`);
      setShowErrorModal(true);
      console.error('❌ Error actualizando material:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar el material seleccionado
   */
  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    // Mostrar modal de confirmación
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  /**
   * Confirmar eliminación del material
   */
  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;

    try {
      setLoading(true);
      setError(null);

      // Lógica: Si está ACTIVO → cambiar a INACTIVO (soft delete)
      //         Si está INACTIVO → eliminar de BD (hard delete)
      
      const isActive = selectedMaterial.state === 1;

      if (isActive) {
        // SOFT DELETE: Cambiar estado a inactivo (0)
        console.log('📋 Soft Delete: Cambiando material a INACTIVO');
        
        await materialService.updateMaterial(
          selectedMaterial.id,
          selectedMaterial.name,
          selectedMaterial.description,
          0  // Cambiar a estado inactivo
        );

        // Actualizar lista local
        const updated = materiales.map(m =>
          m.id === selectedMaterial.id ? { ...m, state: 0 } : m
        );
        setMateriales(updated);

        // Reaplica los filtros (solo activos)
        const filtered = applyFilters(updated, searchTerm, 1);
        setFilteredMateriales(filtered);

        setSuccessMessage({
          title: 'Material Desactivado',
          message: 'El material ha sido desactivado y no aparecerá en nuevas solicitudes.'
        });
      } else {
        // HARD DELETE: Eliminar de la base de datos
        console.log('🗑️ Hard Delete: Eliminando material de la BD');
        
        await materialService.deleteMaterial(selectedMaterial.id);

        // Remover de la lista local
        const updated = materiales.filter(m => m.id !== selectedMaterial.id);
        setMateriales(updated);

        // Reaplica los filtros (solo activos)
        const filtered = applyFilters(updated, searchTerm, 1);
        setFilteredMateriales(filtered);

        setSuccessMessage({
          title: '🗑️ Material Eliminado',
          message: 'El material ha sido eliminado de la base de datos.'
        });
      }

      handleCloseFormData();
      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar material';
      setError(message);
      setErrorModalMessage(`❌ Error: ${message}`);
      setShowErrorModal(true);
      console.error('❌ Error eliminando material:', err);
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  /**
   * Crear nuevo material
   */
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMaterial.name.trim()) {
      setError('El nombre del material es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await materialService.createMaterial(
        newMaterial.name.trim(),
        newMaterial.description.trim()
      );

      // Recargar materiales desde el backend
      await loadMaterials();

      setShowModal(false);
      setNewMaterial({ name: '', description: '' });
      setSuccessMessage({
        title: '¡Material Creado!',
        message: 'El nuevo material ha sido creado correctamente.'
      });
      setShowSuccessModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear material';
      setError(message);
      setErrorModalMessage(`❌ Error: ${message}`);
      setShowErrorModal(true);
      console.error('❌ Error creando material:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar selección y formulario
   */
  const handleCloseFormData = () => {
    setSelectedMaterial(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  /**
   * Abrir modal de creación
   */
  const handleOpenModal = () => {
    setNewMaterial({ name: '', description: '' });
    setShowModal(true);
  };

  /**
   * Cerrar modal de creación
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setNewMaterial({ name: '', description: '' });
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
        title="Materiales"
        searchPlaceholder="Buscar material..."
        searchQuery={searchTerm}
        onSearch={handleSearch}
        onCreateNew={handleOpenModal}
        createButtonText="+ Crear material"
      />

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
          <p style={{ color: '#6b7280' }}>Cargando materiales...</p>
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
                  Lista de Materiales ({filteredMateriales.length})
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
                        Nombre
                      </th>
                      <th style={{
                        padding: '0.875rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#149D52'
                      }}>
                        Descripción
                      </th>
                      <th style={{
                        padding: '0.875rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#149D52'
                      }}>
                        Fecha de registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMateriales.length > 0 ? (
                      filteredMateriales.map((material) => (
                        <tr 
                          key={material.id}
                          onClick={() => handleSelectMaterial(material)}
                          style={{
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: selectedMaterial?.id === material.id ? '#e8f5e9' : '#FAF8F1',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedMaterial?.id !== material.id) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedMaterial?.id === material.id ? '#e8f5e9' : '#FAF8F1';
                          }}
                        >
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#374151',
                            fontWeight: '500'
                          }}>
                            {material.name}
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            {material.description || '-'}
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.9rem',
                            color: '#6b7280'
                          }}>
                            {material.createdDate ? new Date(material.createdDate).toLocaleDateString('es-ES') : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{
                          padding: '3rem 1.5rem',
                          textAlign: 'center',
                          fontSize: '0.9rem',
                          color: '#9ca3af'
                        }}>
                          No hay materiales disponibles
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
                    {selectedMaterial ? 'Editar Material' : 'Selecciona un material'}
                  </h3>
                  {selectedMaterial && (
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

                {/* Nombre */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    disabled={!selectedMaterial}
                    placeholder="Nombre del material"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: selectedMaterial ? '#ffffff' : '#f3f4f6',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                      cursor: selectedMaterial ? 'text' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    disabled={!selectedMaterial}
                    placeholder="Descripción del material"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: selectedMaterial ? '#ffffff' : '#f3f4f6',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      boxSizing: 'border-box',
                      cursor: selectedMaterial ? 'text' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  />
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
                    onClick={handleDeleteMaterial}
                    disabled={!selectedMaterial}
                    style={{
                      flex: 1,
                      backgroundColor: selectedMaterial ? '#fee2e2' : '#f3f4f6',
                      color: selectedMaterial ? '#991b1b' : '#9ca3af',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid ' + (selectedMaterial ? '#fecaca' : '#e5e7eb'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: selectedMaterial ? 'pointer' : 'not-allowed',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMaterial) {
                        e.currentTarget.style.backgroundColor = '#fca5a5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMaterial) {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                  <button 
                    onClick={handleSaveChanges}
                    disabled={!selectedMaterial}
                    style={{
                      flex: 1,
                      backgroundColor: selectedMaterial ? '#149D52' : '#d1d5db',
                      color: '#ffffff',
                      padding: '0.625rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: selectedMaterial ? 'pointer' : 'not-allowed',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedMaterial) {
                        e.currentTarget.style.backgroundColor = '#0d7d3a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedMaterial) {
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

      {/* Modal para crear material */}
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
            maxWidth: '500px',
            width: '90%',
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
                Crear Nuevo Material
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

            <form onSubmit={handleCreateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Papel, Cartón, Plástico..."
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
                  Descripción
                </label>
                <input
                  type="text"
                  value={newMaterial.description}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el material..."
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
                />
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
                  Crear Material
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
      {showConfirmModal && confirmAction === 'delete' && selectedMaterial && (
        <ConfirmModal
          title="¿Eliminar Material?"
          message={`¿Estás seguro de que deseas eliminar el material "${selectedMaterial.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
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
}
