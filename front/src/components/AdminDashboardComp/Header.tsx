import './AdminDashboard.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import NotificationBell from '../CommonComp/NotificationBell';

export default function Header() {
  return (
    <div className="dashboard-header d-flex justify-content-between align-items-center px-3 py-2">
      <div>
        <h1 className="dashboard-header-title m-0">Panel de control</h1>
      </div>

      <div className="dashboard-header-actions d-flex align-items-center gap-3">
        {/* Buscador */}
        <div className="dashboard-header-search d-flex align-items-center">
          <input
            type="text"
            placeholder="Buscar..."
            className="form-control form-control-sm"
          />
        </div>

        {/* Usuario con Bootstrap Dropdown */}
        <div className="dropdown">
          <button
            className="btn btn-light d-flex align-items-center dropdown-toggle"
            type="button"
            id="userMenu"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div className="dashboard-header-user-avatar me-2">JS</div>
            Joel Saavedra
          </button>
          <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
            <li>
              <button className="dropdown-item">Información de usuario</button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item">Cerrar sesión</button>
            </li>
          </ul>
        </div>

        {/* Notificaciones */}
        <div>
          {(() => {
            // Obtener usuario desde localStorage para pasar el ID al componente
            try {
              const user = JSON.parse(localStorage.getItem('user') || 'null');
              return user?.id ? <NotificationBell userId={user.id} /> : null;
            } catch {
              return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
}
