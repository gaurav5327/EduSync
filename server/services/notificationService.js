import nodemailer from "nodemailer";
import User from "../models/User.js";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendNotificationToAdmins(message) {
  try {
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await transporter.sendMail({
        from: '"Class Scheduler" <noreply@classscheduler.com>',
        to: admin.email,
        subject: "Unresolved Conflict in Class Schedule",
        text: message,
        html: `<p>${message}</p>`,
      });
    }

    console.log("Notifications sent to admins");
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
}
