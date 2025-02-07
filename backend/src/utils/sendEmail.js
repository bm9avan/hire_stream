import nodemailer from "nodemailer";
import MailGen from "mailgen";

async function sendEmail(user, message, status) {
  const config = {
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
  const transporter = nodemailer.createTransport(config);

  // Define theme color based on status
  let themeColor;
  switch (status.type) {
    case "success":
      themeColor = "#28a745"; // Green
      break;
    case "error":
      themeColor = "#dc3545"; // Red
      break;
    default:
      themeColor = "#007bff"; // Blue
  }

  const mailGenerator = new MailGen({
    theme: "default",
    product: {
      name: "Hire Stream",
      link: "http://example.com",
    },
  });

  const emailTemplate = {
    body: {
      name: user.name,
      intro: message.intro,
      action: message.button
        ? {
            instructions: message.instructions,
            button: {
              color: themeColor,
              text: message.button.text,
              link: message.button.link,
            },
          }
        : undefined,
      outro:
        message.outro || "If you have any questions, feel free to contact us.",
    },
  };

  const emailContent = mailGenerator.generate(emailTemplate);

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: message.subject,
      text: message.text,
      html: emailContent,
    });
    console.log("Message sent: %s", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
}

export default sendEmail;
