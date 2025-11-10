// shared/Validator.js
/**
 * Clase de validaciones para backend
 * Espeja las validaciones del frontend (front/src/common/Validator.tsx)
 */

export class Validator {
  /**
   * Normaliza espacios: elimina espacios al inicio y fin,
   * convierte múltiples espacios en uno solo
   */
  static normalizeSpaces(text) {
    if (typeof text !== 'string') return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  /**
   * Capitaliza la primera letra de cada palabra
   */
  static capitalizeWords(text) {
    if (typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Valida nombres personales (solo letras y espacios) y capitaliza cada palabra
   * @param {string} name - Nombre a validar
   * @returns {string} - Mensaje de error o string vacío si es válido
   */
  static validatenames(name) {
    const normalized = this.normalizeSpaces(name);
    if (!normalized) return "El nombre es requerido";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(normalized)) return "Solo letras y espacios permitidos";
    return "";
  }

  /**
   * Normaliza nombres: trim, espacios múltiples y capitaliza
   * @param {string} name - Nombre a normalizar
   * @returns {string} - Nombre normalizado
   */
  static normalizeName(name) {
    const normalized = this.normalizeSpaces(name);
    return this.capitalizeWords(normalized);
  }

  /**
   * Valida nombre de usuario (solo requerido)
   * @param {string} username - Nombre de usuario a validar
   * @returns {string} - Mensaje de error o string vacío
   */
  static validateUsername(username) {
    if (!username.trim()) return "El nombre de usuario es requerido";
    return "";
  }

  /**
   * Valida nombre de empresa/institución
   * @param {string} name - Nombre de empresa a validar
   * @returns {string} - Mensaje de error o string vacío
   */
  static validateCompanyName(name) {
    const normalized = this.normalizeSpaces(name);
    if (!normalized) return "El nombre de la empresa es requerido";
    return "";
  }

  /**
   * Valida NIT (alfanumérico básico, requerido)
   * @param {string} nit - NIT a validar
   * @returns {string} - Mensaje de error o string vacío
   */
  static validateNIT(nit) {
    const normalized = nit.trim();
    if (!normalized) return "El NIT es obligatorio";
    if (!/^[0-9\-]{5,20}$/.test(normalized)) return "NIT inválido";
    return "";
  }

  /**
   * Valida correo electrónico (formato general)
   * @param {string} email - Email a validar
   * @returns {string} - Mensaje de error o string vacío
   */
  static validateEmail(email) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return "El correo es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return "Formato de correo inválido";
    return "";
  }

  /**
   * Valida teléfono para Bolivia, Perú o Chile
   * Detecta automáticamente el país del número
   * @param {string} phone - Teléfono a validar
   * @returns {string} - Mensaje de error o string vacío si es válido
   */
  static validatePhone(phone) {
    if (!phone.trim()) return "El teléfono es requerido";
    
    // Normalizar quitando espacios, guiones, paréntesis
    const normalized = phone.replace(/[\s\-().]/g, '');
    
    // Validar formato general: 8-15 dígitos con posible +
    if (!/^(\+)?[0-9]{8,15}$/.test(normalized)) {
      return "Teléfono inválido";
    }

    // Validar que sea de Bolivia (+591, 591, 91), Perú (+51, 51) o Chile (+56, 56)
    const isBolivia = /^(\+591|591|91)[0-9]{7,8}$/.test(normalized);
    const isPeru = /^(\+51|51)[0-9]{8,9}$/.test(normalized);
    const isChile = /^(\+56|56)[0-9]{7,8}$/.test(normalized);

    if (!isBolivia && !isPeru && !isChile) {
      return "Teléfono debe ser de Bolivia (+591), Perú (+51) o Chile (+56)";
    }

    return "";
  }

  /**
   * Valida contraseña (mínimo 8 caracteres, una mayúscula, un número y carácter especial)
   * @param {string} password - Contraseña a validar
   * @returns {string} - Mensaje de error o string vacío
   */
  static validatePassword(password) {
    if (!password) return "La contraseña es requerida";
    if (/\s/.test(password)) return "La contraseña no puede contener espacios";
    if (password.length < 8) return "Debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe tener al menos una mayúscula";
    if (!/[0-9]/.test(password)) return "Debe tener al menos un número";
    if (!/[!@#$%&*()_\-+=\[\]{};:'",.<>?/\\|`~]/.test(password)) return "Debe tener al menos un carácter especial";
    return "";
  }

  /**
   * Utilidad para saber si el objeto de errores está vacío
   * @param {Object} errors - Objeto de errores
   * @returns {boolean} - true si no hay errores, false si hay
   */
  static isValid(errors) {
    if (typeof errors !== 'object' || errors === null) return false;
    return Object.values(errors).every((e) => e === "" || e === undefined);
  }

  /**
   * Valida un usuario (persona)
   * @param {Object} user - Objeto con propiedades del usuario
   * @returns {Object} - Objeto con errores por campo
   */
  static validateUserPerson(user) {
    return {
      nombres: this.validatenames(user.nombres || ""),
      apellidos: this.validatenames(user.apellidos || ""),
      email: this.validateEmail(user.email || ""),
      phone: this.validatePhone(user.phone || ""),
    };
  }

  /**
   * Valida un usuario de institución
   * @param {Object} institution - Objeto con propiedades de institución
   * @returns {Object} - Objeto con errores por campo
   */
  static validateUserInstitution(institution) {
    return {
      companyName: this.validateCompanyName(institution.companyName || ""),
      nit: this.validateNIT(institution.nit || ""),
      email: this.validateEmail(institution.email || ""),
      phone: this.validatePhone(institution.phone || ""),
    };
  }

  /**
   * Valida credenciales de login
   * @param {Object} credentials - Objeto con email y password
   * @returns {Object} - Objeto con errores
   */
  static validateLoginCredentials(credentials) {
    return {
      email: this.validateEmail(credentials.email || ""),
      password: credentials.password ? "" : "La contraseña es requerida",
    };
  }
}

export default Validator;
