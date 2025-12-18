import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete in order to respect foreign key constraints
    
    // 1. Delete all comments (references Job, Task, User)
    const deletedComments = await prisma.comment.deleteMany({});
    
    // 2. Delete all attachments (references Job, Task, User)
    const deletedAttachments = await prisma.attachment.deleteMany({});
    
    // 3. Delete all task assignees (references Task, User)
    const deletedTaskAssignees = await prisma.taskAssignee.deleteMany({});
    
    // 4. Delete all tasks (references Job)
    const deletedTasks = await prisma.task.deleteMany({});
    
    // 5. Delete all job collaborators (references Job, User)
    const deletedJobCollaborators = await prisma.jobCollaborator.deleteMany({});
    
    // 6. Delete all jobs (references Brand)
    const deletedJobs = await prisma.job.deleteMany({});
    
    // 7. Delete all brands (references Client)
    const deletedBrands = await prisma.brand.deleteMany({});
    
    // 8. Delete all clients
    const deletedClients = await prisma.client.deleteMany({});
    
    // 9. Delete all notifications (if they exist)
    const deletedNotifications = await prisma.notification.deleteMany({}).catch(() => ({ count: 0 }));
    
    // 10. Delete all invitations (references User)
    const deletedInvitations = await prisma.invitation.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: 'Database cleaned successfully',
      deleted: {
        comments: deletedComments.count,
        attachments: deletedAttachments.count,
        taskAssignees: deletedTaskAssignees.count,
        tasks: deletedTasks.count,
        jobCollaborators: deletedJobCollaborators.count,
        jobs: deletedJobs.count,
        brands: deletedBrands.count,
        clients: deletedClients.count,
        notifications: deletedNotifications.count || 0,
        invitations: deletedInvitations.count,
      },
    });
  } catch (error: any) {
    console.error('Error cleaning database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to clean database',
      },
      { status: 500 }
    );
  }
}
