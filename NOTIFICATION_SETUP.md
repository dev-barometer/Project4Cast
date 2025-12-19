# Notification System Setup

## What's Been Implemented

The notification system is now fully implemented with the following features:

### ✅ Features

1. **Task Assignment Notifications**
   - In-app notification when assigned to a task
   - Email notification when assigned to a task
   - Works for both job-associated and standalone tasks

2. **Job Assignment Notifications**
   - In-app notification when added as a collaborator to a job
   - Email notification when added to a job

3. **Task Completion Notifications**
   - In-app notification to job admins when a task is completed
   - Shows who completed the task

4. **@Mention Notifications**
   - In-app notification when mentioned in a comment using @username or @email
   - Parses mentions from comment text
   - Matches users by email or name

5. **Notification Center**
   - `/notifications` page showing all notifications
   - Unread/read status
   - Click to navigate to related task/job
   - "Mark all as read" button
   - Time ago formatting

6. **Notification Badge**
   - Badge in header showing unread count
   - Auto-updates every 30 seconds
   - Links to notification center

## What You Need to Do

### Step 1: Fix Database Connection

The migration failed because of a database connection issue. You need to:

1. **Check your `.env` file** - Make sure `DATABASE_URL` is correct
2. **Verify database credentials** - Ensure your database is accessible
3. **Test connection** - Try running: `npx prisma db pull` to test the connection

### Step 2: Run the Migration

Once your database connection is working, run:

```bash
npx prisma migrate dev --name add_notifications
```

This will:
- Create the `Notification` table in your database
- Add the `NotificationType` enum
- Set up all the relationships

### Step 3: Regenerate Prisma Client

After the migration succeeds, regenerate the Prisma client:

```bash
npx prisma generate
```

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

## How It Works

### Notification Types

- `TASK_ASSIGNED` - When you're assigned to a task
- `JOB_ASSIGNED` - When you're added to a job
- `TASK_COMPLETED` - When a task in your job is completed
- `COMMENT_MENTION` - When someone mentions you in a comment

### Email Notifications

Email notifications are sent for:
- Task assignments
- Job assignments

Email notifications are **NOT** sent for:
- Task completions (in-app only)
- Comment mentions (in-app only)

### @Mention Parsing

When someone writes a comment like:
- `@barclay can you review this?`
- `@chris@example.com what do you think?`

The system will:
1. Parse the @mentions
2. Find users by email or name (case-insensitive)
3. Create notifications for each mentioned user
4. Exclude the comment author from notifications

## Testing

Once everything is set up, you can test:

1. **Task Assignment**: Assign someone to a task - they should get an email and in-app notification
2. **Job Assignment**: Add someone as a collaborator - they should get an email and in-app notification
3. **Task Completion**: Mark a task as done - admins on that job should get a notification
4. **@Mentions**: Write a comment with `@username` - that user should get a notification
5. **Notification Center**: Click "Notifications" in the header to see all notifications
6. **Mark as Read**: Click on a notification or use "Mark all as read"

## Troubleshooting

### "Property 'notification' does not exist on PrismaClient"

This means the Prisma client hasn't been regenerated. Run:
```bash
npx prisma generate
```

### Database connection errors

Check your `DATABASE_URL` in `.env` and ensure your database is accessible.

### Emails not sending

Check your `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in `.env`. Make sure your Resend domain is verified.

### Notifications not appearing

1. Check the browser console for errors
2. Verify the migration ran successfully
3. Check that notifications are being created in the database
4. Ensure you're logged in as the correct user

## Files Created/Modified

### New Files
- `app/notifications/actions.ts` - Server actions for notifications
- `app/notifications/page.tsx` - Notification center page
- `app/notifications/MarkAllReadButton.tsx` - Mark all as read button
- `app/components/NotificationBadge.tsx` - Header badge component
- `app/api/notifications/count/route.ts` - API route for notification count
- `lib/notifications.ts` - Notification utility functions

### Modified Files
- `prisma/schema.prisma` - Added Notification model
- `lib/email.ts` - Added email functions for assignments
- `app/tasks/actions.ts` - Added notification triggers
- `app/jobs/[id]/actions.ts` - Added notification triggers
- `app/jobs/[id]/page.tsx` - Added notification triggers
- `app/components/Header.tsx` - Added notification badge
- `app/layout.tsx` - Added notification count fetching

## Next Steps

After the migration runs successfully, the notification system will be fully functional!








