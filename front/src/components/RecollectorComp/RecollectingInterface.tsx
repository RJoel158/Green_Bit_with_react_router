import { useEffect, useState } from "react";
import "../RecyclerComp/RecyclingInterface.css";
import Header from "../RecyclerComp/headerRecycler";
import { useNavigate } from "react-router-dom";
import RequestAndAppoint from "../RecyclerComp/request_&_appoint";
import ChangePasswordModal from "../PasswordComp/ChangePasswordModal";
import AnnouncementBanner from "../CommonComp/AnnouncementBanner";

interface Recycler {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  state: number;
  avatar?: string;
}

const recyclers: Recycler[] = [
  { id: 1, name: "Joel Saavedra", points: 120, avatar: "https://i.pravatar.cc/40?img=1" },
  { id: 2, name: "María Pérez", points: 110, avatar: "https://i.pravatar.cc/40?img=2" },
  { id: 3, name: "Carlos Gómez", points: 95, avatar: "https://i.pravatar.cc/40?img=3" },
];

const RecollectingInterface: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    //Revisa si hay un usuario con la sesión iniciada
   if (!userStr) {

      navigate("/login", { replace: true });
      return;
    }

    const u = JSON.parse(userStr);
    u.state = Number(u.state); // asegurarse de que sea número

    // Ensure email property exists (fallback to username if needed)
    if (!u.email && u.username) {
      u.email = u.username;
    }

    setUser(u);

    if (u.state === 1) {
      console.log("✅ El modal de cambio de contraseña debería aparecer"); // <-- Aquí
      setShowModal(true);
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);
   if (!user) return null;

  return (
    
    <div className="recycling-container">
      {/* Header separado */}
      <Header user={user} />
      {showModal && (
        <ChangePasswordModal
          userId={user.id}
          role={user.role}
          
        />
      )}
      <div className="main-content">
        {/* Banner Izquierdo con Anuncios */}
        <AnnouncementBanner role="recolector" position="left" />

        {/* Sección Reciclaje */}
        <div className="recycling-section">
          <button className="recycling-button"
            onClick={() => navigate("/recycling-points")}
            >♻️R E C O L E C T A♻️</button>
          <button className="recycling-button"
            onClick={() => navigate("/adminUserManagement")}
            >Admin User</button>
          
          {/* Botón para ver puntos de reciclaje */}

          <div className="recyclers-card">
            <h3 className="card-title">Top Recicladores</h3>
            <p className="card-subtitle">Índice de reciclaje este mes</p>

            <div className="recyclers-list">
              {recyclers.map((recycler: Recycler) => (
                <div key={recycler.id} className="recycler-item">
                  <div className="recycler-avatar">
                    <img src={recycler.avatar} alt={recycler.name} />
                  </div>
                  <span className="recycler-name">{recycler.name}</span>
                  <span className="recycler-points">{recycler.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner Derecho con Anuncios */}
        <AnnouncementBanner role="recolector" position="right" />
      </div>
       <RequestAndAppoint user={user} />
    </div>
    
  );
};

export default RecollectingInterface;
