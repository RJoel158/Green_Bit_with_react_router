import React, { useState } from "react";
import "./Register.css";
import inicioImage from "./assets/inicio.png";
import logo from "./assets/logo.png";

type FormData = {
  username: string;
  email: string;
  phone: string;
};

const Register: React.FC = () => {
  const [form, setForm] = useState<FormData>({ username: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.username.trim()) newErrors.username = "El nombre de usuario es requerido";
    if (!form.email.trim()) newErrors.email = "El correo es requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Formato de correo inválido";
    if (!form.phone.trim()) newErrors.phone = "El número celular es requerido";
    else if (!/^\+?591[67]\d{7}$/.test(form.phone.replace(/\s/g, "")))
      newErrors.phone = "Formato: +59177777777 o +59167777777";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setMensaje("❌ Por favor corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setMensaje("");

    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role_id: 4 }),
      });

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setMensaje("✅ Registro exitoso. Revisa tu correo para tu contraseña temporal.");
        setForm({ username: "", email: "", phone: "" });
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
      <div className="register-left d-flex flex-column justify-content-center p-4">
        <div className="auth-card shadow-lg p-4 rounded-4 bg-light">
          <div className="text-center mb-4">
            <h1 className="auth-title mb-2">Registra tu cuenta de reciclaje</h1>
            <img src={logo} alt="Logo EcoVerde" className="register-logo" />
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {["username", "email", "phone"].map((field) => (
              <div className="mb-3" key={field}>
                <input
                  name={field}
                  value={form[field as keyof FormData]}
                  onChange={onChange}
                  type={field === "email" ? "email" : "text"}
                  className={`form-control form-control-lg ${errors[field as keyof FormData] ? "is-invalid" : ""}`}
                  placeholder={field === "phone" ? "Número celular (+591XXXXXXXXXX)" : field.charAt(0).toUpperCase() + field.slice(1)}
                />
                {errors[field as keyof FormData] && <div className="invalid-feedback">{errors[field as keyof FormData]}</div>}
              </div>
            ))}

            <button type="submit" className="btn btn-success btn-lg w-100" disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </form>

          {mensaje && (
            <div className={`alert mt-3 ${mensaje.includes("✅") ? "alert-success" : "alert-danger"}`} role="alert">
              {mensaje}
            </div>
          )}
        </div>

        <div className="cta-banner text-center mt-3">
          <span>¿Quieres formar parte del equipo de recolectores? </span>
          <a href="/registerCollector" className="fw-semibold">Regístrate aquí!</a>
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

export default Register;
