# Agent Field Notes

**Meta Note**: This is the primary agent knowledge base file.`CLAUDE.md` and `GEMINI.md` are symlinks to this file—always edit `AGENTS.md` directly.When learning something new about the codebase that would help with future tasks, update this file immediately.

**Project Available Skills**: `prepare-pr`, `write-project-docs`

**LLM Reference**: When searching for relevant materials, please prioritize the following entry points. [Hono](https://hono.dev/llms.txt), [Cloudflare Workers](.agents/docs/cloudflare-workers.md), [Drizzle ORM](https://orm.drizzle.team/llms-full.txt)

## Language

- The primary language used in this codebase is **TypeScript**.
- Version: **v7.0.2**.
- Package manager: **Bun**.

---

## 高风险操作

执行以下操作前必须始终获得确认：

- 删除文件
- 大规模重构
- 修改 Git 历史
- 执行 `git commit`
- 执行 `git push`
- 修改环境配置
- 修改 CI
- 修改数据库

---

## 渐进式披露

处理项目说明和文档时，应遵循渐进式披露原则。

- 避免加载或维护不必要的上下文。
- 仅在附加规则、细节或文档与当前任务相关时引入它们。
- 如果发现需要在整个项目中频繁遵循的全局原则、约定或规则，应更新 `AGENTS.md` 文件进行记录。
- `AGENTS.md` 应专注于可复用的项目级知识，而不是特定任务的临时说明。

---

## 数据库

- 项目数据库为 Cloudflare D1（SQLite）。
- 对数据库进行操作时，优先使用本地数据库。
- 所有数据库表迁移文件必须使用 `drizzle-kit` 生成。
- 将迁移文件存放在 `drizzle/migrations` 中。
- 在 `drizzle.config.ts` 中配置数据库连接。
- 数据库命令：

  ```bash
  drizzle-kit generate
  wrangler d1 migrations apply
  ```

- 所有数据库表 Schema 必须定义在 `src/db/schema.ts` 中。
- 所有 CRUD 操作必须集中定义在 `src/db/queries.ts` 中。
- 查询方法应按照资源组织在静态类中，例如 `UserQueries` 和 `TodoQueries`。
- 每个查询方法都必须包含 JSDoc，并说明：
  - 用途
  - 参数
  - 返回值

---

## API 端点

- 所有 API 端点必须集中声明在 `src/index.ts` 中。
- 请求方法使用规范：
  - 查询操作使用 `GET`。
  - 写入操作使用 `POST`。

---

## 测试

- 所有 Worker 测试均使用 Vitest 和 `@cloudflare/vitest-pool-workers`。
- 在 `vitest.config.ts` 中使用 `cloudflareTest()` 和 `wrangler.jsonc` 配置测试池。
- 测试文件统一存放在 `test/` 中，并通过 `test/tsconfig.json` 进行类型检查。
- 单元测试或纯逻辑单元测试存放在 `test/unit/`。
- 集成测试、API 测试，按照资源类型存放在 `test/integration/<resource>/` 中，例如 `users/` 和 `orders/`。
- 在 `test/setup.ts` 中通过 `TEST_MIGRATIONS` Binding，将 D1 迁移应用到隔离的测试数据库。自动化测试不得使用本地开发数据库。
- 测试基于 D1 的 API 流程时，使用 `cloudflare:workers` 中的 `exports.default.fetch()`。
- 使用 `bun run test` 运行测试。

---

## 开发验证

完成任何开发任务后：

1. 检查 Git 暂存区。
   - 确认暂存区中只包含预期变更。
   - 确保不存在意外修改。

2. 执行完整的验证流程：
   1. 运行类型检查，确保不存在类型错误。
   2. 运行代码格式检查，并在需要时修复格式问题。
   3. 运行相关测试套件，验证功能是否正常。
   4. 运行项目构建流程，确保应用能够成功编译。

3. 如果任何验证步骤失败：
   - 调查问题原因。
   - 解决问题。
   - 在所有验证步骤通过之前，不得将任务报告为已完成。

---

## 文档站点（VitePress）

- 面向开发者阅读的文档使用 VitePress 构建，源文件位于 `docs/` 目录。
- 配置文件：`docs/.vitepress/config.ts`。

---
