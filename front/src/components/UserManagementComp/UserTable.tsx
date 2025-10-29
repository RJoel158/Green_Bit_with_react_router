// UserTable.tsx
import { useState } from 'react';
import SortableTable from '../common/SortableTable';
import type { ColumnDef } from '../common/SortableTable';
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

export default function UserTable({ 
  users, 
  onSelectUser, 
  userType = 'Persona'
}: UserTableProps) {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);

  const handleSelectUser = (user: User) => {
    setSelectedUserEmail(user.email);
    onSelectUser(user);
  };

  // Definir columnas según el tipo de usuario
  const personColumns: ColumnDef<User>[] = [
    {
      key: 'fullName',
      label: 'Nombre Completo',
      sortable: false,
      render: (user) => (
        <div className="user-management-table-user-cell">
          <div className={`user-management-table-avatar ${
            user.role === 'Recolector' 
              ? 'user-management-table-avatar-collector' 
              : 'user-management-table-avatar-recycler'
          }`}>
            {user.email.charAt(0).toUpperCase()}
          </div>
          {user.fullName}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Correo electrónico',
      sortable: false,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      sortable: false,
    },
    {
      key: 'registrationDate',
      label: 'Fecha de registro',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
    },
  ];

  const institutionColumns: ColumnDef<User>[] = [
    {
      key: 'companyName',
      label: 'Nombre de Empresa',
      sortable: false,
      render: (user) => (
        <div className="user-management-table-user-cell">
          <div className="user-management-table-avatar user-management-table-avatar-collector">
            {user.email.charAt(0).toUpperCase()}
          </div>
          {user.companyName || user.fullName}
        </div>
      ),
    },
    {
      key: 'nit',
      label: 'NIT',
      sortable: false,
      render: (user) => user.nit || 'N/A',
    },
    {
      key: 'email',
      label: 'Correo electrónico',
      sortable: false,
    },
    {
      key: 'phone',
      label: 'Teléfono',
      sortable: false,
    },
    {
      key: 'registrationDate',
      label: 'Fecha de registro',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
    },
  ];

  const columns = userType === 'Persona' ? personColumns : institutionColumns;

  return (
    <SortableTable
      data={users}
      columns={columns}
      onRowClick={handleSelectUser}
      selectedItemKey={selectedUserEmail || undefined}
      itemsPerPage={10}
      emptyMessage="No hay usuarios disponibles"
      getRowKey={(user) => user.email}
    />
  );
}