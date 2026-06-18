const transporter = require("../config/mailer");

const FROM = `"Todo Board" <${process.env.EMAIL_FROM}>`;

/**
 * Send email verification link.
 */
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Welcome to Todo Board, ${user.name}!</h2>
        <p style="color: #555;">Please verify your email address to activate your account.</p>
        <a href="${verifyUrl}"
           style="display:inline-block; margin: 20px 0; padding: 14px 28px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Verify Email &amp; Log In
        </a>
        <p style="color: #999; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: "Verify your Todo Board email",
    html,
  });
};

/**
 * Send due-date reminder for a work item.
 */
const sendReminderEmail = async (user, workItem) => {
  const dueDateStr = workItem.dueDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(workItem.hasDueTime && { hour: "2-digit", minute: "2-digit" }),
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #E53E3E;">⏰ Reminder: Task Due Soon</h2>
        <p style="color: #555;">Hi <strong>${user.name}</strong>, your task is due:</p>
        <div style="border-left: 4px solid #4F46E5; padding: 16px; margin: 20px 0; background: #f9f9f9;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${workItem.title}</h3>
          ${workItem.description ? `<p style="margin: 0; color: #666;">${workItem.description}</p>` : ""}
          <p style="margin: 12px 0 0 0; color: #E53E3E; font-weight: bold;">Due: ${dueDateStr}</p>
        </div>
        <p style="color: #999; font-size: 13px;">Log in to Todo Board to review this task.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `⏰ Reminder: "${workItem.title}" is due`,
    html,
  });
};

/**
 * Send password reset email.
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Reset your password</h2>
        <p style="color: #555;">Hi <strong>${user.name}</strong>, we received a request to reset your Todo Board password.</p>
        <a href="${resetUrl}"
           style="display:inline-block; margin: 20px 0; padding: 14px 28px; background: #4F46E5; color: #fff; text-decoration: none; border-radius: 6px; font-size: 16px;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: "Reset your Todo Board password",
    html,
  });
};

module.exports = { sendVerificationEmail, sendReminderEmail, sendPasswordResetEmail };
