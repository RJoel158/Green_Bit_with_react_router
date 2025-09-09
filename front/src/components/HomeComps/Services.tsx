
import 'bootstrap-icons/font/bootstrap-icons.css';


const Card = ({ icon, title, children }: { icon: string; title: string; children: any }) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm h-100 text-center p-3 hover-shadow">
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex justify-content-center align-items-center"
             style={{ width: 70, height: 70, fontSize: "2rem" }}>
          <i className={`bi ${icon}`} color="black"></i>
        </div>
      </div>
      <div className="card-body">
        <h5 className="card-title fw-semibold">{title}</h5>
        <p className="card-text text-muted">{children}</p>
      </div>
    </div>
  </div>
);

export default function Services() {
  return (
    <section id="servicios" className="py-5 bg-light">
      <div className="container">
        <h3 className="text-center mb-5 landing-title">
          Soluciones integrales para un futuro sostenible
        </h3>
        <div className="row g-4">
          <Card icon="bi-truck" title="Recolección inteligente">
            Servicios programados y rutas optimizadas.
          </Card>
          <Card icon="bi-recycle" title="Procesamiento industrial">
            Tratamiento y valorización de residuos complejos.
          </Card>
          <Card icon="bi-lightbulb" title="Consultoría y educación">
            Capacitaciones y proyectos de economía circular.
          </Card>
        </div>
      </div>
    </section>
  );
}
