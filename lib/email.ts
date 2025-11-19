import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail({
  email,
  invitationToken,
  inviterName,
  inviterEmail,
}: {
  email: string;
  invitationToken: string;
  inviterName: string | null;
  inviterEmail: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/invite/accept?token=${invitationToken}`;

  const inviterDisplay = inviterName || inviterEmail;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `You've been invited to join ${process.env.NEXT_PUBLIC_APP_NAME || 'Asana Replacement'}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #2d3748; margin-top: 0; font-size: 24px; font-weight: 600;">
                You've been invited!
              </h1>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                <strong>${inviterDisplay}</strong> has invited you to join ${process.env.NEXT_PUBLIC_APP_NAME || 'our project management platform'}.
              </p>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 32px;">
                Click the button below to accept the invitation and create your account:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${invitationUrl}" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              <p style="color: #718096; font-size: 14px; margin-top: 32px; margin-bottom: 0;">
                Or copy and paste this link into your browser:<br>
                <a href="${invitationUrl}" style="color: #4299e1; word-break: break-all;">${invitationUrl}</a>
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin-top: 24px; margin-bottom: 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
You've been invited!

${inviterDisplay} has invited you to join ${process.env.NEXT_PUBLIC_APP_NAME || 'our project management platform'}.

Click the link below to accept the invitation and create your account:

${invitationUrl}

This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

