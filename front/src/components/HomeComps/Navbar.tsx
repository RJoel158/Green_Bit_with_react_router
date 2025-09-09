import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="bg-dark">
      <nav className="navbar navbar-expand-md navbar-dark container">
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div style={{width:48,height:48,borderRadius:8,background:"#fff2",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"white"}}>EV</div>
          <div className="ms-2">
            <div className="fw-bold">EcoVerde Ya tu Sabe'</div>
            <small className="text-muted" style={{opacity:0.8}}>Transformando el futuro a través del reciclaje</small>
          </div>
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><a className="nav-link" href="#quienes">Quiénes Somos</a></li>
            <li className="nav-item"><a className="nav-link" href="#servicios">Servicios</a></li>
            <li className="nav-item"><a className="nav-link" href="#proyectos">Proyectos</a></li>
            <li className="nav-item"><a className="nav-link" href="#comunidad">Comunidad</a></li>
            <li className="nav-item ms-3"><Link className="btn btn-outline-light rounded-pill" to="/login">Iniciar Sesión</Link></li>
            <li className="nav-item ms-2"><Link className="btn brand-btn" to="/register">Regístrate</Link></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
