import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X } from 'lucide-react';
import * as materialService from '../../services/materialService.ts';

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
  mostrar: 'Activo' | 'Inactivo';
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

  // Estados del formulario
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    mostrar: 'Activo',
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
      setMateriales(data);
      setFilteredMateriales(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar materiales';
      setError(message);
      console.error('❌ Error cargando materiales:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar materiales por nombre
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = materiales.filter(material =>
      material.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredMateriales(filtered);
  };

  /**
   * Seleccionar un material y cargar sus datos en el formulario
   */
  const handleSelectMaterial = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      mostrar: material.state === 1 ? 'Activo' : 'Inactivo',
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
    if (!selectedMaterial) return;

    try {
      setLoading(true);
      setError(null);

      const state = formData.mostrar === 'Activo' ? 1 : 0;

      await materialService.updateMaterial(
        selectedMaterial.id,
        formData.name,
        formData.description,
        state
      );

      // Actualizar la lista local
      const updatedMateriales = materiales.map(m =>
        m.id === selectedMaterial.id
          ? { ...m, name: formData.name, description: formData.description, state }
          : m
      );

      setMateriales(updatedMateriales);
      handleSearch(searchTerm); // Reaplica el filtro

      // Si el material se inactivó, deseleccionarlo
      if (state === 0) {
        handleCloseFormData();
      }

      alert('✅ Material actualizado correctamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar material';
      setError(message);
      alert(`❌ Error: ${message}`);
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

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el material "${selectedMaterial.name}"?`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      setError(null);

      await materialService.deleteMaterial(selectedMaterial.id);

      // Actualizar lista
      const updatedMateriales = materiales.filter(m => m.id !== selectedMaterial.id);
      setMateriales(updatedMateriales);
      handleSearch(searchTerm); // Reaplica el filtro

      handleCloseFormData();
      alert('✅ Material eliminado correctamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar material';
      setError(message);
      alert(`❌ Error: ${message}`);
      console.error('❌ Error eliminando material:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear nuevo material
   */
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMaterial.name.trim()) {
      alert('El nombre del material es requerido');
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
      alert('✅ Material creado correctamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear material';
      setError(message);
      alert(`❌ Error: ${message}`);
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
      mostrar: 'Activo',
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
      <div style={{
        backgroundColor: '#dcfce7',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          color: '#149D52',
          margin: 0
        }}>
          Materiales
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              width: '18px',
              height: '18px'
            }} />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                width: '20rem',
                outline: 'none',
                backgroundColor: 'white',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            />
          </div>
          
          <button style={{
            position: 'relative',
            padding: '0.5rem',
            border: 'none',
            background: 'transparent',
            fontSize: '1.5rem',
            cursor: 'pointer',
            borderRadius: '0.5rem'
          }}>
            🔔
          </button>
          
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem'
          }}>
            👤
          </div>
        </div>
      </div>

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
                <button 
                  onClick={handleOpenModal}
                  style={{
                    backgroundColor: '#149D52',
                    color: 'white',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0d7d3a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#149D52';
                  }}
                >
                  <Plus size={18} />
                  Crear material
                </button>
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

                {/* Estado */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Estado
                  </label>
                  <select
                    name="mostrar"
                    value={formData.mostrar}
                    onChange={handleFormChange}
                    disabled={!selectedMaterial}
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
                      cursor: selectedMaterial ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
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
    </div>
  );
}
