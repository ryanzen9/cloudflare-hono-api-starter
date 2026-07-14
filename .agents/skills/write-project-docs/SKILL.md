---
name: write-project-docs
description: Analyze repository context and a user-selected scope, then create or update accurate project documentation grounded in the implementation. Use when the user asks to document a topic, feature, architecture, design, API, workflow, directory, specific files, Git staged changes, a branch diff, or another repository range, including documentation that needs concepts, design rationale, code examples, file structure, or technical analysis.
---

# Write Project Documentation

Create documentation that describes the repository as it actually exists. Treat source code, configuration, tests, schemas, and repository instructions as evidence; do not fill gaps with plausible but unverified claims.

## Workflow

1. Read the applicable repository instructions, especially `AGENTS.md`, and preserve unrelated user changes.
2. Resolve the requested scope before analyzing content:
   - For explicit files or directories, inspect those paths and the smallest set of imports, callers, tests, schemas, and configuration needed to explain them.
   - For the Git staging area, inspect `git diff --cached --name-status`, `git diff --cached`, and relevant surrounding code. Document staged behavior only; distinguish related unstaged changes if they affect accuracy.
   - For a branch, commit, or comparison range, inspect the requested diff and the current versions of affected files.
   - For a topic without a file range, locate relevant files with repository search, then narrow the investigation to the implementation and its direct dependencies.
   - If neither the subject nor the target document can be inferred safely, ask one focused question. Otherwise proceed with the narrowest reasonable interpretation and state it.
3. Discover existing documentation and conventions before writing. Check relevant README files, `docs/`, documentation-site configuration, templates, generated API specifications, and neighboring pages. Match their language, terminology, heading hierarchy, front matter, links, and navigation model.
4. Build an evidence map for the subject:
   - Identify entry points, public interfaces, core modules, data models, configuration, runtime dependencies, tests, and failure paths.
   - Trace important control flow and data flow across files.
   - Record exact file paths and symbol names supporting each important statement.
   - Prefer current implementation and configuration over stale prose. Use tests to confirm expected behavior. Treat generated documentation as derived output unless repository instructions declare it authoritative.
5. Decide whether to create or update documentation:
   - Use the path named by the user when supplied.
   - Otherwise update the existing canonical page for the subject when one exists.
   - Create a new page in the repository's established documentation location only when no canonical page exists. Avoid duplicate pages.
6. Plan the document around the reader's task. Include only relevant sections from the content guidance below.
7. Write or modify the document. Keep every factual claim traceable to inspected project evidence.
8. Verify the result against the implementation and repository conventions, then review the final diff.

## Content Guidance

Select sections according to the topic rather than forcing a fixed template:

- Purpose, audience, and scope.
- Concepts and terminology used by the project.
- Architecture or design overview, including component responsibilities and boundaries.
- Request, control, or data flow when it materially improves understanding.
- File structure with concise explanations of relevant files and directories.
- Public APIs, schemas, bindings, configuration, and runtime behavior.
- Error handling, constraints, tradeoffs, and known limitations supported by evidence.
- Code examples that demonstrate the current implementation.
- Testing and verification instructions using repository-approved commands.
- Extension or maintenance guidance when the implementation exposes a clear pattern.

Explain why a design exists only when rationale is documented or can be directly inferred from code constraints. Label inferences explicitly. Separate current behavior from proposals, future work, and hypothetical alternatives.

## Code and Structure Examples

- Copy or minimally simplify examples from current source code. Keep imports, names, paths, options, and return shapes accurate.
- Never invent APIs, environment variables, commands, configuration keys, database fields, or file paths.
- Mark non-runnable fragments as illustrative or pseudocode.
- Keep examples focused; link to the source file instead of duplicating large implementations.
- Use a compact directory tree only for files relevant to the documented subject.
- Add tables or Mermaid diagrams only when they make multi-component relationships or flows materially clearer.
- Never expose secrets, credentials, private environment values, or sensitive data encountered during analysis.

## Editing Rules

- Preserve correct existing content and the author's established voice when updating a page.
- Correct stale statements that fall within the requested scope. Do not silently broaden into a general documentation rewrite.
- Preserve valid front matter and documentation-site metadata. Update navigation or sidebars only when the new page must be discoverable and repository conventions require it.
- Use relative links that work from the documentation page unless the repository specifies another link style.
- Do not edit implementation code, generated files, environment configuration, or CI unless the user explicitly includes those changes.
- Do not publish agent-only notes or internal instruction files as human-facing documentation.

## Verification

Before reporting completion:

1. Re-read every technical claim, example, command, path, and symbol against the inspected files.
2. Confirm referenced local files and internal links exist, and check anchors when practical.
3. Confirm examples match current types, API methods, status codes, response shapes, bindings, and package-manager conventions.
4. Run documentation lint, formatting checks, link checks, or site builds when available and relevant. Follow all repository-mandated validation steps for documentation changes.
5. Inspect Git status and the documentation diff. Ensure only intended files changed and disclose pre-existing or unrelated changes.
6. Summarize created or updated documentation, its evidence scope, and validation results. State any unresolved uncertainty instead of presenting it as fact.

## Guardrails

- Never claim to have inspected, executed, or validated something without evidence.
- Never describe staged or diff-scoped changes as deployed or already released.
- Never use external documentation as a substitute for the repository's actual implementation. Consult external primary sources only when needed to explain a dependency or standard, and distinguish them from project behavior.
- Stop and request direction when conflicting sources would materially change the document and the authoritative source cannot be determined from repository instructions.
