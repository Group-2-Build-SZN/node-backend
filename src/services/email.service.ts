import path from "node:path";
import ejs from "ejs";
import nodemailer from "nodemailer";
import { env } from "@/config/env.config";

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_PORT === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

class EmailService {
  async sendLoginCode(to: string, code: string) {
    const templatePath = path.join(
      __dirname,
      "../templates/login-code-email.ejs",
    );

    const html = await ejs.renderFile(templatePath, {
      code,
      expiryMinutes: env.OTP_EXPIRY_MINUTES,
    });

    await transporter.sendMail({
      from: `"My Ulo" <${env.EMAIL_USER}>`,
      to,
      subject: "Your My Ulo login code",
      html,
    });
  }

  async sendContactNotification(payload: {
    fullName: string;
    email: string;
    subject: string;
    message: string;
  }) {
    await transporter.sendMail({
      from: `"My Ulo Website" <${env.EMAIL_USER}>`,
      to: env.SUPPORT_EMAIL,
      replyTo: payload.email,
      subject: `[Contact Form] ${payload.subject} - from ${payload.fullName}`,
      text: `From: ${payload.fullName} (${payload.email})\nSubject: ${payload.subject}\n\n${payload.message}`,
    });
  }
}

export default new EmailService();
