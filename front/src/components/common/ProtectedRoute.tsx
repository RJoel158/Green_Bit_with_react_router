// ProtectedRoute.tsx - Componente para proteger rutas basado en roles
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: number[]; // roleId: 1=Admin, 2=Recolector, 3=Reciclador
  redirectTo?: string;
}

interface User {
  id: number;
  email: string;
  roleId?: number; // Nuevo formato
  role?: string;   // Formato del backend: "admin", "recolector", "reciclador"
  state: number;
}

/**
 * Mapeo de roles string a roleId numérico
 */
const getRoleId = (user: User): number | null => {
  // Si ya tiene roleId, usarlo
  if (user.roleId) {
    return user.roleId;
  }
  
  // Mapear desde role string
  if (user.role) {
    const roleMap: { [key: string]: number } = {
      'admin': 1,
      'administrador': 1,
      'recolector': 2,
      'reciclador': 3
    };
    return roleMap[user.role.toLowerCase()] || null;
  }
  
  return null;
};

/**
 * Componente que protege rutas según el rol del usuario
 * 
 * Roles:
 * - 1: Administrador (acceso a todo)
 * - 2: Recolector (solo interfaz recolector, mapa, detalles de citas)
 * - 3: Reciclador (solo interfaz reciclador, formulario, detalles de citas)
 */
export default function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('[ProtectedRoute] User loaded from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('[ProtectedRoute] Error parsing user from localStorage:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.warn('[ProtectedRoute] No user found in localStorage');
    }
    setLoading(false);
  }, []);

  // Mientras carga, no mostrar nada
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#FAF8F1'
      }}>
        <div style={{
          fontSize: '1.2rem',
          color: '#149D52',
          fontWeight: '600'
        }}>
          Cargando...
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    console.warn('[ProtectedRoute] No user found, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // Obtener roleId del usuario
  const userRoleId = getRoleId(user);
  
  // Si el usuario no tiene un rol válido
  if (!userRoleId) {
    console.error('[ProtectedRoute] User has no valid role:', user);
    return <Navigate to={redirectTo} replace />;
  }

  console.log('[ProtectedRoute] User roleId:', userRoleId, 'Allowed roles:', allowedRoles);

  // Administrador tiene acceso a todo
  if (userRoleId === 1) {
    console.log('[ProtectedRoute] Admin access granted');
    return children;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  if (!allowedRoles.includes(userRoleId)) {
    console.warn(
      `[ProtectedRoute] Access denied. User role: ${userRoleId} (${user.role}), Allowed roles: ${allowedRoles}`
    );
    
    // Redirigir a la página correspondiente según el rol
    switch (userRoleId) {
      case 2: // Recolector
        return <Navigate to="/recolectorIndex" replace />;
      case 3: // Reciclador
        return <Navigate to="/recicladorIndex" replace />;
      default:
        return <Navigate to={redirectTo} replace />;
    }
  }

  // Si todo está bien, renderizar el componente hijo
  console.log('[ProtectedRoute] Access granted');
  return children;
}
