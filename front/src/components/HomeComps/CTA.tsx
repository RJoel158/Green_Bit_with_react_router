import React from "react";
import { Link } from "react-router-dom";

export default function CTA(){
  return (
    <section className="py-5" style={{background:"linear-gradient(90deg,var(--verde-2),var(--verde-1))", color:"white"}}>
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-1 fw-bold">¿Listo para reciclar con nosotros?</h4>
          <p className="mb-0 text-white-50">Solicita una reunión y te ayudamos a implementar un plan.</p>
        </div>
        <div>
          <Link to="/register" className="brand-btn text-decoration-none">Comenzar Ahora</Link>
        </div>
      </div>
    </section>
  );
}
