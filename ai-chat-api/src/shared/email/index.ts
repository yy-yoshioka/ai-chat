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
  const msg: {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
  } = {
    to: options.to,
    from: options.from || process.env.EMAIL_FROM || 'noreply@example.com',
    subject: options.subject,
  };

  // SendGrid requires either text or html content
  if (options.text) {
    msg.text = options.text;
  }
  if (options.html) {
    msg.html = options.html;
  }

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
