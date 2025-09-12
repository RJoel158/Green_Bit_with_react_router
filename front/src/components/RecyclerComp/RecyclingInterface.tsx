import { useEffect, useState } from "react";
import "./RecyclingInterface.css";
import Header from "./headerRecycler";

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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <div className="recycling-container">
      {/* Header separado */}
      <Header user={user} />

      <div className="main-content">
        {/* Left Banner */}
        <div className="banner-left">
          <div className="banner-content">
            <div className="banner-arrows">
              <div className="arrow-up">⬆</div>
              <div className="arrow-up">⬆</div>
              <div className="arrow-up">⬆</div>
            </div>
            <h1 className="banner-title">YOUR HEADLINE HERE</h1>
            <p className="banner-subtitle">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem.
            </p>
            <button className="banner-button">Button 1.0</button>
            <div className="banner-pattern">
              <div className="dots"></div>
            </div>
          </div>
          <div className="banner-person">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23000'/%3E%3C/svg%3E"
              alt="Person"
            />
          </div>
        </div>

        {/* Center Recycling Section */}
        <div className="recycling-section">
          <div className="recycling-header">
            <div className="recycle-icon">♻️</div>
            <h2 className="recycling-title">R E C I C L A</h2>
            <div className="recycle-icon">♻️</div>
          </div>

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

        {/* Right Banner */}
        <div className="banner-right">
          <div className="banner-content">
            <div className="banner-arrows">
              <div className="arrow-up">⬆</div>
              <div className="arrow-up">⬆</div>
              <div className="arrow-up">⬆</div>
            </div>
            <h1 className="banner-title">YOUR HEADLINE HERE</h1>
            <p className="banner-subtitle">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quidem.
            </p>
            <button className="banner-button">Button 1.0</button>
            <div className="banner-pattern">
              <div className="dots"></div>
            </div>
          </div>
          <div className="banner-person">
            <img
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%23000'/%3E%3C/svg%3E"
              alt="Person"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecyclingInterface;
