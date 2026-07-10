# Agent Field Notes

## Meta Note

This is the primary agent knowledge base file.

- `CLAUDE.md` and `GEMINI.md` are symlinks to this file—always edit `AGENTS.md` directly.
- When learning something new about the codebase that would help with future tasks, update this file immediately.

---

## Language

- The primary language used in this codebase is **TypeScript**.
- Version: **v7.0.2**.

---

## Hazardous Operations

The following operations must always be confirmed before execution:

- Deleting files
- Large-scale refactoring
- Modifying Git history
- `git commit`
- `git push`
- Changing environment configuration
- Changing CI
- Database changes

---

## Prohibited Matters

Unless explicitly stated by the user, it is prohibited to call skills related to `superpower`.

---

## Progressive Disclosure

Follow the principle of progressive disclosure when working with project instructions and documentation.

- Avoid loading or maintaining unnecessary context.
- Only introduce additional rules, details, or documentation when they are relevant to the current task.
- If you discover global principles, conventions, or rules that need to be followed frequently across the project, update the `AGENTS.md` file to record them.
- Keep `AGENTS.md` focused on reusable project-level knowledge rather than task-specific instructions.

---

## Database Operations

- For D1 database operations, prioritize using the local database for development.
- All table migration files must be generated using `drizzle-kit`.
  - Store migration files in `drizzle/migrations`.
  - Configure the database connection in `drizzle.config.ts`.
- Use the following command to apply migrations to the D1 database:

  ```bash
  wrangler d1 migrations apply
  ```

- Define all table schemas in `src/db/schema.ts`.
- Centralize all CRUD operations in `src/db/queries.ts`.
- Organize query methods by resource in static classes (for example, `UserQueries` and `TodoQueries`).
- Every query method must include Chinese JSDoc describing:
  - Purpose
  - Parameters
  - Return value

---

## API Points

- Declare all API endpoints centrally in `src/index.ts`.
- Use:
  - `GET` for query operations.
  - `POST` for write operations.
- Refer to `docs/openapi.json` for the current list of API endpoints.

---

## Tech Stack

The primary tech stack used in this codebase is:

- Cloudflare Workers
- TypeScript
- Hono
- Drizzle ORM

### References

- **Web Framework**
  - Hono
  - https://hono.dev/llms.txt

- **Cloudflare Workers**
  - Read `./docs/.agents/cloudflare-workers.md` for APIs, limits, and best practices.

- **Database**
  - D1 (SQLite)
  - KV (Key-Value Store)
  - Read `./docs/.agents/cloudflare-workers.md` for D1 and KV APIs, limits, and best practices.

- **ORM**
  - Drizzle ORM
  - https://orm.drizzle.team/llms-full.txt

---

## Development Verification

After completing any development task:

1. Review the Git staging area.
   - Verify that only expected changes are included.
   - Ensure no unintended modifications are present.

2. Perform the complete validation process:
   1. Run type checking to ensure there are no type errors.
   2. Run code formatting checks and apply formatting if required.
   3. Run the relevant test suite to verify functionality.
   4. Run the project build process to ensure the application can be successfully compiled.

3. If any validation step fails:
   - Investigate the issue.
   - Resolve the issue.
   - Do not report the task as completed until all validation steps pass.
