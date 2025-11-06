/**
 * Validación de números telefónicos por país
 * Bolivia, Perú y Chile
 * 
 * Formatos aceptados:
 * - Bolivia: +591XXXXXXXXX o 91XXXXXXXXX (8-9 dígitos)
 * - Perú: +51XXXXXXXXX o 51XXXXXXXXX (9 dígitos)
 * - Chile: +56XXXXXXXXX o 56XXXXXXXXX (8-9 dígitos)
 */

interface CountryData {
  code: string;
  name: string;
  regex: RegExp;
  minDigits: number;
  maxDigits: number;
}

interface CountriesMap {
  [key: string]: CountryData;
}

export class PhoneValidator {
  
  /**
   * Países soportados con su código de país y validación
   */
  static readonly COUNTRIES: CountriesMap = {
    BOLIVIA: {
      code: '591',
      name: 'Bolivia',
      regex: /^(\+591|591|0)([0-9]{7,8})$/,  // +591XXXXXXXX o 91XXXXXXXX
      minDigits: 8,
      maxDigits: 9
    },
    PERU: {
      code: '51',
      name: 'Perú',
      regex: /^(\+51|51|0)([0-9]{8,9})$/,    // +51XXXXXXXXX o 51XXXXXXXXX
      minDigits: 9,
      maxDigits: 9
    },
    CHILE: {
      code: '56',
      name: 'Chile',
      regex: /^(\+56|56|0)([0-9]{8,9})$/,    // +56XXXXXXXX o 56XXXXXXXX
      minDigits: 8,
      maxDigits: 8
    }
  };

  /**
   * Normaliza un número telefónico quitando espacios, guiones y paréntesis
   * @param {string} phone - Número a normalizar
   * @returns {string} - Número normalizado
   */
  static normalizePhone(phone: string): string {
    return phone.replace(/[\s\-().]/g, '');
  }

  /**
   * Detecta el país del número telefónico
   * @param {string} phone - Número telefónico
   * @returns {string|null} - Nombre del país o null si no se detecta
   */
  static detectCountry(phone: string): string | null {
    const normalized = this.normalizePhone(phone);
    
    for (const countryData of Object.values(this.COUNTRIES)) {
      if (countryData.regex.test(normalized)) {
        return countryData.name;
      }
    }
    return null;
  }

  /**
   * Valida un número telefónico para un país específico
   * @param {string} phone - Número telefónico
   * @param {string} country - País ('BOLIVIA', 'PERU', 'CHILE')
   * @returns {string} - Mensaje de error o string vacío si es válido
   */
  static validatePhoneByCountry(phone: string, country: string): string {
    if (!phone || !phone.trim()) {
      return "El teléfono es requerido";
    }

    const normalized = this.normalizePhone(phone);
    const countryData = this.COUNTRIES[country] as CountryData | undefined;

    if (!countryData) {
      return `País no soportado: ${country}`;
    }

    if (!countryData.regex.test(normalized)) {
      return `Formato de teléfono de ${countryData.name} inválido`;
    }

    return "";
  }

  /**
   * Valida un número telefónico detectando automáticamente el país
   * Acepta números de Bolivia, Perú o Chile
   * @param {string} phone - Número telefónico
   * @returns {string} - Mensaje de error o string vacío si es válido
   */
  static validatePhoneAnyCountry(phone: string): string {
    if (!phone || !phone.trim()) {
      return "El teléfono es requerido";
    }

    const normalized = this.normalizePhone(phone);
    const country = this.detectCountry(normalized);

    if (!country) {
      return "Teléfono inválido. Formatos aceptados:\n" +
        "🇧🇴 Bolivia: +591XXXXXXXX\n" +
        "🇵🇪 Perú: +51XXXXXXXXX\n" +
        "🇨🇱 Chile: +56XXXXXXXX";
    }

    return "";
  }

  /**
   * Obtiene el código de país a partir del número
   * @param {string} phone - Número telefónico
   * @returns {string|null} - Código de país o null
   */
  static getCountryCode(phone: string): string | null {
    const normalized = this.normalizePhone(phone);
    
    for (const countryData of Object.values(this.COUNTRIES)) {
      if (countryData.regex.test(normalized)) {
        return countryData.code;
      }
    }
    return null;
  }

  /**
   * Extrae solo los dígitos del número
   * @param {string} phone - Número telefónico
   * @returns {string} - Solo dígitos
   */
  static getDigitsOnly(phone: string): string {
    return this.normalizePhone(phone).replace(/\D/g, '');
  }

  /**
   * Formatea un número telefónico al formato nacional
   * @param {string} phone - Número telefónico
   * @param {string} country - País destino
   * @returns {string} - Número formateado o el original si hay error
   */
  static formatPhone(phone: string, country: string): string {
    const normalized = this.normalizePhone(phone);
    const countryData = this.COUNTRIES[country] as CountryData | undefined;

    if (!countryData || !countryData.regex.test(normalized)) {
      return phone; // Retorna original si hay error
    }

    const digits = this.getDigitsOnly(normalized);
    
    // Remover código de país si está presente
    let localNumber = digits;
    if (digits.startsWith(countryData.code)) {
      localNumber = digits.substring(countryData.code.length);
    }

    // Formato: +591 XXXXXXXX
    return `+${countryData.code} ${localNumber}`;
  }
}

export default PhoneValidator;
