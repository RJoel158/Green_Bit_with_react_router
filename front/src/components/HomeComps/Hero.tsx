import heroVideo from "../../assets/PixVerse_V5_Image_Text_360P_personas_reciclaje.mp4";

export default function Hero() {
  return (
    <section className="position-relative vh-100 w-100">
      {/* Video full screen */}
      <video
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: "cover", zIndex: -2 }}
      />

      {/* Overlay semitransparente */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.35)", zIndex: -1 }}
      />

      {/* Contenido centrado */}
      <div className="position-absolute top-50 start-50 translate-middle w-100 px-3" style={{ maxWidth: 920 }}>
        <div className="bg-success bg-opacity-75 text-white rounded-4 shadow-lg p-4 text-center">
          <h2 className="landing-title h3 mb-2">Reciclar es Renovar Esperanzas</h2>
          <p className="mb-3">
            Cada material reciclado es una nueva oportunidad para nuestro planeta
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <a
              href="#servicios"
              className="btn btn-light rounded-pill px-4 fw-semibold text-success"
            >
              Conoce nuestros servicios
            </a>
            <a
              href="/register"
              className="btn btn-outline-light rounded-pill px-4 fw-semibold"
            >
              Inicia Sesión
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
