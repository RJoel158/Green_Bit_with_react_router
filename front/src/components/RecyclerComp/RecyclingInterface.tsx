import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecyclingInterface.css";
import Header from "./headerRecycler";
import { getActiveOrLastPeriod, getLiveRanking, getHistoricalRanking } from "../../services/rankingService";
import RequestAndAppoint from "./request_&_appoint";
import ChangePasswordModal from "../PasswordComp/ChangePasswordModal";
import AnnouncementBanner from "../CommonComp/AnnouncementBanner";

interface Recycler {
  id: number;
  name?: string;
  points?: number;
  avatar?: string;
  rol?: string;
  user_id?: number;
  email?: string;
  puntaje_final?: number;
}

// Definición de la interfaz User
interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  state: number;
  avatar?: string;
}

// El top real se carga dinámicamente
const RecyclingInterface: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [periodState, setPeriodState] = useState<'activo' | 'cerrado' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login", { replace: true });
      return;
    }
    const u = JSON.parse(userStr);
    u.state = Number(u.state);
    if (!u.email) {
      u.email = "";
    }
    setUser(u as User);
    if (u.state === 1) {
      setShowModal(true);
    }
    async function fetchTop() {
      try {
        const period = await getActiveOrLastPeriod();
        console.log('Periodo recibido:', period);
        setPeriodState(period.estado);
        if (period.estado === 'activo') {
          const top = await getLiveRanking(period.id, 'reciclador');
          console.log('Top recibido (activo):', top);
          if (top && Array.isArray(top)) {
            setRecyclers(top);
          } else if (top && Array.isArray(top.recicladores)) {
            setRecyclers(top.recicladores);
          } else {
            setRecyclers([]);
          }
        } else {
          const top = await getHistoricalRanking(period.id, 'reciclador');
          setRecyclers(Array.isArray(top) ? top : []);
        }
      } catch (err) {
        setRecyclers([]);
      }
    }
    fetchTop();
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
        {/* Banner Izquierdo con Anuncios */}
        <AnnouncementBanner role="reciclador" position="left" />

        {/* Sección Reciclaje */}
        <div className="recycling-section">
          <button className="recycling-button" onClick={handleRecycleClick}>
          ♻️R E C I C L A♻️
          </button>

          <div className="recyclers-card">
            <h3 className="card-title">Top Recicladores</h3>
            <p className="card-subtitle">
              {periodState === 'activo' ? 'Índice de reciclaje este mes' : 'Último ranking de periodo cerrado'}
            </p>

            <div className="recyclers-list">
              {recyclers
                .filter(r => r.rol === 'reciclador')
                .slice(0, 5)
                .map((recycler, idx) => (
                  <div key={recycler.user_id || recycler.id || idx} className="recycler-item">
                    <div className="recycler-avatar">
                      <img src={recycler.avatar || `https://i.pravatar.cc/40?img=${idx+1}`} alt={recycler.name || recycler.email || 'Reciclador'} />
                    </div>
                    <span className="recycler-name">{recycler.name || recycler.email || 'Reciclador'}</span>
                    <span className="recycler-points">{recycler.puntaje_final || recycler.points || 0}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Banner Derecho con Anuncios */}
        <AnnouncementBanner role="reciclador" position="right" />
      </div>

      {/* Request and Appoint */}
      <RequestAndAppoint user={user} />
    </div>
  );
};

export default RecyclingInterface;