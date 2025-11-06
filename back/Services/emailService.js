// Services/emailService.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const USER = process.env.GMAIL_USER;
let PASS = process.env.GMAIL_APP_PASSWORD || "";
PASS = PASS.replace(/\s+/g, "");

if (!USER || !PASS) {
  console.error("Falta GMAIL_USER o GMAIL_APP_PASSWORD en .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: USER,
    pass: PASS,
  },
  logger: false, // cambiar a true para debug
  debug: false,  // cambiar a true para debug
});

// Plantilla HTML para credenciales
// emailType = 0 -> nuevo usuario
// emailType = 1 -> restablecimiento de contraseña
const getCredentialsEmailTemplate = (nombre, apellidos, username, password, emailType = 0) => {
  let title = "¡Bienvenido a GreenBit!";
  let lead = "Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales de acceso.";
  let message = "¡Bienvenido a nuestra plataforma de reciclaje! Tu cuenta ha sido creada correctamente.";
  if (emailType == 1) {
    title = "Restablecimiento de contraseña";
    lead = "Tu contraseña ha sido restablecida exitosamente. Aquí están tus credenciales de acceso.";
    message = "¡Bienvenido a nuestra plataforma de reciclaje! Tu contraseña ha sido restablecida correctamente.";
  }

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .email-wrapper { width:100%; background-color:#C9A171; padding:20px 0; }
    .email-content { width:600px; max-width:600px; margin:0 auto; }
    .card { background:#F5F3E8; border-radius:12px; border:3px solid #0A5C30; overflow:hidden; }
    h1 { margin:0; font-size:36px; line-height:1.1; color:#0E7A3A; font-weight:700; }
    p { margin:0 0 12px 0; color:#2f5441; font-size:15px; line-height:1.4; }
    .lead { color:#385a45; font-size:15px; line-height:1.4; }
    .credentials { 
      background: #e8f5e8; 
      border: 2px solid #0A5C30; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 16px 0;
      font-family: 'Courier New', monospace;
    }
    .credential-item { 
      margin: 8px 0; 
      font-size: 16px; 
      color: #0A5C30; 
      font-weight: bold;
    }
    .button {
      display:inline-block;
      text-decoration:none;
      padding:12px 28px;
      border-radius:6px;
      font-weight:700;
      background:#14A24F;
      color:#ffffff;
    }
    @media only screen and (max-width:600px) {
      .email-content { width:94% !important; max-width:94% !important; }
      h1 { font-size:26px !important; }
      .card { border-width:2px !important; border-radius:10px !important; }
      .credentials { padding: 12px !important; }
      .credential-item { font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#C9A171; font-family:Arial, Helvetica, sans-serif;">
  <table class="email-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="email-content" role="presentation" width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card">
                <tr>
                  <td align="center" style="padding:26px 30px;">
                    <h1>${title}</h1>
                    <div style="height:12px;"></div>
                    <p class="lead">${lead}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 34px;">
                    <p>Hola <strong>${nombre} ${apellidos}</strong>,</p>
                    <p>${message}</p>
                    
                    <div class="credentials">
                      <div class="credential-item">👤 Usuario: <span style="color:#14A24F;">${username}</span></div>
                      <div class="credential-item">🔐 Contraseña: <span style="color:#14A24F;">${password}</span></div>
                    </div>
                    
                    <p><strong>⚠️ Importante:</strong></p>
                    <ul style="color:#2f5441; padding-left: 20px;">
                      <li>Guarda estas credenciales en un lugar seguro</li>
                      <li>Te recomendamos cambiar tu contraseña después del primer inicio de sesión</li>
                      <li>No compartas estas credenciales con nadie</li>
                    </ul>
                    
                    
                    <div style="height:14px;"></div>
                    <p style="color:#6b725f; font-size:12px; margin:0;">
                      Si no solicitaste esta cuenta, contacta con soporte técnico.<br/>
                      © GreenBit 2025 - Cuidando el planeta juntos
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Plantilla HTML para rechazo de solicitud
const getRejectionEmailTemplate = (nombre, apellidos, userType) => {
  const tipoUsuario = userType === 'institucion' ? 'empresa' : 'persona';
  
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .email-wrapper { width:100%; background-color:#C9A171; padding:20px 0; }
    .email-content { width:600px; max-width:600px; margin:0 auto; }
    .card { background:#F5F3E8; border-radius:12px; border:3px solid #0A5C30; overflow:hidden; }
    h1 { margin:0; font-size:36px; line-height:1.1; color:#B33A3A; font-weight:700; }
    p { margin:0 0 12px 0; color:#2f5441; font-size:15px; line-height:1.4; }
    .lead { color:#385a45; font-size:15px; line-height:1.4; }
    .rejection-box { 
      background: #ffe8e8; 
      border: 2px solid #B33A3A; 
      border-radius: 8px; 
      padding: 16px; 
      margin: 16px 0;
    }
    @media only screen and (max-width:600px) {
      .email-content { width:94% !important; max-width:94% !important; }
      h1 { font-size:26px !important; }
      .card { border-width:2px !important; border-radius:10px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#C9A171; font-family:Arial, Helvetica, sans-serif;">
  <table class="email-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="email-content" role="presentation" width="600" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card">
                <tr>
                  <td align="center" style="padding:26px 30px;">
                    <h1>Solicitud de Cuenta Rechazada</h1>
                    <div style="height:12px;"></div>
                    <p class="lead">Lamentamos informarte que tu solicitud no ha sido aprobada.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 34px;">
                    <p>Estimado/a <strong>${nombre} ${apellidos}</strong>,</p>
                    <p>Lamentamos informarte que tu solicitud de registro como ${tipoUsuario} recolector/a en GreenBit no ha sido aprobada.</p>
                    
                    <div class="rejection-box">
                      <p style="margin:0; color:#B33A3A; font-weight:bold;">❌ Estado: Solicitud Rechazada</p>
                    </div>
                    
                    <p><strong>Posibles razones:</strong></p>
                    <ul style="color:#2f5441; padding-left: 20px;">
                      <li>La información proporcionada no cumple con nuestros requisitos</li>
                      <li>No se pudo verificar la documentación enviada</li>
                      <li>La solicitud no cumple con los criterios de aprobación</li>
                    </ul>
                    
                    <p>Si consideras que esto es un error o deseas obtener más información, por favor contacta con nuestro equipo de soporte.</p>
                    
                    <div style="height:14px;"></div>
                    <p style="color:#6b725f; font-size:12px; margin:0;">
                      Puedes intentar registrarte nuevamente en el futuro.<br/>
                      © GreenBit 2025 - Cuidando el planeta juntos
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Función para enviar credenciales por email
export const sendCredentialsEmail = async (to, nombre, apellidos, username, password, emailType=0) => {
  console.log("[DEBUG] sendCredentialsEmail - INICIO", {
    to,
    nombre,
    apellidos,
    username,
    passwordReceived: password,
    passwordLength: password?.length,
    emailType,
    timestamp: new Date().toISOString()
  });
  
  // Verificar si el transporter está configurado
  if (!transporter) {
    const error = "❌ No se puede enviar email: falta configurar GMAIL_USER y GMAIL_APP_PASSWORD en .env";
    console.error(error);
    throw new Error("Servicio de email no configurado");
  }

  try {
    const html = getCredentialsEmailTemplate(nombre, apellidos, username, password,emailType);

    const info = await transporter.sendMail({
      from: `"GreenBit" <${USER}>`,
      to: to,
      subject: "🌱 Tus credenciales de acceso - GreenBit",
      html: html,
    });

    console.log(`✅ Email de credenciales ENVIADO EXITOSAMENTE a ${to}:`, info.messageId);
    console.log(`[DEBUG] sendCredentialsEmail - Password en el email enviado: ${password}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error enviando email de credenciales:", error);
    throw error;
  }
};

// Función para verificar la conexión SMTP (como en tu código original)
export const verifyEmailConnection = async () => {
  if (!transporter) {
    console.log("⚠️ Transporter no configurado - verifica tu archivo .env");
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Conexión SMTP verificada. Listo para enviar emails.");
    return true;
  } catch (err) {
    console.error("❌ Error verificando SMTP:", err);
    return false;
  }
};

// Función para enviar email de rechazo
export const sendRejectionEmail = async (to, nombre, apellidos, userType = 'persona') => {
  
  if (!transporter) {
    const error = "❌ No se puede enviar email: falta configurar GMAIL_USER y GMAIL_APP_PASSWORD en .env";
    console.error(error);
    throw new Error("Servicio de email no configurado");
  }

  try {
    const html = getRejectionEmailTemplate(nombre, apellidos, userType);

    const info = await transporter.sendMail({
      from: `"GreenBit" <${USER}>`,
      to: to,
      subject: "⚠️ Solicitud de Cuenta Rechazada - GreenBit",
      html: html,
    });

    console.log(`✅ Email de rechazo enviado a ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error enviando email de rechazo:", error);
    throw error;
  }
};
