import { useEffect, useState } from "react";
import "./UserInfo.css";
import HeaderUserInfo from "./HeaderUserInfo";
import { useNavigate } from "react-router-dom";

//Estructura del usuario
interface User {
  userId: number;
  email: string;
  phone: string;
  registerDate: string;
  avatar?: string;
  score?: number;
  // Campos de Persona
  firstname?: string;
  lastname?: string;
  // Campos de Institución
  companyName?: string;
  nit?: string;
}

const UserInfo: React.FC = () => {
  //Guardar información de usuario y rol
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigate=useNavigate();

  useEffect(() => {
    
    const userStr = localStorage.getItem("user");
    //Revisa si hay un usuario con la sesión iniciada
    if(!userStr){
      navigate("/login", { replace: true });
      return;
    }
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setRole(parsedUser.role);
      const userId = parsedUser.id;
      
      // Buscar id como persona
  fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            // Si firstname y lastname no son null, es persona
            if (data.user.firstname !== null && data.user.lastname !== null) {
              setUser(data.user);
              setLoading(false);
            } else {
              // firstname y lastname son null, intentar como institución
              fetch(`${import.meta.env.VITE_API_URL}/api/users/withInstitution/${userId}`)
                .then((res) => res.json())
                .then((institutionData) => {
                  if (institutionData.success && institutionData.user) {
                    setUser(institutionData.user);
                  }
                  setLoading(false);
                })
                .catch((err) => {
                  console.error('Error al obtener institución:', err);
                  setLoading(false);
                });
            }
          } else {
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error al obtener usuario:', err);
          setLoading(false);
        });
    }
  }, [navigate]);

  const handleBack = () => {
    window.history.back();
  };
  const handleLogout = () => {
    localStorage.removeItem("user"); // borra la sesión
    window.location.replace("/login");// reemplaza la URL y evita volver atrás
  };

  // Establecer si es institución o persona para mostrar nombre adecuado
  const isInstitution = !!(user?.companyName || user?.nit);
  
  const displayName = isInstitution 
    ? (user?.companyName || 'Empresa')
    : user?.firstname && user?.lastname 
      ? `${user.firstname} ${user.lastname}`.trim()
      : 'Nombre completo';

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="user-info-container">
        <HeaderUserInfo />
        <div className="user-info-wrapper">
          <div className="user-info-card">
            <div className="loading-container">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="loading-text">Cargando información...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-info-container">
      <HeaderUserInfo />

      <div className="user-info-wrapper">
        <div className="user-info-card">
          <h2 className="user-title">
            {displayName}
          </h2>

          <div className="user-avatar-large" style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            margin: '20px auto'
          }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              backgroundColor: '#149D52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              fontWeight: 'bold',
              color: 'white',
              lineHeight: '1',
              textAlign: 'center'
            }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          <div className="user-role mt-3 mb-4">
            <span className="role-badge">{role || "Rol"}</span>
          </div>

          <div className="user-form">
            {isInstitution && user?.nit && (
              <div className="form-group">
                <label>NIT:</label>
                <input
                  type="text"
                  className="form-control form-input"
                  value={user.nit}
                  readOnly
                />
              </div>
            )}

            <div className="form-group">
              <label>Número de Referencia:</label>
              <input
                type="text"
                className="form-control form-input"
                value={user?.phone || ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Correo electrónico:</label>
              <input
                type="email"
                className="form-control form-input"
                value={user?.email || ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Inicio como {role || ""}:</label>
              <input
                type="text"
                className="form-control form-input"
                value={user ? new Date(user.registerDate).toLocaleDateString() : ""}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Total de Puntos:</label>
              <div className="points-input d-flex align-items-center">
                <input
                  type="text"
                  className="form-control form-input"
                  value={user?.score || 0}
                  readOnly
                />
               
              </div>
            </div>
          </div>

          <div className="action-buttons text-center mt-4">
            <button className="btn btn-close-session" onClick={handleLogout }>Cerrar sesión</button>
          </div>
        </div>
      </div>


      <button className="btn-back btn btn-outline-success" onClick={handleBack}>
        ← Volver
      </button>
    </div>
  );
};

export default UserInfo;
