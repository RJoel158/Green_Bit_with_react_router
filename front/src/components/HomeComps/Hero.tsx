import heroImg from "../../assets/logo.png"; // asegúrate de la ruta

export default function Hero(){
  return (
    <section className="position-relative">
      <div style={{height:420, overflow:"hidden"}}>
        <img src={heroImg} alt="hero" className="w-100 h-100" style={{objectFit:"cover"}} />
      </div>

      <div className="position-absolute top-50 start-50 translate-middle" style={{width:"90%", maxWidth:920}}>
        <div className="bg-success bg-opacity-85 text-white rounded-4 shadow-lg p-4 text-center">
          <h2 className="landing-title h3 mb-2">Reciclar es Renovar Esperanzas</h2>
          <p className="mb-3">Cada material reciclado es una nueva oportunidad para nuestro planeta</p>
          <div className="d-flex justify-content-center gap-3">
            <a href="#servicios" className="brand-btn text-decoration-none">Conoce nuestros servicios</a>
            <a href="/register" className="btn btn-outline-light rounded-pill">Inicia Sesión</a>
          </div>
        </div>
      </div>
    </section>
  );
}
