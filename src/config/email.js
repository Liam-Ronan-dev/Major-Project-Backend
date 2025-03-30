import * as dotenv from 'dotenv';

dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

export const sendEmail = async (email, role, userId, token) => {
  console.log(process.env.BACKEND_URL);
  const verificationLink = `${process.env.BACKEND_URL}/api/admin/verify/${userId}/${token}`;
  console.log('Generated Verification Link:', verificationLink);

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL, // Admin receives the email
    subject: 'New User Registration - Verify User',
    html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h1 style="color: #000;">A new user has registered to Health-Service.click</h1>
            <p style="font-weight: bold; font-size: 16px;">Email: ${email}</p>
            <p style="font-weight: bold; font-size: 16px;">Role: ${role}</p>
            <p style="font-weight: bold; font-size: 16px;">Click below to verify:</p>
            <a href="${verificationLink}" style="
                display: inline-block;
                padding: 12px 24px;
                margin-top: 10px;
                font-size: 16px;
                font-weight: bold;
                color: #fff;
                background-color: #000;
                text-decoration: none;
                border-radius: 5px;">
              Verify User
            </a>
          </div>
        `,
  });
};
