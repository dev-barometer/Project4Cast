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
      subject: `You've been invited to join ${process.env.NEXT_PUBLIC_APP_NAME || 'Project4Cast'}`,
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
                <strong>${inviterDisplay}</strong> has invited you to join ${process.env.NEXT_PUBLIC_APP_NAME || 'Project4Cast'}.
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

${inviterDisplay} has invited you to join ${process.env.NEXT_PUBLIC_APP_NAME || 'Project4Cast'}.

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

export async function sendTaskAssignmentEmail({
  email,
  taskTitle,
  jobTitle,
  assignerName,
  assignerEmail,
  taskUrl,
}: {
  email: string;
  taskTitle: string;
  jobTitle?: string | null;
  assignerName: string | null;
  assignerEmail: string;
  taskUrl: string;
}) {
  const assignerDisplay = assignerName || assignerEmail;
  const jobContext = jobTitle ? ` in job "${jobTitle}"` : '';

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `You've been assigned to a task: ${taskTitle}`,
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
                You've been assigned to a task
              </h1>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                <strong>${assignerDisplay}</strong> has assigned you to a task${jobContext}.
              </p>
              <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #2d3748;">
                  ${taskTitle}
                </p>
                ${jobTitle ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #718096;">${jobTitle}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${taskUrl}" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  View Task
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
You've been assigned to a task

${assignerDisplay} has assigned you to a task${jobContext}.

Task: ${taskTitle}
${jobTitle ? `Job: ${jobTitle}` : ''}

View the task: ${taskUrl}
      `,
    });

    if (error) {
      console.error('Error sending task assignment email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending task assignment email:', error);
    throw error;
  }
}

export async function sendJobAssignmentEmail({
  email,
  jobTitle,
  jobNumber,
  assignerName,
  assignerEmail,
  jobUrl,
}: {
  email: string;
  jobTitle: string;
  jobNumber: string;
  assignerName: string | null;
  assignerEmail: string;
  jobUrl: string;
}) {
  const assignerDisplay = assignerName || assignerEmail;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `You've been added to a job: ${jobNumber}`,
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
                You've been added to a job
              </h1>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                <strong>${assignerDisplay}</strong> has added you as a collaborator on a job.
              </p>
              <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${jobNumber}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 500; color: #2d3748;">
                  ${jobTitle}
                </p>
              </div>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${jobUrl}" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  View Job
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
You've been added to a job

${assignerDisplay} has added you as a collaborator on a job.

Job: ${jobNumber} - ${jobTitle}

View the job: ${jobUrl}
      `,
    });

    if (error) {
      console.error('Error sending job assignment email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending job assignment email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail({
  email,
  resetUrl,
  userName,
}: {
  email: string;
  resetUrl: string;
  userName: string | null;
}) {
  const userDisplay = userName || email;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Reset your password',
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
                Reset your password
              </h1>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                Hi ${userDisplay},
              </p>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="color: #718096; font-size: 14px; margin-top: 32px; margin-bottom: 0;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #4299e1; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin-top: 24px; margin-bottom: 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Reset your password

Hi ${userDisplay},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export async function sendCommentMentionEmail({
  email,
  taskTitle,
  jobTitle,
  commenterName,
  commenterEmail,
  taskUrl,
}: {
  email: string;
  taskTitle?: string | null;
  jobTitle?: string | null;
  commenterName: string | null;
  commenterEmail: string;
  taskUrl: string;
}) {
  const commenterDisplay = commenterName || commenterEmail;
  let contextText = '';
  if (taskTitle && jobTitle) {
    contextText = `task "${taskTitle}" in job "${jobTitle}"`;
  } else if (taskTitle) {
    contextText = `task "${taskTitle}"`;
  } else if (jobTitle) {
    contextText = `job "${jobTitle}"`;
  } else {
    contextText = 'a task';
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `${commenterDisplay} mentioned you in a comment`,
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
                You've been mentioned
              </h1>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                <strong>${commenterDisplay}</strong> mentioned you in a comment on ${contextText}.
              </p>
              ${taskTitle ? `
              <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #2d3748;">
                  ${taskTitle}
                </p>
                ${jobTitle ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #718096;">${jobTitle}</p>` : ''}
              </div>
              ` : jobTitle ? `
              <div style="background-color: #f7fafc; border-left: 4px solid #4299e1; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #2d3748;">
                  ${jobTitle}
                </p>
              </div>
              ` : ''}
              <div style="text-align: center; margin: 32px 0;">
                <a href="${taskUrl}" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  View Comment
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
You've been mentioned

${commenterDisplay} mentioned you in a comment on ${contextText}.

View the comment: ${taskUrl}
      `,
    });

    if (error) {
      console.error('Error sending comment mention email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending comment mention email:', error);
    throw error;
  }
}

export async function sendVerificationEmail({
  email,
  verificationUrl,
  userName,
}: {
  email: string;
  verificationUrl: string;
  userName: string | null;
}) {
  const userDisplay = userName || email;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your email address',
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
                Verify your email address
              </h1>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                Hi ${userDisplay},
              </p>
              <p style="color: #4a5568; font-size: 16px; margin-bottom: 24px;">
                Thanks for signing up! Please verify your email address by clicking the button below:
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="display: inline-block; background-color: #4299e1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 16px;">
                  Verify Email
                </a>
              </div>
              <p style="color: #718096; font-size: 14px; margin-top: 32px; margin-bottom: 0;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #4299e1; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="color: #a0aec0; font-size: 12px; margin-top: 24px; margin-bottom: 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `
Verify your email address

Hi ${userDisplay},

Thanks for signing up! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

