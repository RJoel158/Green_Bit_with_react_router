// UserInfoPanel.tsx
import { useState } from 'react';
import './UserManagement.css';
import CheckModal from '../CommonComp/CheckModal';

interface User {
  fullName: string;
  email: string;
  registrationDate: string;
  role: string;
}

interface UserInfoPanelProps {
  user: User | null;
}

export default function UserInfoPanel({ user }: UserInfoPanelProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmSave = () => {
    // Aquí puedes agregar la lógica para guardar los cambios
    console.log('Cambios guardados');
    setShowSaveModal(false);
    // TODO: Implementar la lógica de guardado
  };

  const handleConfirmDelete = () => {
    // Aquí puedes agregar la lógica para borrar el usuario
    console.log('Usuario borrado');
    setShowDeleteModal(false);
    // TODO: Implementar la lógica de borrado
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

  return (
    <div className="user-management-info-panel">
      <div className="user-management-info-header">
        <h3 className="user-management-info-title">Usuario</h3>
        <div 
          className={`user-management-info-avatar ${
            user.role === 'Recolector' 
              ? 'user-management-info-avatar-collector' 
              : 'user-management-info-avatar-recycler'
          }`}
        >
          {user.fullName.split(' ').map(n => n[0]).join('')}
        </div>
        <h2 className="user-management-info-name">{user.fullName}</h2>
        <p className="user-management-info-role">{user.role}</p>
      </div>

      <div className="user-management-info-form">

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
          <select value={user.role} className="user-management-info-select">
            <option>Reciclador</option>
            <option>Recolector</option>
            <option>Administrador</option>
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
    </div>
  );
}