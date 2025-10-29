// UserManagement.tsx
import { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import UserTable from './UserTable';
import UserInfoPanel from './UserInfoPanel';
import CreateUserModal from './CreateUserModal';
import './UserManagement.css';

interface User {
  userId: number;
  email: string;
  phone: string;
  roleId: number;
  userState: number;
  registerDate: string;
  // Campos de Persona
  firstname?: string;
  lastname?: string;
  personState?: number;
  // Campos de Institution
  companyName?: string;
  nit?: string;
  institutionId?: number;
  institutionState?: number;
}

interface TableUser {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  role: string;
  // Agregar campos opcionales para determinar tipo de usuario
  firstname?: string;
  lastname?: string;
  companyName?: string;
  nit?: string;
}

type UserType = 'Persona' | 'Empresa';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userType, setUserType] = useState<UserType>('Persona');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapeo de roleId a nombre de rol
  const getRoleName = (roleId: number): string => {
    const roles: { [key: number]: string } = {
      1: 'Administrador',
      2: 'Recolector',
      3: 'Reciclador',
    };
    return roles[roleId] || 'Desconocido';
  };

  // Función para obtener usuarios según el tipo
  const fetchUsers = async (type: UserType) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = type === 'Persona' 
  ? `${import.meta.env.VITE_API_URL}/api/users/withPerson` 
  : `${import.meta.env.VITE_API_URL}/api/users/withInstitution`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError('Error al obtener usuarios');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al cargar la página y cuando cambie el tipo
  useEffect(() => {
    fetchUsers(userType);
  }, [userType]);

  // Convertir usuarios al formato de la tabla
  const formatUsersForTable = (): TableUser[] => {
    return users.map(user => {
      const fullName = userType === 'Persona'
        ? `${user.firstname || ''} ${user.lastname || ''}`.trim()
        : user.companyName || '';

      return {
        userId: user.userId,
        fullName: fullName || 'Sin nombre',
        email: user.email,
        phone: user.phone, 
        registrationDate: new Date(user.registerDate).toLocaleDateString('es-ES'),
        role: getRoleName(user.roleId),
        // Pasar campos adicionales para determinar el tipo
        firstname: user.firstname,
        lastname: user.lastname,
        companyName: user.companyName,
        nit: user.nit,
      };
    });
  };

  // Filtrar usuarios según la búsqueda y el rol usando useMemo
  const filteredUsers = useMemo(() => {
    let filtered = formatUsersForTable();

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Filtrar por rol
    if (roleFilter !== 'Todos') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    return filtered;
  }, [users, searchQuery, roleFilter, userType]);

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setSelectedUser(null); // Limpiar selección al cambiar tipo
    setSearchQuery(''); // Limpiar búsqueda al cambiar tipo
    setRoleFilter('Todos'); // Limpiar filtro de rol al cambiar tipo
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
  };

  const handleUserCreated = () => {
    // Recargar la lista de usuarios después de crear uno nuevo
    fetchUsers(userType);
  };

  return (
    <div className="user-management-dashboard">
      <div className="user-management-main">
        <Header 
          userType={userType}
          onUserTypeChange={handleUserTypeChange}
          onCreateUser={() => setIsModalOpen(true)}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
        />
        <div className="user-management-content">
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Cargando usuarios...
            </div>
          )}
          
          {error && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#ef4444',
              backgroundColor: '#fee2e2',
              borderRadius: '0.5rem',
              margin: '1rem 0'
            }}>
              {error}
            </div>
          )}
          
          {!loading && !error && (
            <div className="user-management-layout">
              <UserTable 
                key={`users-${searchQuery}-${roleFilter}`}
                users={filteredUsers} 
                onSelectUser={setSelectedUser}
                userType={userType}
              />
              <UserInfoPanel 
                user={selectedUser}
                userType={userType}
                onUserUpdated={() => fetchUsers(userType)}
              />
            </div>
          )}
        </div>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}