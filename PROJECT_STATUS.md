# Asana Replacement – Project Status

## Current Progress ✅
- Database schema complete (Users, Clients, Brands, Jobs, Tasks, Comments, Attachments)
- Seed route works (/api/dev/seed)
- Dev dashboard working (/dev)
- Jobs list working (/jobs)
- Job detail page working (/jobs/[id])
- **Task editing** (status checkbox, priority, title, due date) ✅
- **Task assignees** (add/remove people to tasks) ✅
- **Job collaborators** (add/remove people to jobs with roles) ✅
- **Global Tasks page** (/tasks - shows all tasks) ✅
- **Create new job form** (/jobs/new) ✅
- **UI improvements** (lighter colors, cleaner layout) ✅
- **Due dates moved to tasks** (removed from jobs) ✅
- **Task comments** - Add notes/discussions to tasks ✅
- **File uploads** - Upload PDF, DOCX, PNG, PPTX to jobs and tasks ✅
  - Using Cloudinary for cloud storage
  - Files stored in cloud with organized folder structure
  - Upload, view, and delete attachments for jobs and tasks
  - File type validation (PDF, DOCX, PNG, PPTX)
  - 10MB file size limit

## Version Control
- Git repository initialized
- Initial commit: `09e25e4` (Nov 14, 2025)
- See `GIT_GUIDE.md` for Git basics and rollback instructions

## Next Feature Options
1. **Authentication** - User login system (needed for "My Tasks")
2. **"My Tasks" dashboard** - View all tasks assigned to logged-in user
3. **Notifications** - Email/UI alerts when tasks are completed
4. **User invitations** - Invite users by email
5. **Edit job brief** - Make the brief field editable
