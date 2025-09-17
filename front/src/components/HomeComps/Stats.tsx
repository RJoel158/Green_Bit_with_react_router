const Stat = ({ num, label }: { num: string; label: string }) => (
  <div className="col-6 col-md-3">
    <div className="stat-item loading-animation">
      <div className="stat-number">{num}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function Stats() {
  return (
    <section className="py-5 stats-section">
      <div className="container">
        <div className="stat-container">
          <h3 className="text-white text-center landing-title mb-5">
            Nuestro Impacto en Números
          </h3>
          <div className="row g-4">
            <Stat num="15,000+" label="Toneladas Recicladas" />
            <Stat num="200+" label="Empresas Aliadas" />
            <Stat num="50,000+" label="Personas Capacitadas" />
            <Stat num="12" label="Años de experiencia" />
          </div>
        </div>
      </div>
    </section>
  );
}