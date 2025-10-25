// Header.tsx
import CommonHeader from '../CommonComp/CommonHeader';

interface HeaderProps {
  userType: 'Persona' | 'Empresa';
  onUserTypeChange: (type: 'Persona' | 'Empresa') => void;
  onCreateUser: () => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
}

export default function Header({ 
  userType, 
  onUserTypeChange, 
  onCreateUser,
  searchQuery,
  onSearch,
  roleFilter,
  onRoleFilterChange
}: HeaderProps) {
  
  // Filtros personalizados para gestión de usuarios
  const additionalFilters = (
    <>
      <select 
        className="user-management-header-type-select"
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        style={{
          marginRight: '0.5rem',
          padding: '0.5rem 1rem',
          border: '2px solid #B0EDCC',
          borderRadius: '0.5rem',
          backgroundColor: '#fff',
          color: '#149D52',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        <option value="Todos">Todos los roles</option>
        <option value="Administrador">Administrador</option>
        <option value="Recolector">Recolector</option>
        <option value="Reciclador">Reciclador</option>
      </select>
      <select 
        className="user-management-header-type-select"
        value={userType}
        onChange={(e) => onUserTypeChange(e.target.value as 'Persona' | 'Empresa')}
      >
        <option value="Persona">Persona</option>
        <option value="Empresa">Empresa</option>
      </select>
    </>
  );

  return (
    <CommonHeader
      title="Administrar usuarios"
      searchPlaceholder="Buscar por nombre o correo"
      searchQuery={searchQuery}
      onSearch={onSearch}
      onCreateNew={onCreateUser}
      createButtonText="+ Crear usuario"
      additionalFilters={additionalFilters}
    />
  );
}