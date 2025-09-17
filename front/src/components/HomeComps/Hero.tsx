import heroVideo from "../../assets/PixVerse_V5_Image_Text_360P_personas_reciclaje.mp4";

export default function Hero() {
  return (
    <section className="position-relative vh-100 overflow-hidden">
      {/* Video background - Fixed positioning */}
      <video
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ 
          objectFit: "cover", 
          zIndex: -2,
          filter: "brightness(0.6) contrast(1.2)"
        }}
      />

      {/* Enhanced overlay */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: "linear-gradient(135deg, rgba(45, 80, 22, 0.4) 0%, rgba(74, 124, 89, 0.3) 50%, rgba(127, 176, 105, 0.2) 100%)",
          zIndex: -1
        }}
      />

      {/* Content container */}
      <div className="d-flex align-items-center justify-content-center h-100 position-relative" style={{ zIndex: 1 }}>
        <div className="container px-3">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-8">
              <div className="hero-content">
                <div 
                  className="text-white rounded-4 shadow-lg p-4 p-md-5 text-center"
                  style={{
                    background: "rgba(74, 124, 89, 0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <h1 className="display-4 fw-bold mb-3" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                    Reciclar es Renovar Esperanzas
                  </h1>
                  <p className="lead mb-4 opacity-90">
                    Cada material reciclado es una nueva oportunidad para nuestro planeta.
                    Únete a la revolución verde y transforma el futuro.
                  </p>
                  <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                    <a
                      href="#servicios"
                      className="btn btn-light btn-lg rounded-pill px-4 fw-semibold text-success"
                      style={{
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      Conoce nuestros servicios
                    </a>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className="position-absolute bottom-0 start-50 translate-middle-x mb-4"
        style={{ zIndex: 2 }}
      >
        <div className="text-center">
          <div 
            className="text-white opacity-75"
            style={{ 
              animation: "float 2s ease-in-out infinite",
              fontSize: "1.5rem"
            }}
          >
            <i className="bi bi-chevron-down"></i>
          </div>
        </div>
      </div>
    </section>
  );
}