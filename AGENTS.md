# Agent Field Notes

**Meta note**: This is the primary agent knowledge base file. `CLAUDE.md` and `GEMINI.md` are symlinks to this file—always edit `AGENTS.md` directly. When learning something new about the codebase that would help with future tasks, update this file immediately.

**Language**: The primary language used in this codebase is TypeScript, Version is v7.0.2.

**Hazardous Operation**: The following operations must still be confirmed: deleting files, large-scale refactoring, modifying git history, git commit, git push, changing environment configuration, changing CI, and database changes.

**Prohibited Matters**: Unless explicitly stated by the user, it is prohibited to call skills related to `superpower`.

**Progressive Disclosure** - Follow the principle of progressive disclosure when working with project instructions and documentation. - Avoid loading or maintaining unnecessary context. Only introduce additional rules, details, or documentation when they are relevant to the current task. - If you discover global principles, conventions, or rules that need to be followed frequently across the project, update the `AGENTS.md` file to record them. - Keep `AGENTS.md` focused on reusable project-level knowledge rather than task-specific instructions.

**Database Operations** - For D1 database operations, prioritize using the local database for development. - All table migration files must be generated using `drizzle-kit`, stored in the `drizzle/migrations` directory, and the database connection must - properly configured in `drizzle.config.ts`. - Use the `wrangler d1 migrations apply` command to apply migrations to the D1 database. - All table schemas must be defined in the `src/db/schema.ts` file. All CRUD operations for tables must be centralized in the `src/db/queries.ts` file. - Organize query methods by resource in static classes (for example, `UserQueries` and `TodoQueries`). Each method must use Chinese JSDoc to describe its purpose, parameters, and return value.

**API Points**: - All API endpoints should be declared uniformly in `src/index.ts`, with queries using `GET` and write operations using `POST`. - Refer to the `docs/openapi.json` file for the current list of API endpoints.

**Tech Stack**: - The primary tech stack used in this codebase is Cloudflare Workers, TypeScript, Hono, and Drizzle ORM. - Web framework: Hono (https://hono.dev/llms.txt) - Cloudflare Workers: please read `./docs/.agents/cloudflare-workers.md` for Cloudflare Workers APIs, limits, and best practices. - Database: D1 (SQLite) and KV (key-value store) , please read `./docs/.agents/cloudflare-workers.md` for D1 and KV APIs, limits, and best practices. - ORM: Drizzle ORM (https://orm.drizzle.team/llms-full.txt)

**Development Verification** - After completing any development task, review the Git staging area to verify that only expected changes are included and that no unintended modifications are present. - Before considering the task complete, perform a full validation process: 1. Run type checking to ensure there are no type errors. 2. Run code formatting checks and apply formatting if required. 3. Run the relevant test suite to verify functionality. 4. Run the project build process to ensure the application can be successfully compiled. - If any validation step fails, investigate and resolve the issue before reporting the task as completed.
