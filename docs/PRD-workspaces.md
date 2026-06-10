---
title: Project4Cast — Workspaces Product Requirements
status: draft
barclay-approved: pending
date: 2026-06-10
---

# Project4Cast — Workspaces (Multi-Context) PRD

## The problem in one sentence
P4C has exactly two visibility levels — admins see everything, everyone else sees only
jobs they're a collaborator on — so the only way to stop Chris seeing Barometer/personal
work is to demote him out of admin, which also strips his ability to run Ideate.

## What Barclay actually wants
Run **all** of his work (Ideate, Barometer, personal/Studio, future freelance jobs) inside
**one** P4C, while keeping the contexts walled off from each other.

- **Ideate** — shared with Chris. Chris is a full admin *of Ideate*: create/run jobs,
  assign people, invite freelancers, see finances. He cannot see anything outside Ideate.
- **Barometer / Personal / future contexts** — Barclay only. Chris must not know they exist.
- **Freelancers** — brought in per-context. A freelancer hired for "X" never sees Ideate,
  and Chris never sees that freelancer or their work.
- **Screen-sharing** — when Barclay shares his screen with Chris, only Ideate is visible.
  Mechanism: a workspace switcher; Barclay sets active workspace to Ideate and nothing else shows.

## The model: Workspaces
Introduce a **Workspace** as the top-level container. Everything (clients, brands, jobs,
members) lives inside exactly one workspace.

```
WORKSPACE: Ideate
  ├─ Members: Barclay (owner), Chris (admin), freelancers (member/viewer)
  └─ Clients → Brands → Jobs → Tasks
WORKSPACE: Barometer
  ├─ Members: Barclay (owner)
  └─ Clients → Brands → Jobs → Tasks
WORKSPACE: Personal
  └─ ...
```

A user only ever sees workspaces they're a member of. There is no global admin that
transcends workspaces (Barclay is owner of each of his; that's how he sees all his own work).

## Roles (two layers — keep both)
1. **Workspace role** — `OWNER` / `ADMIN` / `MEMBER` / `VIEWER`, scoped to one workspace.
   - Barclay = OWNER of every workspace he creates.
   - Chris = ADMIN of Ideate only.
   - A freelancer = MEMBER or VIEWER of one workspace.
2. **Per-job role** — the existing `JobCollaborator` (`OWNER`/`COLLABORATOR`/`VIEWER`) stays,
   for fine-grained "who's actually on this job" inside a workspace.

The current **global** `UserRole` (OWNER/ADMIN/USER) is retired for visibility purposes —
it only governs true system-level superuser actions (e.g. Barclay managing the whole app).

## Behaviours
- **Workspace switcher** in the header. Active workspace scopes the entire UI: sidebar job
  list, search, user pickers, finances, notifications.
- **Add-collaborator / assignee pickers** list only members of the active workspace.
- **Finances** visible to workspace OWNER/ADMIN (so Chris sees Ideate money — per Barclay's call).
- **Invitations** are scoped: inviting someone adds them to the *active* workspace only.
- **No cross-workspace leakage** anywhere — a job's URL is 403 if you're not a member of its workspace.

## Out of scope (for now)
- Billing/subscription per workspace.
- Cross-workspace reporting/rollups.
- Per-workspace branding/theming.

## Acceptance criteria
1. Chris logs in and sees only Ideate. No other workspace is visible or discoverable.
2. Chris can create a job, assign Barclay and a freelancer, invite a new freelancer by email,
   and see Ideate finances.
3. Barclay switches to Barometer and Chris-related people/jobs vanish from every surface.
4. A freelancer in Ideate cannot see Barometer; a freelancer in another workspace cannot see Ideate.
5. Direct-navigating to an out-of-workspace job URL returns access denied.

## Today's band-aid (already shipped for review)
The assign-to-job bug is fixed independently of this overhaul. See `TRD-workspaces.md` →
"Phase 0" for what changed and why it was a data-sourcing bug, not a permissions limit.
