import React, { useMemo } from "react";

interface Country {
  code: string;
  name: string;
  flagUrl: string;
  dialCode: string;
}

interface Props {
  phone: string;
  onPhoneChange: (phone: string) => void;
  error?: string;
}

const COUNTRIES: Country[] = [
  { code: "BO", name: "Bolivia", flagUrl: "https://flagcdn.com/w40/bo.png", dialCode: "+591" },
  { code: "PE", name: "Perú", flagUrl: "https://flagcdn.com/w40/pe.png", dialCode: "+51" },
  { code: "CL", name: "Chile", flagUrl: "https://flagcdn.com/w40/cl.png", dialCode: "+56" },
];

const CountryPhoneSelector: React.FC<Props> = ({ phone, onPhoneChange, error }) => {
  const selectedCountry = useMemo(() => {
    const code = phone.split(" ")[0];
    return COUNTRIES.find((c) => c.dialCode === code) || COUNTRIES[0];
  }, [phone]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dialCode = e.target.value;
    const digits = phone.replace(/[\D]/g, "").replace(/^(591|51|56)/, "");
    onPhoneChange(`${dialCode} ${digits}`);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, "");
    if (value) {
      onPhoneChange(`${selectedCountry.dialCode} ${value}`);
    } else {
      onPhoneChange(""); // Solo el espacio vacío, sin código
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", border: "1px solid #dee2e6", borderRadius: "4px", backgroundColor: "#f8f9fa" }}>
          <img 
            src={selectedCountry.flagUrl} 
            alt={selectedCountry.code}
            style={{ width: "30px", height: "20px", objectFit: "cover" }}
          />
            <select
              value={selectedCountry.dialCode}
              onChange={handleCountryChange}
              className={`form-control form-control-lg`}
              aria-label="Seleccionar país (prefijo)"
              style={{ width: "120px", padding: "4px 8px", fontSize: "0.95rem" }}
            >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.dialCode}>
                {c.name} {c.dialCode}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={phone ? phone.replace(selectedCountry.dialCode + " ", "").trim() : ""}
          onChange={handlePhoneChange}
          placeholder="71234567"
          className={`form-control form-control-lg ${error ? "is-invalid" : ""}`}
          aria-label="Número de teléfono"
          maxLength={15}
        />
      </div>

      {error && (
        <div className="invalid-feedback" style={{ display: "block" }}>
          {error}
        </div>
      )}

      <small style={{ color: "#999" }}>
        Teléfono: <strong>{phone || `${selectedCountry.dialCode} ...`}</strong>
      </small>
    </div>
  );
};

export default CountryPhoneSelector;
