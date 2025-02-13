interface EmailResponse {
  success: boolean;
  error?: string;
  messageId?: string;
}

interface SendEmailParams {
  recipientEmail: string;
  surveyTitle: string;
  accessKey: string;
}

const DEBUG = process.env.NODE_ENV !== "production";

function logDebug(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Email Service Debug] ${message}`, data || "");
  }
}

const emailService = {
  sendEmail: async (
    recipientEmail: string,
    surveyTitle: string,
    accessKey: string
  ): Promise<EmailResponse> => {
    try {
      logDebug("Sending email", { recipientEmail, surveyTitle });

      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail,
          surveyTitle,
          accessKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.statusMessage || "Failed to send email");
      }

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

export default emailService;
