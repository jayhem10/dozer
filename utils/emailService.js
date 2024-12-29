import { useSupabaseClient } from "#imports";

export default async function sendEmail(
  recipientEmail,
  surveyTitle,
  accessKey
) {
  const supabase = useSupabaseClient();

  const message = `
    Bonjour,

    Vous avez été invité à répondre au sondage intitulé : "${surveyTitle}".

    Accédez au sondage en utilisant votre clé unique : ${accessKey}

    Cliquez sur le lien suivant pour répondre : ${window.location.origin}/survey?key=${accessKey}

    Merci,
    L'équipe.
  `;

  try {
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        to: recipientEmail,
        subject: `Invitation à participer au sondage : ${surveyTitle}`,
        text: message,
      },
    });

    if (error) {
      console.error("Erreur lors de l'envoi de l'email :", error);
      throw new Error("L'envoi de l'email a échoué.");
    }
  } catch (err) {
    console.error(err);
    throw new Error("Erreur dans l'email service.");
  }
}
