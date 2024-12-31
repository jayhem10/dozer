export default async function sendEmail(
  recipientEmail: string,
  surveyTitle: string,
  accessKey: string
) {
  try {
    const response = await $fetch("/api/sendEmail", {
      method: "POST",
      body: { recipientEmail, surveyTitle, accessKey },
    });

    if (!response?.success) {
      throw new Error("Email service returned an unsuccessful response.");
    }

    console.log(`Email successfully sent to ${recipientEmail}`, response);
    return true;
  } catch (err) {
    console.error(`Error sending email to ${recipientEmail}:`, err.message);
    throw err;
  }
}
