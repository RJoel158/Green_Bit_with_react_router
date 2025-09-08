// send-with-gmail.js (Express + Nodemailer)

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    /* Reset básico para emails */
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse !important; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    /* Contenedor principal con ancho máximo */
    .email-wrapper { width:100%; background-color:#C9A171; padding:20px 0; }
    .email-content { width:600px; max-width:600px; margin:0 auto; }
    .card { background:#F5F3E8; border-radius:12px; border:3px solid #0A5C30; overflow:hidden; }
    h1 { margin:0; font-size:36px; line-height:1.1; color:#0E7A3A; font-weight:700; }
    p { margin:0 0 12px 0; color:#2f5441; font-size:15px; line-height:1.4; }
    .lead { color:#385a45; font-size:15px; line-height:1.4; }
    .button {
      display:inline-block;
      text-decoration:none;
      padding:12px 28px;
      border-radius:6px;
      font-weight:700;
      background:#14A24F;
      color:#ffffff;
    }
    /* small helper to center content on mobile */
    .center { text-align:center; }

    /* Media queries: ajusta en pantallas pequeñas */
    @media only screen and (max-width:600px) {
      .email-content { width:94% !important; max-width:94% !important; }
      h1 { font-size:26px !important; }
      .card { border-width:2px !important; border-radius:10px !important; }
      .pad-outer { padding:12px !important; }
      .pad-inner { padding:16px !important; }
      .button { display:block !important; width:100% !important; box-sizing:border-box; padding:14px !important; }
      .small-text { font-size:13px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#C9A171; font-family:Arial, Helvetica, sans-serif;">
  <!-- Wrapper -->
  <table class="email-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#C9A171; width:100%;">
    <tr>
      <td align="center">
        <!-- Content (centered) -->
        <table class="email-content" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; margin:0 auto;">
          <tr>
            <td style="padding:18px;" class="pad-outer">
              <!-- Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="card" style="background:#F5F3E8; border-radius:12px; border:3px solid #0A5C30;">
                <!-- Header -->
                <tr>
                  <td align="center" style="padding:26px 30px;" class="pad-inner">
                    <h1 style="margin:0; font-size:36px; color:#0E7A3A; font-family:Arial, Helvetica, sans-serif;">Registra tu cuenta de reciclaje</h1>
                    <div style="height:12px;"></div>
                    <p class="lead" style="margin:0; color:#2b6f42; font-size:15px;">¡Gracias por sumarte! Confirma tu cuenta y empieza a reciclar con nosotros.</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:20px 34px;" class="pad-inner">
                    <p style="color:#385a45; font-size:15px; margin:0 0 12px 0;">Hola <strong>Nombre</strong>,<br/>Bienvenido a nuestra comunidad de reciclaje. Para completar el registro pulsa el botón de abajo.</p>

                    <div style="text-align:center; padding:14px 0;">
                      <!-- Button: keep styles inline for best compatibility -->
                      <a href="#" class="button" style="display:inline-block; padding:12px 28px; background:#14A24F; color:#ffffff; text-decoration:none; border-radius:6px; font-weight:700;">Activar cuenta</a>
                    </div>

                    <p style="color:#2f5441; font-size:13px; margin:0 0 12px 0;" class="small-text">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="color:#0E7A3A; word-break:break-all; font-size:13px; margin:0 0 6px 0;"><a href="#" style="color:#0E7A3A; text-decoration:underline;">https://ejemplo.com/activar/ABC123</a></p>

                    <div style="height:14px;"></div>

                    <!-- Footer note -->
                    <p style="color:#6b725f; font-size:12px; margin:0;">Si no creaste esta cuenta, ignora este correo. © TuProyecto</p>
                  </td>
                </tr>
              </table>
              <!-- End card -->
            </td>
          </tr>
        </table>
        <!-- End content -->
      </td>
    </tr>
  </table>
</body>
</html>`;
// mails.js  (ESM)
import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// lee credenciales desde .env (más seguro)
const USER = process.env.GMAIL_USER;
let PASS = process.env.GMAIL_APP_PASSWORD || "";

// si por accidente pegaste la app password con espacios los quitamos
PASS = PASS.replace(/\s+/g, "");

// Validaciones rápidas
if (!USER || !PASS) {
  console.error("Falta GMAIL_USER o GMAIL_APP_PASSWORD en .env");
  process.exit(1);
}

// crea transporter con debug/logging para ver errores
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: USER,
    pass: PASS,
  },
  logger: true,   // muestra logs por consola
  debug: true,    // salida debug SMTP
});

// Verifica la conexión SMTP al arrancar
const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log("✅ Conexión SMTP verificada. Listo para enviar emails.");
  } catch (err) {
    console.error("❌ Error verificando SMTP:", err);
  }
};

// Endpoint que envía correo (usa body o valores por defecto)
app.post("/api/send-gmail", async (req, res) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: "Faltan campos: to, subject, html" });
    }

    const info = await transporter.sendMail({
      from: USER,
      to,
      subject,
      html,
    });

    console.log("Mensaje enviado:", info.messageId);
    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error("Error enviando correo:", err);
    return res.status(500).json({ ok: false, error: err.message || err });
  }
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server escuchando en http://localhost:${PORT}`);
  await verifyTransporter();

  // OPCIONAL: enviar un correo de prueba al arrancar (puedes comentar si no quieres)
  try {
    const testInfo = await transporter.sendMail({
      from: USER,
      to: 'lcm0035247@est.univalle.edu', // te lo mandas a ti mismo de prueba
      subject: "Prueba automática - server arrancó",
      html: html,
    });
    console.log("Correo de prueba enviado al arrancar:", testInfo.messageId);
  } catch (err) {
    console.error("No se pudo enviar correo de prueba al arrancar:", err.message || err);
  }
});
