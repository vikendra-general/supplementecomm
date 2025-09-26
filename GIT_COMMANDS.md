# Git Commands Reference

This document contains all the Git commands discussed for managing this repository.

## 1. Update Repository from Main Remote

### Basic Update
```bash
# Pull latest changes from main branch
git pull origin main
```

### Complete Update Process
```bash
# Check current branch
git branch

# Switch to main branch (if not already on it)
git checkout main

# Fetch latest changes from remote
git fetch origin

# Pull and merge changes
git pull origin main
```

### Alternative - Fetch and Merge Separately
```bash
# Fetch all remote changes
git fetch origin

# Merge main branch
git merge origin/main
```

### If You Have Local Changes
```bash
# Stash your changes first
git stash

# Pull updates
git pull origin main

# Restore your changes
git stash pop
```

## 2. Delete Git Branches

### Delete Local Branch
```bash
# Delete a local branch (safe - prevents deletion if unmerged)
git branch -d branch-name

# Force delete a local branch (use with caution)
git branch -D branch-name
```

### Delete Remote Branch
```bash
# Delete a remote branch
git push origin --delete branch-name

# Alternative syntax for deleting remote branch
git push origin :branch-name
```

### Complete Cleanup Process
```bash
# 1. Switch to main/master branch first
git checkout main

# 2. Delete local branch
git branch -d feature-branch

# 3. Delete remote branch
git push origin --delete feature-branch

# 4. Clean up remote tracking references
git remote prune origin
```

## 3. Change/Switch Git Branches

### Switch to Existing Branch
```bash
# Switch to an existing branch
git checkout branch-name

# Modern Git syntax (Git 2.23+)
git switch branch-name
```

### Create and Switch to New Branch
```bash
# Create and switch to new branch in one command
git checkout -b new-branch-name

# Modern Git syntax
git switch -c new-branch-name
```

### Switch to Remote Branch
```bash
# Create local branch tracking remote branch
git checkout -b local-branch-name origin/remote-branch-name

# Simplified if local and remote names match
git checkout remote-branch-name
```

### Switch to Previous Branch
```bash
# Switch back to previous branch
git checkout -
```

## 4. Handle Merge Conflicts

### Resolve Merge Conflicts
```bash
# Check current status
git status

# After resolving conflicts in each file, add them:
git add conflicted-file.txt

# Complete the merge
git commit -m "Resolve merge conflicts"
```

### Abort Current Merge
```bash
# Abort the current merge and return to previous state
git merge --abort
```

## 5. Handle Uncommitted Changes

### Commit Your Changes
```bash
# Check what files have been modified
git status

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Your commit message"
```

### Stash Your Changes
```bash
# Stash changes temporarily
git stash push -m "Work in progress description"

# Later, restore your changes with:
git stash pop

# List all stashes
git stash list
```

## 6. Force Update from Remote (⚠️ Destructive)

### Hard Reset (Most Common)
```bash
# First, switch to main branch (if not already)
git checkout main

# Fetch latest changes from remote
git fetch origin

# Force reset local main to match remote main
git reset --hard origin/main
```

### Complete Fresh Start
```bash
# Fetch all remote changes
git fetch origin

# Force checkout main branch from remote
git checkout -B main origin/main
```

### Clean Everything
```bash
# Remove all untracked files and directories
git clean -fd

# Reset to remote main
git fetch origin
git reset --hard origin/main
```

## 7. Useful Information Commands

### List Branches
```bash
# List all local branches
git branch

# List all remote branches
git branch -r

# List all branches (local and remote)
git branch -a
```

### Check Status and Changes
```bash
# Show current branch and status
git status

# Show current branch name only
git branch --show-current

# See the actual changes
git diff

# See staged changes
git diff --cached
```

### View Commit History
```bash
# Show recent commits
git log --oneline -5

# Show commit history with graph
git log --graph --oneline
```

## ⚠️ Important Safety Tips

1. **Always check your status before major operations:** `git status`
2. **Backup important work before force operations**
3. **Use `-d` flag for safe branch deletion, `-D` for force deletion**
4. **Commit or stash changes before switching branches**
5. **Be careful with `--hard` reset - it permanently deletes changes**
6. **Test commands on non-critical branches first**

## Common Workflows

### Daily Development Workflow
```bash
# Start of day - update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/new-feature

# Work on changes...
# Add and commit changes
git add .
git commit -m "Implement new feature"

# Push feature branch
git push origin feature/new-feature
```

### Emergency Reset Workflow
```bash
# If everything is broken and you need fresh code
git fetch origin
git reset --hard origin/main
git clean -fd
```

This document covers all the Git commands discussed for managing this BBN Nutrition e-commerce project repository.