import { useEffect, useState } from "react";
import "./RecyclingInterface.css";
import Header from "./headerRecycler";
import { useNavigate } from "react-router-dom";
import RequestAndAppoint from "./request_&_appoint";

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
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    //Revisa si hay un usuario con la sesión iniciada
   if (!userStr) {

      navigate("/login", { replace: true });
      return;
    }

    setUser(JSON.parse(userStr));
  }, [navigate]);

  return (
    <div className="recycling-container">
      {/* Header separado */}
      <Header user={user} />

      <div className="main-content">
        {/* Banner Izquierdo */}
        <div className="banner-left"></div>

        {/* Sección Reciclaje */}
        <div className="recycling-section">
          <button className="recycling-button">♻️ R E C I C L A ♻️</button>

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
       <RequestAndAppoint />
    </div>
    
  );
};

export default RecyclingInterface;
