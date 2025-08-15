import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Check if we should use a dummy transporter
const useDummy = !process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.FORCE_DUMMY === 'true';

let transporter;

if (useDummy) {
  console.log('⚠️ Using dummy email transporter (emails will not be sent).');

  transporter = {
    sendMail: async (mailOptions) => {
      console.log('📧 Dummy email sent:', mailOptions);
      return { messageId: 'dummy-message-id' };
    },
    verify: async () => {
      console.log('✅ Dummy transporter verified.');
      return true;
    }
  };
} else {
  transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
    } else {
      console.log('✅ Email server is ready to take our messages');
    }
  });
}

// Send email helper
export const sendEmail = async (mailOptions) => {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
};

// Health check
export const checkEmailHealth = async () => {
  try {
    await transporter.verify();
    return { status: 'healthy', message: 'Email service is operational' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

export default transporter;
