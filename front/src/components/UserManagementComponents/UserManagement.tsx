// UserManagement.tsx
import { useState, useEffect } from 'react';
import Sidebar from '../AdminDashboardComp/Sidebar';
import Header from './Header';
import UserTable from './UserTable';
import UserInfoPanel from './UserInfoPanel';
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
  fullName: string;
  email: string;
  registrationDate: string;
  role: string;
}

type UserType = 'Persona' | 'Empresa';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState<TableUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userType, setUserType] = useState<UserType>('Persona');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        ? 'http://localhost:3000/api/users/withPerson' 
        : 'http://localhost:3000/api/users/withInstitution';
      
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

  // Cargar usuarios al montar el componente y cuando cambie el tipo
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
        fullName: fullName || 'Sin nombre',
        email: user.email,
        registrationDate: new Date(user.registerDate).toLocaleDateString('es-ES'),
        role: getRoleName(user.roleId),
      };
    });
  };

  // Filtrar usuarios según la búsqueda
  const filterUsers = (usersToFilter: TableUser[]): TableUser[] => {
    if (!searchQuery.trim()) {
      return usersToFilter;
    }

    const query = searchQuery.toLowerCase().trim();
    return usersToFilter.filter(user => 
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setSelectedUser(null); // Limpiar selección al cambiar tipo
    setSearchQuery(''); // Limpiar búsqueda al cambiar tipo
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="user-management-dashboard">
      <Sidebar />
      <div className="user-management-main">
        <Header 
          userType={userType}
          onUserTypeChange={handleUserTypeChange}
          onCreateUser={() => console.log('Crear usuario')}
          searchQuery={searchQuery}
          onSearch={handleSearch}
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
                users={filterUsers(formatUsersForTable())} 
                onSelectUser={setSelectedUser} 
              />
              <UserInfoPanel user={selectedUser} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}