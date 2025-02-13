import * as SibApiV3Sdk from "@getbrevo/brevo";
import { defineEventHandler, readBody, createError } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const { recipientEmail, surveyTitle, accessKey } = await readBody(event);

    // Vérifier les paramètres requis
    if (!recipientEmail || !surveyTitle || !accessKey) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required parameters",
        data: { recipientEmail, surveyTitle, accessKey },
      });
    }

    const baseUrl = event.node.req.headers.origin || process.env.BASE_URL;
    const homeUrl = `${baseUrl}`;

    const messageHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <h2 style="color: #0000FF;">Bonjour,</h2>
        <p>Vous avez été invité à participer au sondage intitulé : <strong>${surveyTitle}</strong>.</p>
        <p>
          Votre clé unique pour accéder au sondage est :
          <span style="font-weight: bold; color: #0000FF;">${accessKey}</span>
        </p>
        <p>
          Cliquez sur le lien suivant pour répondre au sondage :
          <a href="${homeUrl}/survey/${accessKey}" style="color: #0000FF; text-decoration: none;">Accéder au sondage</a>
        </p>
        <p>Merci,<br>L'équipe.</p>
      </div>
    `;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not defined in environment variables");
    }

    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `Invitation à participer au sondage : ${surveyTitle}`;
    sendSmtpEmail.htmlContent = messageHtml;
    sendSmtpEmail.sender = {
      name: "Echo Sondages",
      email: "noreply@votredomaine.com",
    };
    sendSmtpEmail.to = [{ email: recipientEmail }];

    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      return { success: true, info: data };
    } catch (err: any) {
      console.error(
        "Error sending email with Brevo:",
        err.response?.text || err.message
      );
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de l'envoi de l'email",
        data: err.response?.text || err.message,
      });
    }
  } catch (err: any) {
    console.error("General error in sendEmail:", err);
    throw createError({
      statusCode: 500,
      statusMessage: err.message || "Une erreur s'est produite",
      data: err,
    });
  }
});
