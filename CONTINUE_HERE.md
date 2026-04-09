# Project4Cast - Next Session Plan

## Ask This Next Time

When you come back, just ask:

`What's next in CONTINUE_HERE.md?`

---

## Current Snapshot

- Core app is mostly complete (jobs, tasks, comments, attachments, notifications, invitations, auth).
- Main unfinished work is deployment hardening, security cleanup, and a few product TODOs.

---

## Priority Order

1. **Security hardening first**
2. **Deployment verification**
3. **Finish visible TODOs**
4. **Docs cleanup and organization**
5. **Nice-to-have UX/performance improvements**

---

## 1) Security Hardening (Top Priority)

- Lock down or remove `app/api/test/route.ts` (do not expose user data publicly).
- Restrict `/dev` and `/api/dev/*` routes to local/dev and/or admin-only access.
- Ensure cron endpoints require `CRON_SECRET` in production (fail closed if missing).
- Review repo for sensitive values and keep secrets in env vars only.

**Definition of done**
- No public route exposes sensitive user data.
- Dev/test routes are inaccessible in production to unauthenticated users.

---

## 2) Deployment Verification (Vercel)

- Confirm required env vars are set in Vercel project settings:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `BLOB_READ_WRITE_TOKEN`
  - `CRON_SECRET`
  - Optional email vars (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`)
- Redeploy and run smoke tests on production URL.

**Smoke test checklist**
- Login works
- Create/edit job works
- Create/edit task works
- Upload/download/delete attachment works
- Notifications load and mark-read works

---

## 3) Product TODOs

- Implement "Move job to brand/client" flow from `JobSidebar`.
- Decide whether attachments should support comment-level linking (`commentId`) and implement if needed.
- Confirm desired email-verification enforcement policy (warn only vs block access until verified).

---

## 4) Documentation Cleanup

- Replace default `README.md` with project-specific setup and architecture notes.
- Consolidate root-level troubleshooting docs into `docs/`.
- Keep one source-of-truth status file and archive outdated notes.

---

## 5) Optional Refinements

- Add pagination for large task/job lists.
- Add query/index review for highest-traffic pages.
- Standardize auth/routing rules to avoid drift between middleware and auth config.

---

## Quick Start Commands

```bash
npm run dev
npm run build
npm start
npx prisma migrate dev
npx prisma generate
```

---

## Next Session Workflow (10-15 min)

1. Ask: `What's next in CONTINUE_HERE.md?`
2. Pick one item from Priority 1 or 2.
3. Implement + test.
4. Update this file with completed items and next actions.





