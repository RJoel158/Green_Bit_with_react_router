import React, { useState } from "react";
import "../Auth/Register.css";
import inicioImage from "../assets/inicio.png";
import logo from "../assets/logo.png";
import cardBg from "../assets/SideBarImg.png";
import { Validator } from "../common/Validator";
import SuccessModal from "../components/CommonComp/SuccesModal";

type FormData = {
  nombres: string;
  apellidos: string;
  email: string;
  phone: string;
};

const Register: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    nombres: "",
    apellidos: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones frontend
    const nombresError = Validator.validatenames?.(form.nombres);
    const apellidosError = Validator.validatenames?.(form.apellidos);
    const emailError = Validator.validateEmail(form.email);
    const phoneError = Validator.validatePhone(form.phone);

    const validationErrors = {
      nombres: nombresError,
      apellidos: apellidosError,
      email: emailError,
      phone: phoneError,
    };
    setErrors(validationErrors);

    if (!Validator.isValid(validationErrors)) {
      setMensaje("❌ Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      // POST a /api/users/collector
      const res = await fetch("http://localhost:3000/api/users/collector", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: Validator.normalizeName(form.nombres),
          apellidos: Validator.normalizeName(form.apellidos),
          email: form.email.toLowerCase(),
          phone: form.phone,
          role_id: 2, // recolector
          // state: 1, // pendiente (opcional)
        }),
      });

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Registro exitoso.");
        setForm({ nombres: "", apellidos: "", email: "", phone: "" });
        setShowSuccessModal(true);
        setErrors({});
      } else {
        setMensaje("❌ " + (data.error || "Error desconocido"));
      }
    } catch (err) {
      console.error(err);
      setMensaje("❌ No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page d-flex align-items-stretch">
      {/* Lado izquierdo */}
      <div
        className="register-left d-flex flex-column justify-content-center p-4"
        /* La imagen de fondo la manejamos por CSS con la variable cardBg (claro que aquí la dejamos inline para que funcione con webpack/CRA) */
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.10), rgba(0,0,0,0.15)), url(${cardBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "#fff",
        }}
      >
        <div className="auth-card shadow-lg p-4 rounded-4" id="registerPage">
          <div className="text-center mb-2">
            <h1 className="auth-title mb-0">Registra tu cuenta de recolector</h1>
            <img src={logo} alt="Logo EcoVerde" className="register-logo" />
            <div className="cta-banner text-center mt-0">
                <span>
                  <p style={{ fontSize: "1rem", fontWeight: "600" }}>
                    ¿Eres una institución?
                  </p>
                </span>
                <a href="/registerInstitution" style={{ fontSize: "1.1rem", fontWeight: "600" }} className="fw-semibold">
                  Regístrate aquí!
                </a>
            </div>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {[
              { name: "nombres", placeholder: "Nombres", type: "text" },
              { name: "apellidos", placeholder: "Apellidos", type: "text" },
              { name: "email", placeholder: "Correo electrónico", type: "email" },
              {
                name: "phone",
                placeholder: "Número celular (+591XXXXXXXXXX)",
                type: "text",
              },
            ].map((field) => (
              <div className="mb-3" key={field.name}>
                <input
                  name={field.name}
                  value={form[field.name as keyof FormData]}
                  onChange={onChange}
                  type={field.type}
                  className={`form-control form-control-lg ${
                    errors[field.name as keyof FormData] ? "is-invalid" : ""
                  }`}
                  placeholder={field.placeholder}
                />
                {errors[field.name as keyof FormData] && (
                  <div className="invalid-feedback">
                    {errors[field.name as keyof FormData]}
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-success btn-lg w-100"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </form>

          {mensaje && (
            <div
              className={`alert mt-3 ${
                mensaje.includes("✅") ? "alert-success" : "alert-danger"
              }`}
              role="alert"
            >
              {mensaje}
            </div>
          )}
          
          <div className="text-center mt-3 mb-3">
            <p style={{ fontSize: "0.95rem", color: "#666", marginBottom: "8px" }}>
              ¿Ya tienes una cuenta?
            </p>
            <a
              href="/login"
              className="btn btn-outline-success w-100"
              style={{
                borderWidth: "2px",
                borderRadius: "12px",
                padding: "0.7rem",
                fontWeight: "600",
                fontSize: "0.95rem"
              }}
            >
              Iniciar Sesión
            </a>
          </div>
        </div>

        <div className="cta-banner text-center mt-3">
          <span>
            <p style={{ fontSize: "1rem", fontWeight: "600" }}>
              ¿Quieres formar parte del equipo de recicladores?
            </p>
          </span>
          <a href="/register" style={{ fontSize: "1.1rem", fontWeight: "600" }} className="fw-semibold">
            Regístrate aquí!
          </a>
        </div>
      </div>

      {/* Lado derecho */}
      <div
        className="register-right d-none d-lg-block flex-grow-1"
        style={{
          backgroundImage: `url(${inicioImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {showSuccessModal && (
        <SuccessModal
          title="¡Solicitud de cuenta enviada!"
          message="Tu solicitud para ser recolector ha sido enviada exitosamente. Nos pondremos en contacto contigo pronto."
          redirectUrl="/login"
        />
      )}
    </div>
  );
};

export default Register;
