import 'bootstrap-icons/font/bootstrap-icons.css';

const ServiceCard = ({ 
  icon, 
  title, 
  children 
}: { 
  icon: string; 
  title: string; 
  children: React.ReactNode; 
}) => (
  <div className="col-md-4 mb-4">
    <div className="service-card fade-in-up">
      <div className="service-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="service-title text-center">{title}</h5>
      <p className="service-description text-center">{children}</p>
    </div>
  </div>
);

export default function Services() {
  return (
    <section id="servicios" className="services-section">
      <div className="container">
        <h3 className="text-center mb-5 landing-title">
          Soluciones integrales para un futuro sostenible
        </h3>
        <div className="row">
          <ServiceCard icon="bi-truck" title="Recolección inteligente">
            Servicios programados y rutas optimizadas para maximizar la eficiencia
            y reducir el impacto ambiental en cada recolección.
          </ServiceCard>
          <ServiceCard icon="bi-recycle" title="Procesamiento industrial">
            Tratamiento avanzado y valorización de residuos complejos con tecnología
            de punta para el máximo aprovechamiento.
          </ServiceCard>
          <ServiceCard icon="bi-lightbulb" title="Consultoría y educación">
            Capacitaciones especializadas y proyectos de economía circular para
            transformar organizaciones y comunidades.
          </ServiceCard>
        </div>
      </div>
    </section>
  );
}