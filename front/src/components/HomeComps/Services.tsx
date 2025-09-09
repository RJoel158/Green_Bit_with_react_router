
const Card = ({title, children}:{title:string, children:any}) => (
  <div className="col-md-4">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted">{children}</p>
      </div>
    </div>
  </div>
);

export default function Services(){
  return (
    <section id="servicios" className="py-5">
      <div className="container">
        <h3 className="text-center mb-4 landing-title">Soluciones integrales para un futuro sostenible</h3>
        <div className="row g-4">
          <Card title="Recolección inteligente">Servicios programados y rutas optimizadas.</Card>
          <Card title="Procesamiento industrial">Tratamiento y valorización de residuos complejos.</Card>
          <Card title="Consultoría y educación">Capacitaciones y proyectos de economía circular.</Card>
        </div>
      </div>
    </section>
  );
}
