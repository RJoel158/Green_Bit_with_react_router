import React from "react";
import "./Home.css"; // tus estilos personalizados
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link } from "react-router-dom";


const App: React.FC = () => {
  return (
    <>
      {/* HEADER */}
      <header>
        <h1>🌿 EcoVerde Ya tu Sabe'</h1>
        <p className="subtitle">
          Transformando el futuro a través del reciclaje responsable
        </p>
        <div className="auth-buttons">
          <a href="/registerCollector">Iniciar Sesión</a>
          <Link to="/register">Regístrate</Link>
        </div>
        <nav>
          <a href="#quienes">Quiénes Somos</a>
          <a href="#mision">Misión & Visión</a>
          <a href="#servicios">Servicios</a>
          <a href="#beneficios">Beneficios</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#comunidad">Comunidad</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      {/* === SECCIÓN QUIÉNES SOMOS === */}
      <section id="quienes" className="fade-in-up">
        <h2>🌍 Quiénes Somos</h2>
        <div className="card">
          <p>
            <strong>EcoVerde Solutions</strong> es una empresa líder en gestión
            integral de residuos y desarrollo de la economía circular en América
            Latina. Fundada en 2013 con la visión de transformar la industria del
            reciclaje, nos hemos consolidado como pioneros en soluciones
            innovadoras y sostenibles.
          </p>
          <p>
            Nuestro compromiso trasciende el simple procesamiento de residuos.
            Trabajamos incansablemente para crear un ecosistema donde cada material
            desechado encuentre una segunda vida, contribuyendo así a la reducción
            del impacto ambiental y promoviendo un estilo de vida verdaderamente
            sostenible.
          </p>
          <p>
            Con más de una década de experiencia, hemos desarrollado tecnologías
            propias y metodologías avanzadas que nos permiten ofrecer servicios de
            calidad mundial, siempre manteniendo nuestro compromiso con la
            responsabilidad social y el cuidado del medio ambiente.
          </p>
        </div>
      </section>

      {/* === SECCIÓN MISIÓN Y VISIÓN === */}
      <section id="mision" className="fade-in-up">
        <h2>🎯 Misión y Visión</h2>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <h4 style={{ color: "var(--verde-medio)", marginBottom: "20px" }}>
                <i className="fas fa-bullseye"></i> Nuestra Misión
              </h4>
              <p>
                Inspirar y facilitar la transición hacia una economía circular
                mediante la implementación de soluciones integrales de reciclaje,
                que incluyen recolección especializada, procesamiento
                tecnológicamente avanzado y transformación de residuos en nuevos
                recursos de alto valor.
              </p>
              <p>
                Educamos, innovamos y colaboramos con comunidades, empresas e
                instituciones para construir un futuro donde el desperdicio sea
                mínimo y la reutilización sea máxima.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <h4 style={{ color: "var(--verde-medio)", marginBottom: "20px" }}>
                <i className="fas fa-eye"></i> Nuestra Visión
              </h4>
              <p>
                Ser reconocidos como la empresa más innovadora y confiable en
                gestión de residuos de América Latina para el año 2030, liderando
                la transformación hacia ciudades inteligentes y sostenibles.
              </p>
              <p>
                Aspiramos a ser el catalizador del cambio que inspire a millones de
                personas y organizaciones a adoptar prácticas de economía circular,
                creando un impacto positivo medible en el medio ambiente y la
                sociedad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === SECCIÓN SERVICIOS === */}
      <section id="servicios" className="fade-in-up">
        <h2>♻️ Nuestros Servicios Especializados</h2>
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <h4 style={{ color: "var(--verde-medio)" }}>
                <i className="fas fa-truck"></i> Recolección Inteligente
              </h4>
              <ul>
                <li>
                  <strong>Recolección programada:</strong> Servicios regulares
                  adaptados a las necesidades específicas de cada cliente
                </li>
                <li>
                  <strong>Recolección selectiva:</strong> Separación especializada
                  por tipos de materiales
                </li>
                <li>
                  <strong>Logística optimizada:</strong> Rutas eficientes que
                  reducen la huella de carbono
                </li>
                <li>
                  <strong>Seguimiento digital:</strong> Trazabilidad completa del
                  proceso mediante tecnología IoT
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <h4 style={{ color: "var(--verde-medio)" }}>
                <i className="fas fa-industry"></i> Procesamiento Industrial
              </h4>
              <ul>
                <li>
                  <strong>Clasificación automatizada:</strong> Tecnología de punta
                  para separación precisa
                </li>
                <li>
                  <strong>Tratamiento especializado:</strong> Procesos específicos
                  para cada tipo de material
                </li>
                <li>
                  <strong>Control de calidad:</strong> Certificaciones
                  internacionales en todos nuestros procesos
                </li>
                <li>
                  <strong>Transformación innovadora:</strong> Conversión de residuos
                  en productos de alto valor agregado
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card">
              <h4 style={{ color: "var(--verde-medio)" }}>
                <i className="fas fa-laptop"></i> Gestión de Residuos Electrónicos
              </h4>
              <ul>
                <li>
                  <strong>Recolección especializada:</strong> Manejo seguro de
                  equipos electrónicos
                </li>
                <li>
                  <strong>Destrucción de datos:</strong> Protocolos certificados de
                  seguridad informática
                </li>
                <li>
                  <strong>Recuperación de materiales:</strong> Extracción de metales
                  preciosos y componentes reutilizables
                </li>
                <li>
                  <strong>Certificados de destrucción:</strong> Documentación
                  completa del proceso
                </li>
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <h4 style={{ color: "var(--verde-medio)" }}>
                <i className="fas fa-chalkboard-teacher"></i> Consultoría y Educación
              </h4>
              <ul>
                <li>
                  <strong>Diagnósticos ambientales:</strong> Evaluación integral de
                  impacto y oportunidades
                </li>
                <li>
                  <strong>Planes de sostenibilidad:</strong> Estrategias
                  personalizadas para cada organización
                </li>
                <li>
                  <strong>Capacitación especializada:</strong> Programas formativos
                  para colaboradores y comunidades
                </li>
                <li>
                  <strong>Auditorías de cumplimiento:</strong> Verificación de
                  normativas ambientales
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* === SECCIÓN BENEFICIOS === */}
      <section id="beneficios" className="text-center">
        <h2>✅ Beneficios Transformadores del Reciclaje</h2>
        <div className="row mt-5">
          <div className="col-md-4">
            <i className="fas fa-leaf fa-4x mb-4"></i>
            <h5>Protección del Ecosistema</h5>
            <p>
              El reciclaje reduce significativamente la contaminación del aire,
              agua y suelo, preservando la biodiversidad y los hábitats naturales
              para las futuras generaciones.
            </p>
          </div>
          <div className="col-md-4">
            <i className="fas fa-recycle fa-4x mb-4"></i>
            <h5>Reducción de Residuos</h5>
            <p>
              Disminuimos drásticamente la cantidad de desechos que llegan a
              vertederos y océanos, creando un ciclo de vida más largo para los
              materiales.
            </p>
          </div>
          <div className="col-md-4">
            <i className="fas fa-bolt fa-4x mb-4"></i>
            <h5>Eficiencia Energética</h5>
            <p>
              La producción con materiales reciclados consume hasta 95% menos
              energía que crear productos desde cero, reduciendo las emisiones de
              gases de efecto invernadero.
            </p>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-md-4">
            <i className="fas fa-briefcase fa-4x mb-4"></i>
            <h5>Generación de Empleo Verde</h5>
            <p>
              Creamos oportunidades laborales sostenibles en sectores emergentes,
              contribuyendo al desarrollo económico local y regional.
            </p>
          </div>
          <div className="col-md-4">
            <i className="fas fa-piggy-bank fa-4x mb-4"></i>
            <h5>Ahorro Económico</h5>
            <p>
              Las empresas y comunidades que implementan programas de reciclaje
              experimentan reducciones significativas en costos de gestión de
              residuos.
            </p>
          </div>
          <div className="col-md-4">
            <i className="fas fa-globe-americas fa-4x mb-4"></i>
            <h5>Impacto Global</h5>
            <p>
              Contribuimos a los Objetivos de Desarrollo Sostenible de la ONU,
              siendo parte activa del cambio hacia un mundo más equitativo y
              sustentable.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default App;
