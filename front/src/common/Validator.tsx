export class Validator {
  // Normaliza espacios: elimina espacios al inicio y fin, convierte múltiples espacios en uno solo
  static normalizeSpaces(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  // Capitaliza la primera letra de cada palabra
  static capitalizeWords(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Valida nombres personales (solo letras y espacios) y capitaliza cada palabra
  static validatenames(name: string): string {
    const normalized = this.normalizeSpaces(name);
    if (!normalized) return "El nombre es requerido";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(normalized)) return "Solo letras y espacios permitidos";
    return "";
  }

  // Normaliza nombres: trim, espacios múltiples y capitaliza
  static normalizeName(name: string): string {
    const normalized = this.normalizeSpaces(name);
    return this.capitalizeWords(normalized);
  }

  // Valida nombre de usuario (solo requerido)
  static validateUsername(username: string): string {
    if (!username.trim()) return "El nombre de usuario es requerido";
    return "";
  }

  // Valida nombre de empresa/institucións
  static validateCompanyName(name: string): string {
    const normalized = this.normalizeSpaces(name);
    if (!normalized) return "El nombre de la empresa es requerido";
    return "";
  }

  // Valida NIT (alfanumérico básico, requerido)
  static validateNIT(nit: string): string {
    const normalized = nit.trim(); // NIT no debería tener espacios internos
    if (!normalized) return "El NIT es obligatorio";
    if (!/^[0-9A-Za-z\-]{5,20}$/.test(normalized)) return "NIT inválido";
    return "";
  }

  // Valida correo electrónico (formato general)
  static validateEmail(email: string): string {
    const normalized = email.trim().toLowerCase(); // Email sin espacios y en minúsculas
    if (!normalized) return "El correo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return "Formato de correo inválido";
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
    // La contraseña NO se trimea ni normaliza, se valida tal cual
    if (!password) return "La contraseña es requerida";
    if (/\s/.test(password)) return "La contraseña no puede contener espacios";
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
