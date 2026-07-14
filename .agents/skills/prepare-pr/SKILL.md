---
name: prepare-pr
description: Inspect the current Git branch against its remote base, review all committed and uncommitted changes, assess requirement completion and risks for the developer, run project validation, and draft a pull request body with a changed-files section from the repository PR template or bundled fallback. Use when the user asks to prepare, submit, publish, or push a pull request. Never commit or push until the user explicitly confirms the reviewed draft and proposed Git actions.
---

# Prepare Pull Request

Prepare a reviewable PR draft first. Treat committing, pushing, and opening a PR as separate state-changing actions that require explicit authorization.

## Workflow

1. Read repository instructions such as `AGENTS.md` and inspect Git status, current branch, upstream, remotes, and default branch. Preserve unrelated user changes.
2. Refresh remote refs with a non-destructive fetch when network access is available. If fetching fails, disclose that the review uses cached refs.
3. Select the comparison base in this order:
   - The base branch named by the user.
   - The remote default branch.
   - `origin/main`, then `origin/master`.
   - Ask the user only if the choice remains ambiguous.
4. Inspect the complete change set:
   - Committed branch changes: `git diff <base>...HEAD` and `git log <base>..HEAD`.
   - Staged, unstaged, and untracked work from `git status`, `git diff`, and `git diff --cached`.
   - Clearly distinguish changes already in commits from local-only changes that a push would not include.
5. Review the diff before drafting. Check correctness, security, regressions, API and schema compatibility, tests, documentation, and repository conventions. Report findings by severity with file and line references. Do not silently fix findings unless the user asks.
6. Infer the requested outcome only from available issues, task text, documentation, commits, and code. Map each requirement to evidence and mark it complete, partial, missing, or unverifiable. State assumptions instead of inventing requirements.
7. Run the repository-mandated validation commands. For this project, follow `AGENTS.md`, including type checking, formatting checks, tests, and build/docs build as applicable. Never apply formatting or other fixes without authorization when the request is only to review and prepare a PR.
8. Locate a PR template in `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE.md`, or `.github/PULL_REQUEST_TEMPLATE/`. Use the matching repository template when present; otherwise load `assets/pull-request-template.md`. Preserve mandatory headings and checklist items; omit template guidance comments from the final draft.
   - Keep requirement-completion analysis, risks, and review findings in the developer review package. Do not add them to the PR body unless the repository template explicitly requires them.
   - Populate the PR body's changed-files section from the final comparison scope. List each changed file with its Git status and a concise description; group generated files when a per-file list would be excessively long.
9. Present one review package containing:
   - Comparison base, branch, upstream, and fetched/cached-ref status.
   - Included commits and local-only changes.
   - Review findings and requirement-completion assessment.
   - Validation commands and results.
   - Proposed PR title and complete PR body in a Markdown block.
   - Confirm that the PR body includes the reviewed changed-file list and excludes internal requirement and risk analysis unless required by the repository template.
   - Exact proposed next actions: files to stage, commit message if a commit is needed, push destination, and whether PR creation is included.
10. Stop and request explicit confirmation. Do not interpret an earlier general request to “submit a PR” as confirmation of the generated draft or Git mutations.
11. After confirmation, perform only the approved actions:

- Stage only reviewed files.
- Before committing, show the staged diff summary and obtain any confirmation required by repository instructions.
- Commit only with an approved message.
- Push with an explicit refspec such as `git push -u origin HEAD:<branch>`; never force-push unless separately requested and confirmed.
- Open the PR only when the user explicitly authorized PR creation and the destination base/head are unambiguous.

12. Report the resulting branch, commit, push result, and PR URL when created. If the remote changed after review, stop and re-review rather than forcing the push.

## Guardrails

- Never expose secrets from diffs, environment files, credentials, or command output. Flag suspected secrets and stop before publishing them.
- Never include untracked or unrelated files merely because they exist.
- Never claim a requirement or validation passed without evidence.
- Never bypass hooks, rewrite history, delete branches, or force-push as part of this workflow.
- If the current branch is the base/default branch, recommend creating a feature branch and wait for confirmation before doing so.
