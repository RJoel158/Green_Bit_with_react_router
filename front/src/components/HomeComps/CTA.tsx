import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-5 cta-section">
      <div className="container">
        <div className="cta-content">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            <div className="text-center text-md-start">
              <h4 className="mb-2 fw-bold text-white">
                ¿Listo para reciclar con nosotros?
              </h4>
              <p className="mb-0 text-white-75 opacity-75">
                Solicita una reunión y te ayudamos a implementar un plan sostenible
                personalizado para tu organización.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/register" 
                className="brand-btn"
              >
                Comenzar Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}