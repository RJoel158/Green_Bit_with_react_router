import { useEffect, useState } from "react";
import "../RecyclerComp/RecyclingInterface.css";
import Header from "../RecyclerComp/headerRecycler";
import { getActiveOrLastPeriod, getLiveRanking, getHistoricalRanking } from "../../services/rankingService";
import { useNavigate } from "react-router-dom";
import RequestAndAppoint from "../RecyclerComp/request_&_appoint";
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

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  state: number;
  avatar?: string;
}

const RecollectingInterface: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [recyclers, setRecyclers] = useState<Recycler[]>([]);
  const [periodState, setPeriodState] = useState<'activo' | 'cerrado' | null>(null);
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
      setShowModal(true);
    }

    // Cargar el top dinámico
    async function fetchTop() {
      try {
        const period = await getActiveOrLastPeriod();
        console.log('Periodo recibido:', period);
        setPeriodState(period.estado);
        if (period.estado === 'activo') {
          const top = await getLiveRanking(period.id, 'recolector');
          console.log('Top recibido (activo):', top);
          if (top && Array.isArray(top)) {
            setRecyclers(top);
          } else if (top && Array.isArray(top.recolectores)) {
            setRecyclers(top.recolectores);
          } else {
            setRecyclers([]);
          }
        } else {
          const top = await getHistoricalRanking(period.id, 'recolector');
          setRecyclers(Array.isArray(top) ? top : []);
        }
      } catch (err) {
        setRecyclers([]);
      }
    }
    fetchTop();
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
            >♻️C O L E C T A♻️</button>
          
          
          {/* Botón para ver puntos de reciclaje */}

          <div className="recyclers-card">
            <h3 className="card-title">Top Recicladores</h3>
            <p className="card-subtitle">
              {periodState === 'activo' ? 'Índice de reciclaje este mes' : 'Último ranking de periodo cerrado'}
            </p>

            <div className="recyclers-list">
              {recyclers
                .filter(r => r.rol === 'recolector')
                .slice(0, 5)
                .map((recycler, idx) => (
                  <div key={recycler.user_id || recycler.id || idx} className="recycler-item">
                    <div className="recycler-avatar">
                      <img src={recycler.avatar || `https://i.pravatar.cc/40?img=${idx+1}`} alt={recycler.name || recycler.email || 'Recolector'} />
                    </div>
                    <span className="recycler-name">{recycler.name || recycler.email || 'Recolector'}</span>
                    <span className="recycler-points">{recycler.puntaje_final || recycler.points || 0}</span>
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
