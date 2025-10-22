// UserInfoPanel.tsx
import { useState } from 'react';
import './UserManagement.css';
import CheckModal from '../CommonComp/CheckModal';
import SuccessModal from '../CommonComp/SuccesModal';

interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  role: string;
  // Campos opcionales para determinar tipo de usuario
  firstname?: string;
  lastname?: string;
  companyName?: string;
  nit?: string;
}

interface UserInfoPanelProps {
  user: User | null;
  userType?: 'Persona' | 'Empresa'; 
}

export default function UserInfoPanel({ user, userType }: UserInfoPanelProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmSave = async () => {
    if (!user) return;

    // Mapear rol a roleId (1: Administrador, 2: Recolector, 3: Reciclador)
    const roleMap: { [key: string]: number } = {
      'Administrador': 1,
      'Recolector': 2,
      'Reciclador': 3,
    };

    const roleToUpdate = selectedRole || user.role;
    const roleId = roleMap[roleToUpdate];

    if (!roleId) {
      console.error('Rol inválido:', roleToUpdate);
      setShowSaveModal(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${user.userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Rol actualizado exitosamente');
        setShowSaveModal(false);
        setShowSuccessModal(true);
      } else {
        console.error('Error al actualizar el rol:', data.error);
        alert('Error al actualizar el rol: ' + data.error);
        setShowSaveModal(false);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión al actualizar el rol');
      setShowSaveModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!user) return;

    // Usar userType como fuente de verdad, con fallback a detección por campos
    const isInstitution = userType === 'Empresa' || !!(user.companyName || user.nit);

    let endpoint = '';
    if (isInstitution) {
      // Ruta para institución: DELETE /api/users/institution/:id
      endpoint = `http://localhost:3000/api/users/institution/${user.userId}`;
    } else {
      // Ruta para persona: DELETE /api/users/:id
      endpoint = `http://localhost:3000/api/users/${user.userId}`;
    }

    console.log(`[DELETE] Tipo: ${isInstitution ? 'Empresa' : 'Persona'}, Endpoint: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        console.log('Usuario eliminado exitosamente');
        setShowDeleteModal(false);
        setShowDeleteSuccessModal(true);
      } else {
        console.error('Error al eliminar el usuario:', data.error);
        alert('Error al eliminar el usuario: ' + data.error);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de conexión al eliminar el usuario');
      setShowDeleteModal(false);
    }
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  if (!user) {
    return (
      <div className="user-management-info-panel">
        <div className="user-management-info-empty">
          Selecciona un usuario para ver sus detalles
        </div>
      </div>
    );
  }

  // Determinar si es persona o empresa
  const isInstitution = !!(user.companyName || user.nit);
  const displayName = isInstitution ? (user.companyName || user.fullName) : user.fullName;

  return (
    <div className="user-management-info-panel">
      <div className="user-management-info-header">
        <h3 className="user-management-info-title">{isInstitution ? 'Empresa' : 'Usuario'}</h3>
        <div 
          className={`user-management-info-avatar ${
            user.role === 'Recolector' 
              ? 'user-management-info-avatar-collector' 
              : 'user-management-info-avatar-recycler'
          }`}
        >
          {displayName.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 className="user-management-info-name">{displayName}</h2>
        <p className="user-management-info-role">{user.role}</p>
      </div>

      <div className="user-management-info-form">

        {isInstitution && user.nit && (
          <div className="user-management-info-field">
            <label className="user-management-info-label">NIT:</label>
            <input 
              type="text" 
              value={user.nit} 
              readOnly 
              className="user-management-info-input user-management-info-input-readonly"
            />
          </div>
        )}

        <div className="user-management-info-field">
          <label className="user-management-info-label">Correo electrónico:</label>
          <input 
            type="email" 
            value={user.email} 
            readOnly 
            className="user-management-info-input user-management-info-input-readonly"
          />
        </div>

        <div className="user-management-info-field">
          <label className="user-management-info-label">Teléfono:</label>
          <input 
            type="text" 
            value={user.phone} 
            readOnly 
            className="user-management-info-input user-management-info-input-readonly"
          />
        </div>

        <div className="user-management-info-field">
          <label className="user-management-info-label">Fecha de registro:</label>
          <input 
            type="text" 
            value={user.registrationDate} 
            readOnly 
            className="user-management-info-input user-management-info-input-readonly"
          />
        </div>

        <div className="user-management-info-field">
          <label className="user-management-info-label">Rol:</label>
          <select 
            value={selectedRole || user.role} 
            onChange={(e) => setSelectedRole(e.target.value)}
            className="user-management-info-select"
          >
            <option value="Reciclador">Reciclador</option>
            <option value="Recolector">Recolector</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>
      </div>

      <div className="user-management-info-actions">
        <button 
          className="user-management-info-delete-btn"
          onClick={handleDeleteClick}
        >
          Borrar usuario
        </button>
        <button 
          className="user-management-info-save-btn"
          onClick={handleSaveClick}
        >
          Guardar Cambios
        </button>
      </div>

      {showSaveModal && (
        <CheckModal
          title="¿Guardar cambios?"
          message="¿Estás seguro de que deseas guardar los cambios realizados a este usuario?"
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
        />
      )}

      {showDeleteModal && (
        <CheckModal
          title="¿Borrar usuario?"
          message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este usuario permanentemente?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          title="¡Rol actualizado!"
          message="El rol del usuario se ha actualizado correctamente"
          redirectUrl={window.location.href}
        />
      )}

      {showDeleteSuccessModal && (
        <SuccessModal
          title="¡Usuario eliminado!"
          message="El usuario ha sido eliminado correctamente"
          redirectUrl={window.location.href}
        />
      )}
    </div>
  );
}