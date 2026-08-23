const nodemailer = require('nodemailer');

// Using explicit SMTP settings instead of the `service: 'gmail'` shorthand,
// plus longer timeouts — Render's outbound network path to Gmail can be
// slower than nodemailer's default timeouts allow for, which was causing
// "Connection timeout" errors on the very first send attempt.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password, NOT your normal password
  },
  connectionTimeout: 20000, // 20s instead of nodemailer's short default
  greetingTimeout: 20000,
  socketTimeout: 20000,
});

const sendOTPEmail = async (toEmail, name, otp) => {
  const mailOptions = {
    from: `"MediMatch" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your MediMatch account',
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f8fafc; padding: 32px 24px; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #0d9488; color: #ffffff; width: 48px; height: 48px; border-radius: 12px; font-size: 24px; line-height: 48px; font-weight: bold;">M</div>
        <h1 style="color: #0f172a; font-size: 20px; margin: 12px 0 0;">MediMatch</h1>
      </div>
      <div style="background: #ffffff; border-radius: 16px; padding: 28px 24px; border: 1px solid #e2e8f0;">
        <p style="color: #334155; font-size: 15px; margin: 0 0 4px;">Hi ${name || 'there'},</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
          Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.
        </p>
        <div style="background: #f0fdfa; border: 1px dashed #0d9488; border-radius: 12px; padding: 18px; text-align: center; margin-bottom: 20px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0d9488;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} MediMatch. All rights reserved.
      </p>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };