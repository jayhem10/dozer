import nodemailer from "nodemailer";
import { defineEventHandler, readBody } from "h3";

export default defineEventHandler(async (event) => {
  // Lire les données de la requête
  const { recipientEmail, surveyTitle, accessKey } = await readBody(event);

  console.log("Received request to send email:", {
    recipientEmail,
    surveyTitle,
    accessKey,
  });

  // URL vers la page d'accueil
  const baseUrl = event.node.req.headers.origin || "http://localhost:3000";
  const homeUrl = `${baseUrl}/`;

  // Message HTML stylisé
  const messageHtml = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #0000FF;">Bonjour,</h2>
      <p>Vous avez été invité à participer au sondage intitulé : <strong>${surveyTitle}</strong>.</p>
      <p>
        Utilisez votre clé unique pour accéder au sondage :
        <span style="font-weight: bold; color: #0000FF;">${accessKey}</span>
      </p>
      <p>
        Cliquez sur le lien suivant pour répondre au sondage :
        <a href="${homeUrl}" style="color: #0000FF; text-decoration: none;">Accéder au sondage</a>
      </p>
      <p>Merci,<br>L'équipe.</p>
    </div>
  `;

  // Configuration de Mailtrap avec Nodemailer
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "d923b40afa0c40",
      pass: "3ad4b0bbd7cfe9",
    },
  });

  try {
    // Envoi de l'email
    const info = await transporter.sendMail({
      from: "noreply@yourdomain.com",
      to: recipientEmail,
      subject: `Invitation à participer au sondage : ${surveyTitle}`,
      html: messageHtml,
    });

    console.log("Mail sent:", info);
    return { success: true, info };
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to send email.",
      data: err.message,
    });
  }
});
