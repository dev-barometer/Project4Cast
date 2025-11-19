# User Invitation Setup Guide

## Overview
This application includes a user invitation system that allows administrators to invite users by email. Invited users receive an email with a link to create their account.

## Email Service Setup (Resend)

### 1. Create a Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key
1. In the Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Give it a name (e.g., "Asana Replacement")
4. Copy the API key (you'll only see it once!)

### 3. Set Up Domain (Optional but Recommended)
For production, you should verify your domain:
1. Go to "Domains" in Resend dashboard
2. Add your domain
3. Add the DNS records provided by Resend
4. Wait for verification

For development/testing, you can use Resend's default domain (`onboarding@resend.dev`).

### 4. Configure Environment Variables
Add these to your `.env` file:

```env
# Resend API Key (required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email sender address (required)
# For development, use: onboarding@resend.dev
# For production, use your verified domain: noreply@yourdomain.com
RESEND_FROM_EMAIL=onboarding@resend.dev

# Base URL for invitation links (required)
# For development: http://localhost:3000
# For production: https://yourdomain.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# App name (optional, used in email templates)
NEXT_PUBLIC_APP_NAME=Asana Replacement
```

## Features

### For Administrators
- **Send Invitations**: Go to `/invitations` (only visible to admins)
- **Invite by Email**: Enter email address and select role (USER or ADMIN)
- **View Invitations**: See all pending, expired, accepted, and cancelled invitations
- **Resend Invitations**: Resend invitation emails to pending invitations
- **Cancel Invitations**: Cancel pending invitations

### For Invited Users
- **Receive Email**: Invited users receive an email with an invitation link
- **Accept Invitation**: Click the link to create an account
- **Set Password**: Create a password during account creation
- **Automatic Role Assignment**: User is assigned the role specified in the invitation

## Invitation Flow

1. **Admin sends invitation**:
   - Admin goes to `/invitations`
   - Enters email address and selects role
   - Clicks "Send Invitation"
   - System creates invitation record and sends email

2. **User receives email**:
   - Email contains invitation link with unique token
   - Link expires in 7 days

3. **User accepts invitation**:
   - Clicks link in email
   - If user doesn't exist: Shows signup form
   - If user exists: Shows message to sign in
   - User creates account with name and password
   - Invitation is marked as accepted
   - User is redirected to login page

## Security Features

- **Unique Tokens**: Each invitation has a cryptographically secure random token
- **Expiration**: Invitations expire after 7 days
- **Status Tracking**: Invitations can be PENDING, ACCEPTED, EXPIRED, or CANCELLED
- **Email Validation**: Prevents duplicate invitations for the same email
- **Role-Based Access**: Only ADMIN users can send invitations

## Troubleshooting

### Emails Not Sending
1. Check that `RESEND_API_KEY` is set correctly in `.env`
2. Verify `RESEND_FROM_EMAIL` is valid
3. Check Resend dashboard for error logs
4. Make sure you're not exceeding Resend's rate limits

### Invitation Links Not Working
1. Verify `NEXT_PUBLIC_BASE_URL` is set correctly
2. Check that the token hasn't expired (7 days)
3. Ensure the invitation status is still PENDING

### User Already Exists Error
- If a user with the email already exists, they should sign in instead
- The invitation will show a message directing them to the login page

## Testing

### Test Invitation Flow
1. Make sure you have an ADMIN user (you can set this in the database)
2. Go to `/invitations`
3. Send a test invitation to your own email
4. Check your email for the invitation link
5. Click the link and create an account
6. Verify the invitation is marked as accepted

### Test Email Configuration
You can test email sending by checking the Resend dashboard for:
- Email delivery status
- Bounce/spam reports
- API usage statistics

## Next Steps

After setting up invitations, consider:
1. **Email Templates**: Customize the invitation email template in `lib/email.ts`
2. **Invitation Expiration**: Adjust expiration time (currently 7 days) in `app/invitations/actions.ts`
3. **Bulk Invitations**: Add ability to invite multiple users at once
4. **Invitation Reminders**: Send reminder emails for pending invitations

