export type FormData = {
  username: string;
  email: string;
  phone: string;
};

export type FormErrors = Partial<FormData>;

export class Validator {
  
  static validate(form: FormData): FormErrors {
    const errors: FormErrors = {};

    if (!form.username.trim()) errors.username = "El nombre de usuario es requerido";

    if (!form.email.trim()) errors.email = "El correo es requerido";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Formato de correo inválido";

    if (!form.phone.trim()) errors.phone = "El número celular es requerido";
    else if (!/^\+?591[67]\d{7}$/.test(form.phone.replace(/\s/g, "")))
      errors.phone = "Formato: +59177777777 o +59167777777";

    return errors;
  }

  
  static isValid(errors: FormErrors): boolean {
    return Object.keys(errors).length === 0;
  }
}