import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const msg = {
    to: options.to,
    from: options.from || process.env.EMAIL_FROM || 'noreply@example.com',
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (process.env.NODE_ENV === 'test') {
    // Don't actually send emails in test environment
    console.log('Email would be sent:', msg);
    return;
  }

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Email templates
export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to AI Chat!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for signing up for AI Chat.</p>
      <p>You can now start using our platform to create amazing chat experiences.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  });
};