export class Validator {
  // Valida nombres personales (solo letras y espacios)
  static validatenames(name: string): string {
    if (!name.trim()) return "El nombre es requerido";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return "Solo letras y espacios permitidos";
    return "";
  }

  // Valida nombre de usuario (solo requerido)
  static validateUsername(username: string): string {
    if (!username.trim()) return "El nombre de usuario es requerido";
    return "";
  }

  // Valida nombre de empresa/institución (mínimo 2 caracteres)
  static validateCompanyName(name: string): string {
    if (!name.trim()) return "El nombre de la empresa es requerido";
    if (name.length < 2) return "El nombre es muy corto";
    return "";
  }

  // Valida NIT (alfanumérico básico, requerido)
  static validateNIT(nit: string): string {
    if (!nit.trim()) return "El NIT es obligatorio";
    if (!/^[0-9A-Za-z\-]{5,20}$/.test(nit)) return "NIT inválido";
    return "";
  }

  // Valida correo electrónico (formato general)
  static validateEmail(email: string): string {
    if (!email.trim()) return "El correo es requerido";
    if (!/\S+@\S+\.\S+/.test(email)) return "Formato de correo inválido";
    return "";
  }

  // Valida teléfono (solo requerido y mínimo 7 dígitos, sin formato específico)
  static validatePhone(phone: string): string {
    if (!phone.trim()) return "El teléfono es requerido";
    if (!/^[0-9+\-\s]{7,20}$/.test(phone)) return "Teléfono inválido";
    return "";
  }

  // Valida contraseña (mínimo 8 caracteres, una mayúscula y un número)
  static validatePassword(password: string): string {
    if (!password.trim()) return "La contraseña es requerida";
    if (password.length < 8) return "Debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe tener al menos una mayúscula";
    if (!/[0-9]/.test(password)) return "Debe tener al menos un número";
    return "";
  }

  // Utilidad para saber si el objeto de errores está vacío
  static isValid(errors: Record<string, string>): boolean {
    return Object.values(errors).every((e) => e === "");
  }
}
