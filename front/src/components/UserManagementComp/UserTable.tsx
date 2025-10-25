// UserTable.tsx
import { useState } from 'react';
import './UserManagement.css';

interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string; 
  registrationDate: string;
  role: string;
  // Campos opcionales para instituciones
  companyName?: string;
  nit?: string;
}

interface UserTableProps {
  users: User[];
  onSelectUser: (user: User) => void;
  userType?: 'Persona' | 'Empresa'; 
}

export default function UserTable({ users, onSelectUser, userType = 'Persona' }: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handleSelectUser = (user: User) => {
    setSelectedUserEmail(user.email);
    onSelectUser(user);
  };

  return (
    <div className="user-management-table-container">
      <div className="user-management-table-scroll">
        <table className="user-management-table">
          <thead>
            <tr className="user-management-table-head-row">
              {userType === 'Persona' ? (
                <>
                  <th className="user-management-table-head-cell">Nombre Completo</th>
                  <th className="user-management-table-head-cell">Correo electrónico</th>
                  <th className="user-management-table-head-cell">Teléfono</th>
                  <th className="user-management-table-head-cell">Fecha de registro</th>
                  <th className="user-management-table-head-cell">Rol</th>
                </>
              ) : (
                <>
                  <th className="user-management-table-head-cell">Nombre de Empresa</th>
                  <th className="user-management-table-head-cell">NIT</th>
                  <th className="user-management-table-head-cell">Correo electrónico</th>
                  <th className="user-management-table-head-cell">Teléfono</th>
                  <th className="user-management-table-head-cell">Fecha de registro</th>
                  <th className="user-management-table-head-cell">Rol</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr 
                key={user.userId}
                data-user-id={user.userId}
                className={`user-management-table-body-row ${
                  selectedUserEmail === user.email ? 'selected' : ''
                }`}
                onClick={() => handleSelectUser(user)}
              >
                {userType === 'Persona' ? (
                  <>
                    <td className="user-management-table-body-cell">
                      <div className="user-management-table-user-cell">
                        <div className={`user-management-table-avatar ${
                          user.role === 'Recolector' 
                            ? 'user-management-table-avatar-collector' 
                            : 'user-management-table-avatar-recycler'
                        }`}>
                          {user.fullName.charAt(0)}
                        </div>
                        {user.fullName}
                      </div>
                    </td>
                    <td className="user-management-table-body-cell">{user.email}</td>
                    <td className="user-management-table-body-cell">{user.phone}</td>
                    <td className="user-management-table-body-cell">{user.registrationDate}</td>
                    <td className="user-management-table-body-cell">{user.role}</td>
                  </>
                ) : (
                  <>
                    <td className="user-management-table-body-cell">
                      <div className="user-management-table-user-cell">
                        <div className="user-management-table-avatar user-management-table-avatar-collector">
                          {user.companyName?.charAt(0) || 'E'}
                        </div>
                        {user.companyName || user.fullName}
                      </div>
                    </td>
                    <td className="user-management-table-body-cell">{user.nit || 'N/A'}</td>
                    <td className="user-management-table-body-cell">{user.email}</td>
                    <td className="user-management-table-body-cell">{user.phone}</td>
                    <td className="user-management-table-body-cell">{user.registrationDate}</td>
                    <td className="user-management-table-body-cell">{user.role}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="user-management-table-pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="user-management-table-pagination-btn"
        >
          ◀
        </button>
        <span className="user-management-table-pagination-page">{currentPage}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="user-management-table-pagination-btn"
        >
          ▶
        </button>
      </div>
    </div>
  );
}