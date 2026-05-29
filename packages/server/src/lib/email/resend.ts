import { Resend } from 'resend';
import { env } from '../../config/env';

// We initialize Resend. If no API key is provided, we can mock it in development.
const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key';
const resend = new Resend(resendApiKey);

// Default sender
const DEFAULT_SENDER = 'EduGoma 360 <noreply@edugoma.cd>';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Sends an email using the Resend API
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    if (resendApiKey === 're_mock_key') {
      console.log('📧 [MOCK EMAIL] To:', options.to);
      console.log('📧 [MOCK EMAIL] Subject:', options.subject);
      console.log('📧 [MOCK EMAIL] Attachments count:', options.attachments?.length || 0);
      return { id: `mock_${Date.now()}`, success: true };
    }

    const { data, error } = await resend.emails.send({
      from: DEFAULT_SENDER,
      to: Array.isArray(options.to) ? options.to : [options.to],
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error(error.message);
    }

    return { id: data?.id, success: true };
  } catch (err: any) {
    console.error('❌ Failed to send email:', err);
    throw new Error(err.message || 'Error sending email');
  }
}
