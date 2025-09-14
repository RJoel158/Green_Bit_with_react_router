import React, { useState } from "react";
import "./Register.css";
import inicioImage from "./assets/inicio.png";
import logo from "./assets/logo.png";
import { Validator } from "./common/Validator";

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
      const res = await fetch("http://localhost:3000/api/users/login", {
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
      setMensaje("✅ Bienvenido, " + data.user.username);
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
      window.location.href = "/recicladorIndex";
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

  return (
    <div className="register-page d-flex align-items-stretch">
      {/* Lado izquierdo */}
      <div className="register-left d-flex flex-column justify-content-center p-4">
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
                  className={`form-control form-control-lg ${
                    errors[field as keyof FormData] ? "is-invalid" : ""
                  }`}
                  placeholder={field === "email" ? "Correo electrónico" : "Contraseña"}
                />
                {errors[field as keyof FormData] && (
                  <div className="invalid-feedback">{errors[field as keyof FormData]}</div>
                )}
              </div>
            ))}

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

        <div className="cta-banner text-center mt-3">
          <span>¿Aún no tienes una cuenta? </span>
          <a href="/register" className="fw-semibold">
            Regístrate ya!
          </a>
        </div>
      </div>

      {/* Lado derecho */}
      <div
        className="register-right d-none d-lg-block flex-grow-1"
        style={{ backgroundImage: `url(${inicioImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
    </div>
  );
};

export default Login;
