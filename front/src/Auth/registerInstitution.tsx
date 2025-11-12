import React, { useState } from "react";
import "../Auth/Register.css";
import inicioImage from "../assets/inicio.png";
import logo from "../assets/logo.png";
import cardBg from "../assets/SideBarImg.png";
import { Validator } from "../common/Validator";
import SuccessModal from "../components/CommonComp/SuccesModal";
import api from "../services/api";
import { API_ENDPOINTS } from "../config/endpoints";
import CountryPhoneSelector from "../components/Auth/CountryPhoneSelector";

/**
 * Formulario de registro para instituciones.
 * Optimizado y alineado al modelo de base de datos:
 * { companyName, nit, userId, state }
 */

// Tipos para el formulario
type FormData = {
  companyName: string;
  nit: string;
  email: string;
  phone: string;
};

// Componente de input reutilizable
interface InputFieldProps {
  name: keyof FormData;
  placeholder: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  isChecking?: boolean;
}
const InputField: React.FC<InputFieldProps> = ({
  name,
  placeholder,
  type = "text",
  value,
  error,
  onChange,
  onBlur,
  isChecking = false,
}) => (
  <div className="mb-3">
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      type={type}
      className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
      placeholder={placeholder}
      autoComplete="off"
    />
    {isChecking && (
      <small className="text-muted">Verificando correo...</small>
    )}
    {error && <div className="invalid-feedback" style={{ display: 'block' }}>{error}</div>}
  </div>
);

const RegisterInstitution: React.FC = () => {
  const [form, setForm] = useState<FormData>({
    companyName: "",
    nit: "",
    email: "",
    phone: "+591 ",
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const checkEmailExists = async (email: string) => {
    if (!email || !Validator.validateEmail(email)) return;
    
    setCheckingEmail(true);
    try {
      const res = await api.get(API_ENDPOINTS.USERS.CHECK_EMAIL(email.trim().toLowerCase()));
      const data = res.data;
      
      if (data.exists) {
        setErrors((prev) => ({ ...prev, email: "Este correo electrónico ya está registrado" }));
      }
    } catch (err) {
      console.error("Error verificando email:", err);
    } finally {
      setCheckingEmail(false);
    }
  };

  const onEmailBlur = () => {
    if (form.email) {
      checkEmailExists(form.email);
    }
  };

  // Maneja cambios en los campos del formulario
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validación de campos según modelo
  const validate = (data: FormData) => ({
  companyName: Validator.validateCompanyName(data.companyName),
  nit: Validator.validateNIT(data.nit),
  email: Validator.validateEmail(data.email),
  phone: Validator.validatePhone(data.phone),
});

  // Maneja el envío del formulario
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    // Ensure all error values are strings (not undefined)
    const stringErrors = Object.fromEntries(
      Object.entries(validationErrors).map(([k, v]) => [k, v ?? ""])
    );

    if (!Validator.isValid(stringErrors)) {
      setMensaje("❌ Por favor corrige los errores en el formulario");
      return;
    }

    // Verificar si el email ya existe antes de enviar
    setLoading(true);
    try {
      const emailCheckRes = await api.get(API_ENDPOINTS.USERS.CHECK_EMAIL(form.email.trim().toLowerCase()));
      const emailCheckData = emailCheckRes.data;
      
      if (emailCheckData.exists) {
        setErrors({ ...errors, email: "Este correo electrónico ya está registrado" });
        setMensaje("❌ El correo electrónico ya está registrado");
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error verificando email:", err);
      setMensaje("❌ No se pudo verificar el correo electrónico");
      setLoading(false);
      return;
    }

    setMensaje("");

    try {
      const res = await api.post(API_ENDPOINTS.USERS.REGISTER_INSTITUTION, {
        companyName: Validator.normalizeSpaces(form.companyName),
        nit: form.nit.toUpperCase(),
        email: form.email.toLowerCase(),
        phone: form.phone,
        role_id: 2, // recolector institución
      });

      const data = res.data;
      if (data.success) {
        setMensaje("✅ Registro exitoso.");
        setForm({ companyName: "", nit: "", email: "", phone: "" });
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
      {/* Lado izquierdo: Formulario */}
      <div
        className="register-left d-flex flex-column justify-content-center p-4"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.10), rgba(0,0,0,0.15)), url(${cardBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "#fff",
        }}
      >
        <div className="auth-card shadow-lg p-4 rounded-4" id="registerPage">
          <div className="text-center mb-4">
            <h1 className="auth-title mb-2">Registro de Institución</h1>
            <img src={logo} alt="Logo GreenBit" className="register-logo" />
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <InputField
              name="companyName"
              placeholder="Razón Social"
              value={form.companyName}
              error={errors.companyName}
              onChange={onChange}
            />
            <InputField
              name="nit"
              placeholder="NIT"
              value={form.nit}
              error={errors.nit}
              onChange={onChange}
            />
            <InputField
              name="email"
              placeholder="Correo Electrónico"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={onChange}
              onBlur={onEmailBlur}
              isChecking={checkingEmail}
            />

            {/* Selector de país con teléfono */}
            <div className="mb-3">
              <CountryPhoneSelector
                phone={form.phone}
                onPhoneChange={(newPhone) =>
                  setForm((f) => ({ ...f, phone: newPhone }))
                }
                error={errors.phone}
              />
            </div>

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
              ¿Quieres formar parte del equipo de recolectores?
            </p>
          </span>
          <a
            href="/registerCollector"
            style={{ fontSize: "1.1rem", fontWeight: "600" }}
            className="fw-semibold"
          >
            Regístrate aquí!
          </a>
        </div>
      </div>

      {/* Lado derecho: Imagen */}
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
          title="¡Solicitud enviada!"
          message="Se le enviará el correo con sus credenciales una vez su cuenta haya sido aprobada."
          redirectUrl="/login"
        />
      )}
    </div>
  );
};

export default RegisterInstitution;
