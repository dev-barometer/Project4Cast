---
title: Project4Cast — Workspaces Technical Requirements
status: draft
barclay-approved: pending
date: 2026-06-10
---

# Project4Cast — Workspaces Technical Requirements & Implementation Plan

Stack reminder: Next.js 14 App Router, Prisma + Supabase Postgres, NextAuth v5 (JWT),
Vercel. Build is strict — `npm run build` must pass before any commit.

---

## Phase 0 — Band-aid (DONE, awaiting review)

**Root cause:** The "add collaborator" picker was fed by a query that returns only users
*already on the job* (`prisma.user.findMany({ where: { jobs: { some: { jobId } } } })` in
`app/jobs/[id]/page.tsx`). `CollaboratorManager` then filters *out* everyone already on the
job — so the list was empty by construction. Nobody could ever be added. Not a permissions limit.

**Fix:** Added a separate `assignableUsers` query (`where: { isPaused: false }`) threaded only
to the collaborator picker:
`page.tsx → JobDetailView → JobDetailsSection → CollaboratorManager`.
Task-assignee pickers still source from job-members-only (`allUsers`), so that behaviour is
unchanged. Files touched: `app/jobs/[id]/page.tsx`, `JobDetailView.tsx`,
`components/JobDetailsSection.tsx`. Build passes.

**Effect:** Chris (admin) and Barclay can now add each other and freelancers to any job, then
assign tasks. Because every job today is Ideate, no isolation is lost in the interim.

---

## The overhaul — data model

### New model
```prisma
model Workspace {
  id        String          @id @default(cuid())
  name      String
  slug      String          @unique
  createdAt DateTime        @default(now())
  members   WorkspaceMember[]
  clients   Client[]
}

enum WorkspaceRole { OWNER ADMIN MEMBER VIEWER }

model WorkspaceMember {
  id          String        @id @default(cuid())
  workspaceId String
  userId      String
  role        WorkspaceRole @default(MEMBER)
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, userId])
  @@index([userId])
  @@index([workspaceId])
}
```

### Changes to existing models
- `Client` gets `workspaceId` (required) → workspace owns the Client→Brand→Job tree.
  Visibility is derived through Client; Jobs inherit workspace via their Brand→Client.
  (Alternative: also denormalize `workspaceId` onto `Job` for cheaper queries — recommended,
  see "Query strategy".)
- `Invitation` gets `workspaceId` + `workspaceRole` so invites land in the right workspace.
- The dormant `Team` / `UserTeam` / `Job.teamId` models are **superseded** by Workspace.
  Decision: drop them in the same migration (they're unused) rather than carry two concepts.
- `User.role` (global) is kept but demoted to "system superuser" only — not used for
  job/workspace visibility.

### Recommended denormalization
Add `workspaceId` directly to `Job` (and keep it in sync on create/move). Reason: nearly every
visibility query is "jobs in workspace W that I can see." Filtering through `brand.client.workspaceId`
on every query is a 3-table join on the hottest path. A denormalized `Job.workspaceId` makes the
sidebar/search/job-list queries a single indexed filter.

---

## Auth & session

- Add `activeWorkspaceId` to the JWT/session. Set on login (default = first membership) and
  updated by the workspace switcher.
- New helper `lib/workspace.ts`:
  - `getActiveWorkspace(session)` → resolves + validates membership.
  - `requireWorkspaceMember(workspaceId, userId, minRole?)` → throws/returns 403.
  - `getUserWorkspaces(userId)` → for the switcher.
- Every server action and page that reads jobs/tasks/users **must** scope by active workspace
  and verify membership. This is the security boundary — no query trusts a client-supplied id
  without a membership check.

---

## Query strategy (replace the `isAdmin ? all : collaborator` pattern)

Today's pattern in `app/page.tsx` and `app/jobs/[id]/page.tsx`:
```
if (isAdmin) -> all jobs
else         -> jobs where I'm a collaborator
```
Becomes:
```
jobs where job.workspaceId == activeWorkspaceId
  AND ( I am workspace ADMIN/OWNER   -> all jobs in workspace
        OR I am a collaborator on the job )  // MEMBER/VIEWER see only their jobs
```
User pickers (`assignableUsers`, task assignees): `WorkspaceMember` of the active workspace,
not global `User.findMany`. This closes the leak where pickers could surface unrelated people.

---

## UI work
1. **Workspace switcher** in `app/components/Header.tsx` — dropdown of the user's workspaces;
   selecting one writes `activeWorkspaceId` and revalidates.
2. **Onboarding/migration screen** is not needed; seed script handles existing data (below).
3. Sidebar, search, my-tasks, notifications, admin pages — all filtered by active workspace.
4. **Admin → workspace members** page: manage who's in a workspace and their workspace role
   (replaces / extends `app/admin/collaborators`).

---

## Migration / data backfill
1. Create `Workspace` + `WorkspaceMember` tables (Prisma migration).
2. Add `workspaceId` to `Client`, `Job`, `Invitation` (nullable first).
3. Seed script:
   - Create workspace **Ideate**. Make Barclay OWNER, Chris ADMIN.
   - Assign every existing Client (and its Jobs) to Ideate (all current data is Ideate).
   - Backfill `Job.workspaceId`.
4. Make `workspaceId` required; drop `Team`/`UserTeam`/`Job.teamId`.
5. Create **Barometer** and **Personal** workspaces (Barclay OWNER, empty).

Run against a Supabase branch first, verify, then merge. Never point a backfill at prod
without a branch dry-run.

---

## Rollout order (each step builds + deploys green)
1. Schema + migration + seed (no UI change yet; everything defaults to Ideate).
2. `lib/workspace.ts` + session `activeWorkspaceId` (default behaviour unchanged — one workspace).
3. Repoint all visibility queries to workspace scope.
4. Workspace switcher UI.
5. Workspace members admin page; scope invitations.
6. Remove legacy global-admin "see everything" branch.

---

## Risks / watch-items
- **Strict Vercel build** — type every new query result; no global find-replace fixes
  (per project CLAUDE.md history).
- **JWT staleness** — `activeWorkspaceId` lives in the token; switching must re-issue/refresh
  so server components see the new scope.
- **The 403 boundary** must be enforced server-side on direct job-URL access, not just hidden in UI.
- **Finances** — confirm per workspace: Barclay said Chris sees Ideate finances. Keep finance
  fields gated on workspace ADMIN/OWNER so a freelancer MEMBER never sees money.

---

## Effort estimate
- Phase 0 band-aid: done.
- Schema + migration + seed: ~half a day.
- Query repointing + lib/workspace + session: ~1 day.
- Switcher + members admin UI: ~1 day.
- Total overhaul: roughly one focused weekend, matching Barclay's "rainy Saturday" framing.
