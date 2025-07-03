// Backward compatibility during migration
// TODO: Remove this file after all imports are updated
export * from '../shared/email';

// Email templates
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<void> => {
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
