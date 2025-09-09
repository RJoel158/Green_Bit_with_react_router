import { Link } from "react-router-dom";
import logo from '../../assets/logo.png';

export default function Navbar() {
  return (
    <header className="sticky-top">
      <nav className="navbar navbar-expand-lg py-2" style={{ backgroundColor: '#4a7c59' }}>
        <div className="container-fluid px-3">
          {/* Logo y marca - pegado a la izquierda */}
          <Link className="navbar-brand d-flex align-items-center gap-3 me-0" to="/">
            <img
              src={logo}
              alt="GreenBit logo"
              style={{ 
                width: 140, 
                height: 140, 
                objectFit: 'contain',
                marginTop: '-10px',
                marginBottom: '-10px'
              }}
            />  
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold text-white" style={{ 
                fontSize: '1.8rem',
                letterSpacing: '-0.5px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                GreenBit
              </span>
              <small className="text-white-75" style={{ 
                fontSize: '0.9rem',
                fontWeight: '400',
                opacity: '0.85'
              }}>
                Transformando el futuro
              </small>
            </div>
          </Link>

          {/* Toggler para móvil */}
                    <button
            className="navbar-toggler border-0 p-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon custom-toggler-icon" />
          </button>

          {/* Menú de navegación */}
          <div className="collapse navbar-collapse" id="navbarNav">
           <ul className="navbar-nav mx-auto align-items-lg-center">
  <li className="nav-item">
    <a className="nav-link px-3 fw-semibold text-white" href="#quienes">
      Quiénes Somos
    </a>
  </li>

  <li className="nav-item">
    <a className="nav-link px-3 fw-semibold text-white" href="#mision">
      Misión
    </a>
  </li>

  <li className="nav-item">
    <a className="nav-link px-3 fw-semibold text-white" href="#servicios">
      Servicios
    </a>
  </li>

  <li className="nav-item">
    <a className="nav-link px-3 fw-semibold text-white" href="#proyectos">
      Proyectos
    </a>
  </li>

  <li className="nav-item">
    <a className="nav-link px-3 fw-semibold text-white" href="#comunidad">
      Comunidad
    </a>
  </li>

  <li className="nav-item">
    <a className="nav-link px-3 fw-semibold text-white" href="#contacto">
      Contacto
    </a>
  </li>
</ul>
            
            {/* Botones profesionales - pegados a la derecha */}
            <div className="d-flex align-items-center gap-2 ms-auto">
              <Link 
                className="btn fw-semibold px-4 py-2 border-0 position-relative overflow-hidden"
                to="/login"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.9rem',
                  minWidth: '120px',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'none';
                }}
              >
                Iniciar Sesión
              </Link>
              
              <Link 
                className="btn fw-semibold px-4 py-2 border-0 position-relative overflow-hidden"
                to="/register"
                style={{ 
                  backgroundColor: '#90EE90',
                  color: '#2d5016',
                  borderRadius: '8px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '0.9rem',
                  minWidth: '100px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(144, 238, 144, 0.3)'
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#7ed87e';
                  target.style.transform = 'translateY(-2px)';
                  target.style.boxShadow = '0 6px 16px rgba(144, 238, 144, 0.4)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#90EE90';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = '0 2px 8px rgba(144, 238, 144, 0.3)';
                }}
              >
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}