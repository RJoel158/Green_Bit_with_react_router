import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecyclingInterface.css";
import Header from "./headerRecycler";
import RequestAndAppoint from "./request_&_appoint";
import ChangePasswordModal from "../PasswordComp/ChangePasswordModal";

interface Recycler {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

interface User {
  id: number;
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

const RecyclingInterface: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    // Si no hay sesión activa -> redirige al login
    if (!userStr) {
      navigate("/login", { replace: true });
      return;
    }

    const u: User = JSON.parse(userStr);
    u.state = Number(u.state); // asegurarse que sea número
    setUser(u);

    // Si el estado es 1, mostrar modal de cambio de contraseña
    if (u.state === 1) {
      setShowModal(true);
    }
  }, [navigate]);

  if (!user) return null;

  // Maneja el click en el botón de reciclar
  const handleRecycleClick = () => {
    navigate("/recycle-form"); // navega al formulario
  };

  return (
    <div className="recycling-container">
      {/* Header */}
      <Header user={user} />

      {/* Modal de cambio de contraseña */}
      {showModal && (
        <ChangePasswordModal
          userId={user.id}
          role={user.role}
        />
      )}

      <div className="main-content">
        {/* Banner Izquierdo */}
        <div className="banner-left"></div>

        {/* Sección Reciclaje */}
        <div className="recycling-section">
          <button className="recycling-button" onClick={handleRecycleClick}>
            ♻️ R E C I C L A ♻️
          </button>

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

        {/* Banner Derecho */}
        <div className="banner-right"></div>
      </div>

      {/* Request and Appoint */}
      <RequestAndAppoint />
    </div>
  );
};

export default RecyclingInterface;