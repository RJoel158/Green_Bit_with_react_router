import React, { useState } from "react";
import "./Register.css";
import inicioImage from "../assets/inicio.png";
import cardBg from "../assets/SideBarImg.png";
import logo from "../assets/logo.png";
import { Validator } from "../common/Validator";
import ForgotPasswordModal from "../components/PasswordComp/ForgotPasswordModal";

//Estructura del formulario del login
type FormData = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  //Estado del formulario
  const [form, setForm] = useState<FormData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  //Mensaje de error o éxito
  const [mensaje, setMensaje] = useState("");
  //Errores de validación
  const [errors, setErrors] = useState<Partial<FormData>>({});
  //Estado del modal de recuperacion
  const [showForgotModal, setShowForgotModal] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones frontend
    const emailError = Validator.validateEmail(form.email);
    const passwordError = form.password.trim() === "" ? "La contraseña no puede estar vacía" : "";

    const validationErrors = { email: emailError, password: passwordError };
    setErrors(validationErrors);

    if (!Validator.isValid(validationErrors)) {
      setMensaje("❌ Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error de login:", data.error);
        setMensaje("❌ " + (data.error || "Email o contraseña incorrectos"));
        setForm((f) => ({ ...f, password: "" })); // resetea la contraseña
        return;
      }

      // Login exitoso
      setMensaje("✅ Bienvenido, " + data.user.email);
      //Guardado de sesión
      localStorage.setItem("user", JSON.stringify(data.user));
      //Limpieza del formulario y erores
      setForm({ email: "", password: "" });
      setErrors({});
      //Redirección segun el rol
      switch (data.user.role) {
        case "admin":
          window.location.href = "/adminDashboard";
          break;
        case "recolector":
          window.location.href = "/recolectorIndex";
          break;
        case "reciclador":
          window.location.href = "/recicladorIndex";
          break;
        default:
          window.location.href = "/main";
      }

    } catch (err) {
      console.error("Error de conexión:", err);
      setMensaje("❌ No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };
   const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
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
        <div className="auth-card shadow-lg p-4 rounded-4 bg-light">
          <div className="text-center mb-4">
            <h1 className="auth-title mb-2">Bienvenidos a GreenBit</h1>
            <img src={logo} alt="Logo EcoVerde" className="register-logo" />
            <h1 className="auth-title mb-2">¡Es un gran placer para nosotros tenerte a bordo!</h1>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {["email", "password"].map((field) => (
              <div className="mb-3" key={field}>
                <input
                  name={field}
                  value={form[field as keyof FormData]}
                  onChange={onChange}
                  type={field === "email" ? "email" : "password"}
                  className={`form-control form-control-lg ${errors[field as keyof FormData] ? "is-invalid" : ""
                    }`}
                  placeholder={field === "email" ? "Correo electrónico" : "Contraseña"}
                />
                {errors[field as keyof FormData] && (
                  <div className="invalid-feedback">{errors[field as keyof FormData]}</div>
                )}
              </div>
            ))}
            {/* Recuperación de contraseña */}
            <div className="forgot-password text-end mb-3">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="btn btn-link p-0 text-decoration-none forgot-link"
              >
                ¿Olvidaste tu contraseña? <span>Recupérala aquí</span>
              </button>
            </div>
            <button type="submit" className="btn btn-success btn-lg w-100" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {mensaje && (
            <div
              className={`alert mt-3 ${mensaje.includes("✅") ? "alert-success" : "alert-danger"}`}
              role="alert"
            >
              {mensaje}
            </div>
          )}
        </div>

        <div className="cta-banner text-center mb-5">
          <span>
            <p style={{ fontSize: "1rem", fontWeight: "600" }}>
              ¿Aún no tienes cuenta?
            </p>
          </span>
          <a
            href="/register"
            style={{ fontSize: "1.1rem", fontWeight: "600" }}
            className="fw-semibold"
          >
            Regístrate aquí!
          </a>
        </div>
      </div>

      {/* Lado derecho */}
      <div
        className="register-right d-none d-lg-block flex-grow-1"
        style={{ backgroundImage: `url(${inicioImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
       {/* Modal de recuperación de contraseña */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={form.email}/>
    </div>
  );
};

export default Login;
