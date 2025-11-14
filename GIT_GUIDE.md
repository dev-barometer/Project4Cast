# Git Basics Guide

## What is Git?

Git is a version control system that acts like a "time machine" for your code. Every time you make a commit, Git saves a snapshot of your entire project at that moment. This lets you:

- **Go back in time** if something breaks
- **See what changed** between versions
- **Work on features safely** knowing you can always undo
- **Collaborate** with others without overwriting each other's work

## What We Just Did

We created your **first commit** (like taking a snapshot). This commit saved the current state of your project:
- All your code files
- The database schema
- Configuration files
- Everything except files in `.gitignore` (like `node_modules` and `.env`)

**Commit ID:** `09e25e4`  
**Message:** "Initial commit: Asana replacement app with jobs, tasks, comments, and collaborators"

## Basic Git Commands

### 1. Check Status
See what files have changed:
```bash
git status
```

### 2. See What Changed
View the differences in your files:
```bash
git diff
```

### 3. Stage Changes
Tell Git which files to include in the next commit:
```bash
git add .              # Add all changed files
git add filename.ts    # Add a specific file
```

### 4. Commit Changes
Save a snapshot with a message:
```bash
git commit -m "Description of what you changed"
```

### 5. View History
See all your commits:
```bash
git log --oneline      # Short list
git log                # Detailed list
```

## Rolling Back (Undoing Changes)

### If You Made Changes But Haven't Committed Yet

**Discard changes to a specific file:**
```bash
git checkout -- filename.ts
```

**Discard ALL uncommitted changes:**
```bash
git reset --hard
```
⚠️ **Warning:** This permanently deletes all uncommitted changes!

### If You Already Committed

**Go back to a previous commit:**
```bash
# First, find the commit ID you want to go back to
git log --oneline

# Then go back to that commit (keeps changes as uncommitted)
git reset --soft 09e25e4

# Or go back and discard all changes since then
git reset --hard 09e25e4
```

**Undo the last commit but keep the changes:**
```bash
git reset --soft HEAD~1
```

**Undo the last commit and discard changes:**
```bash
git reset --hard HEAD~1
```

### See What a Previous Version Looked Like

**View a file from a previous commit:**
```bash
git show 09e25e4:app/page.tsx
```

**Compare current version with a previous commit:**
```bash
git diff 09e25e4 app/page.tsx
```

## When to Commit

**Good times to commit:**
- ✅ After completing a feature (e.g., "Add task comments")
- ✅ After fixing a bug
- ✅ Before making big changes (as a safety point)
- ✅ At the end of a work session

**Good commit messages:**
- ✅ "Add task comments functionality"
- ✅ "Fix comment form clearing bug"
- ✅ "Update UI to lighter theme"
- ❌ "stuff" or "fix" (too vague)

## Workflow Example

1. **Make changes** to your code
2. **Test it** to make sure it works
3. **Check status:** `git status`
4. **Stage changes:** `git add .`
5. **Commit:** `git commit -m "Add task comments"`
6. **Continue working** on the next feature

## Current State

You're now on commit `09e25e4` which represents a working state with:
- Job management
- Task management with checkboxes
- Task comments
- Job collaborators
- Light UI theme

If anything breaks in the future, you can always come back to this commit!

## Need Help?

- **See what changed:** `git diff`
- **See commit history:** `git log --oneline`
- **Go back to this commit:** `git reset --hard 09e25e4`
- **See this commit's details:** `git show 09e25e4`

## Next Steps (Optional)

### Remote Repository (GitHub/GitLab)
If you want to back up your code online:
1. Create a repository on GitHub
2. Connect it: `git remote add origin https://github.com/yourusername/repo.git`
3. Push your code: `git push -u origin master`

### Branches (For Later)
Branches let you work on features separately:
- Create a branch: `git checkout -b feature-name`
- Switch branches: `git checkout branch-name`
- Merge branches: `git merge branch-name`

But for now, working on `master` is perfectly fine!

