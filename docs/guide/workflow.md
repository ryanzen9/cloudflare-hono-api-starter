# Cloudflare Workflows

Cloudflare Workflows 是构建在 Workers 之上的持久化工作流执行引擎。支持 http 请求，定时调度，事件监听触发，手动触发等，默认与 cloudflare d1、r2、kv、durable object 等绑定集成。可用于 Agent 异步任务，交互。数据流水线操作，定时任务，生命周期操作等。

项目默认集成 Cloudflare Workflows 。当前实现包含一个 `D1BackupWorkflow` 的示例：它按照计划读取 D1 中的表记录，将数据序列化为 JSON，并写入 R2。

## 核心概念

Cloudflare Workflows 由以下对象组成：

- **Workflow 定义**：继承 `WorkflowEntrypoint` 的类，描述任务需要执行的步骤。
- **Workflow 实例**：Workflow 的一次独立运行，由唯一的 `instanceId` 标识。
- **Step**：通过 `step.do()` 声明的持久化执行单元。Step 失败时可以重试；成功后，Workflow 可以从已完成的位置继续运行。
- **Binding**：Worker 通过 Binding 创建、查询和管理 Workflow 实例。
- **Schedule**：直接配置在 Workflow Binding 上的 Cron 表达式，每次触发都会创建新的 Workflow 实例。

Cloudflare Workflows 的执行模型、重试规则和实例生命周期参见 [Cloudflare Workflows 文档](https://developers.cloudflare.com/workflows/)。

## 当前架构

相关文件按职责分布：

```text
src/
├── workflows/
│   ├── d1-backup.ts             # D1 JSON 快照 Workflow
│   └── index.ts                 # 导出 Workflow 类
└── index.ts                     # 导出 Workflow Entrypoint

test/workflows/
└── d1-backup.test.ts            # Workflow、D1 与 R2 集成测试

wrangler.jsonc                   # Workflow Binding、Schedule、D1 和 R2 配置
worker-configuration.d.ts        # Wrangler 生成的 Binding 类型
```

## Workflow 配置

`wrangler.jsonc` 将 `D1BackupWorkflow` 注册为 `D1_BACKUP_WF` Binding，并直接配置每日计划：

```jsonc
{
  "workflows": [
    {
      "name": "D1_Backup_WorkerFlow",
      "binding": "D1_BACKUP_WF",
      "class_name": "D1BackupWorkflow",
      "schedules": ["0 0 * * *"]
    }
  ]
}
```

| 字段         | 当前值                 | 作用                                      |
| ------------ | ---------------------- | ----------------------------------------- |
| `name`       | `D1_Backup_WorkerFlow` | Cloudflare 上的 Workflow 名称             |
| `binding`    | `D1_BACKUP_WF`         | Worker 和测试代码访问 Workflow 的环境属性 |
| `class_name` | `D1BackupWorkflow`     | Worker 导出的 Workflow 类名               |
| `schedules`  | `0 0 * * *`            | 每天 UTC 00:00 创建一个 Workflow 实例     |

Workflow Schedule 使用 UTC。直接在 Binding 上配置 `schedules` 后，不需要额外实现 Worker 顶层 `scheduled()` handler。详情参见 [Trigger Workflows](https://developers.cloudflare.com/workflows/build/trigger-workflows/)。

`src/workflows/index.ts` 导出 Workflow 类，`src/index.ts` 再将它导出为 Worker Entrypoint：

```typescript
// src/index.ts
export * from "./workflows";
```

修改 Workflow Binding 或类名后，重新生成 Worker 类型：

```bash
bun run cf-typegen
```

生成的 `worker-configuration.d.ts` 会在 `Env` 上声明：

```typescript
D1_BACKUP_WF: Workflow;
```

## D1BackupWorkflow

`D1BackupWorkflow` 继承 `WorkflowEntrypoint<Env>`，因此 `this.env` 直接提供 Worker Binding：

```typescript
export class D1BackupWorkflow extends WorkflowEntrypoint<Env> {
  async run(event: WorkflowEvent<unknown>, step: WorkflowStep) {
    await step.do(`Starting backup for ${event.instanceId}`, async () => {
      // 读取 D1，并将 JSON 写入 R2。
    });
  }
}
```

> 这里的 `Env` 是 Wrangler 生成的运行时环境类型。与 Hono 请求中的 `Env` 上下文不同

## Step 与失败处理

D1 查询、JSON 序列化和 R2 写入都位于同一个 `step.do()` 中。任意操作抛出异常时，该 Step 失败，Workflow 会按 Cloudflare Workflows 的默认策略重试。

当前代码没有显式传入 Step 配置，因此使用平台默认值：

- 最多重试 5 次。
- 初始延迟 10 秒。
- 使用指数退避。
- 每次尝试的默认超时时间为 10 分钟。

达到重试上限后，实例进入 `errored` 状态。需要改变策略时，可以向 `step.do()` 传入配置：

```typescript
await step.do(
  `Starting backup for ${event.instanceId}`,
  {
    retries: {
      limit: 3,
      delay: "10 seconds",
      backoff: "exponential"
    },
    timeout: "10 minutes"
  },
  async () => {
    // 备份逻辑。
  }
);
```

重试配置与错误状态的详细行为参见 [Sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)。

## 本地运行与检查

启动本地 Worker：

```bash
bun run start
```

`wrangler dev` 默认提供本地 Workflow、D1 和 R2 模拟。当前 `R2_BUCKET` 没有启用 `remote: true`，所以本地触发的快照写入 `.wrangler/state`，不会影响远程 R2 Bucket。

启动后可以打开 Local Explorer，手动调用声明的 Workflow 实例：

```text
http://localhost:8787/cdn-cgi/explorer
```

也可以使用 Wrangler CLI 触发本地实例：

```bash
bunx wrangler workflows trigger D1_Backup_WorkerFlow --local
```

本地 Workflow 命令需要有正在运行的 `wrangler dev` 会话。完整命令参见 [Wrangler Workflows commands](https://developers.cloudflare.com/workers/wrangler/commands/workflows/)。

## 测试

`test/workflows/d1-backup.test.ts` 使用 `@cloudflare/vitest-pool-workers` 在本地 Workers Runtime 中执行真实 Workflow 实例。测试同时使用隔离的 D1、Workflow 和 R2 Binding，因此属于集成测试。

核心代码：

```typescript
const instanceId = crypto.randomUUID();

await using instance = await introspectWorkflowInstance(
  env.D1_BACKUP_WF,
  instanceId
);

await env.D1_BACKUP_WF.create({
  id: instanceId
});

await expect(instance.waitForStatus("complete")).resolves.not.toThrow();

const listing = await env.R2_BUCKET.list({
  prefix: "d1_dump/"
});

const backupObject = listing.objects.find((object) =>
  object.key.endsWith(`/${instanceId}.json`)
);
```

`await using` 会在测试结束时释放 Workflow introspector，避免实例状态影响其他测试。Cloudflare 的 Workflow 测试 API 还可以等待 Step 结果、读取 Workflow 输出、模拟 Step 错误和禁用重试延迟。详情参见 [Workflow Test APIs](https://developers.cloudflare.com/workers/testing/vitest-integration/test-apis/#workflows)。

运行完整验证：

```bash
bun run check
bun run test
bun run docs:build
```
