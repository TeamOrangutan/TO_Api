"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = void 0;
const path_1 = __importDefault(require("path"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
const sendResetPasswordEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const resetLink = `http://localhost:5173/reset-password/${token}`;
    const logoPath = path_1.default.join(process.cwd(), "assets/logo2.png");
    yield transporter.sendMail({
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
});
exports.sendResetPasswordEmail = sendResetPasswordEmail;
