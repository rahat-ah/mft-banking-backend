import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_SERVER,
  port: process.env.BREVO_SMTP_PORT,
  secure: process.env.BREVO_SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
});

export const sendSignupMailHtml = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0;">Welcome to MFT Banking 🎉</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Hello <strong>Dear ${name}</strong>,</p>
          <p>Thank you for signing up to <strong>MFT</strong> system. You are now part of Messrs Famous Traders Banking</p>
        </div>
        <div style="background:#f1f1f1; text-align:center; padding:10px; font-size:12px; color:#777;">
          <p>© ${new Date().getFullYear()} MFT||Banking . All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

export const sendSigninMailHtml = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 15px; text-align: center;">
          <h2 style="margin: 0;">Welcome to MFT Banking 🎉</h2>
        </div>
        <div style="padding: 20px; color: #333;">
          <p>Hello <strong>Dear ${name}</strong>,</p>
          <p>Thank you for logged in to <strong>MFT Banking</strong> system. You are now part of Messrs Famous Traders Banking</p>
        </div>
        <div style="background:#f1f1f1; text-align:center; padding:10px; font-size:12px; color:#777;">
          <p>© ${new Date().getFullYear()} MFT||Banking. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

export const sendLogoutMailHtml = (name) => {
  return `<div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="450" style="background:#ffffff; border-radius:8px; padding:25px; text-align:center;">
            
            <tr>
              <td style="font-size:22px; font-weight:bold; color:#333;">
                Logout Successful from MFT
              </td>
            </tr>

            <tr>
              <td style="padding:15px 0; font-size:15px; color:#555;">
                Hi ${name},<br><br>
                You have successfully logged out of your account.
              </td>
            </tr>

            <tr>
              <td style="padding-top:20px; font-size:12px; color:#999;">
                If this wasn't you, please reset your password immediately.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;
};

export const sendOtpMailHtml = ( otp , status , expireTimeInMinutes) => {
  return `<div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
    <table width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <table width="450" style="background:#ffffff; border-radius:8px; padding:25px; text-align:center;">

            <tr>
              <td style="font-size:22px; font-weight:bold; color:#333;">
                This is your ${status}
              </td>
            </tr>

            <tr>
              <td style="padding:15px 0; font-size:15px; color:#555;">
                Hi Dear,<br><br>
                Use the OTP below to verify your account.
              </td>
            </tr>

            <tr>
              <td style="padding:20px 0;">
                <div style="display:inline-block;
                            font-size:26px;
                            font-weight:bold;
                            letter-spacing:4px;
                            background:#2563eb;
                            color:#fff;
                            padding:12px 20px;
                            border-radius:6px;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding-top:10px; font-size:13px; color:#777;">
                This ${status} will expire in ${expireTimeInMinutes} minutes from now.
              </td>
            </tr>

            <tr>
              <td style="padding-top:20px; font-size:12px; color:#999;">
                If you didn’t request this, please ignore this email.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>`;
};
