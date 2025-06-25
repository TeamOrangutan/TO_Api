import path from "path";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (to: string, token: string) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/reset-password/${token}`;
  const logoPath = path.join(process.cwd(), "assets/logo2.png");

  await transporter.sendMail({
    from: `"Team Orangutan" <${process.env.MAIL_USER}>`,
    to,
    subject: "Recuperación de contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: white; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:logoimg" alt="Logo" style="width: 120px;" />
        </div>
        <h2 style="text-align: center;">Recuperar tu contraseña</h2>
        <p>Hola,</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no fuiste tú, puedes ignorar este correo.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #000; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px;">
            Cambiar contraseña
          </a>
        </div>
        <p>Este enlace expirará después de un tiempo por seguridad.</p>
        <p style="font-size: 12px; color: #666;">Si tienes problemas, copia y pega este enlace en tu navegador:</p>
        <p style="font-size: 12px; color: #666;">${resetLink}</p>
      </div>
    `,
    attachments: [
      {
        filename: "logo2.png",
        path: logoPath,
        cid: "logoimg", // Este cid debe coincidir con el src en la etiqueta img
      },
    ],
  });
};
