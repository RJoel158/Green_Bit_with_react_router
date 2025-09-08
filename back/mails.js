import { Resend } from 'resend';

const resend = new Resend('re_9xSftQrK_D74rMR9LGz6eN1VZWr7iB7Cu');
const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"/></head>
<body style="margin:0; padding:20px; background-color:#C9A171; font-family:Arial, sans-serif;">
  <!-- (pega aquí la plantilla completa que quieres enviar, por ejemplo la que te pasé) -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:600px;">
        <tr><td style="padding:18px;">
          <table width="100%" style="background:#F5F3E8; border-radius:12px; border:3px solid #0A5C30;">
            <tr><td align="center" style="padding:26px 30px;">
              <h1 style="margin:0; font-size:36px; color:#0E7A3A;">Registra tu cuenta de reciclaje</h1>
              <div style="height:12px;"></div>
              <p style="color:#2b6f42;">¡Gracias por sumarte! Confirma tu cuenta y empieza a reciclar con nosotros.</p>
            </td></tr>
            <tr><td style="padding:20px 34px;">
              <p style="color:#385a45;">Hola <strong>Nombre</strong>,<br/>Bienvenido...</p>
              <div style="text-align:center; padding:14px 0;">
                <a href="#" style="display:inline-block; padding:12px 28px; background:#14A24F; color:#fff; text-decoration:none; border-radius:6px; font-weight:700;">Activar cuenta</a>
              </div>
              <p style="color:#2f5441; font-size:13px;">Si el botón no funciona, usa este enlace: <a href="#" style="color:#0E7A3A;">https://ejemplo.com/activar/ABC123</a></p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
(async function () {
  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: ['smm0034570@est.univalle.edu'],
    subject: 'Correo de tilin',
    html,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();