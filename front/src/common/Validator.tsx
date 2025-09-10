export class Validator {


  static validatenames(name: string): string {
    if (!name.trim()) return "El nombre es requerido";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) return "Solo letras y espacios permitidos";
    return "";
  }

  static validateUsername(username: string): string {
    if (!username.trim()) return "El nombre de usuario es requerido";
    return "";
  }

  
  static validateEmail(email: string): string {
    if (!email.trim()) return "El correo es requerido";
    if (!/\S+@\S+\.\S+/.test(email)) return "Formato de correo inválido";
    return "";
  }


  static validatePhone(phone: string): string {
    if (!phone.trim()) return "El número celular es requerido";
    if (!/^\+?591[67]\d{7}$/.test(phone.replace(/\s/g, "")))
      return "Formato: +59177777777 o +59167777777";
    return "";
  }

  
  static validatePassword(password: string): string {
    if (!password.trim()) return "La contraseña es requerida";
    if (password.length < 8) return "Debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Debe tener al menos una mayúscula";
    if (!/[0-9]/.test(password)) return "Debe tener al menos un número";
    return "";
  }

 

  static isValid(errors: Record<string,string>): boolean {
    return Object.values(errors).every((e) => e === "");
  }
}
