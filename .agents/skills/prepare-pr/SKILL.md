---
name: prepare-pr
description: Inspect a Git branch or working tree against a selected base, inventory committed and local-only changes, objectively describe the resulting functionality and implementation, run and record project validation, and draft or prepare a pull request from the repository template. Use when the user asks to summarize branch changes or prepare, submit, publish, or push a pull request. This skill does not perform code review, defect discovery, severity ranking, risk assessment, or improvement recommendations. Never commit, push, or create a pull request until the user explicitly confirms those Git actions.
---

# Prepare Pull Request

基于 Git 证据客观整理变更并生成 PR 草稿。将提交、推送和创建 PR 视为独立的状态变更操作，执行前必须取得用户明确确认。

## 职责边界

本 skill 负责：

- 确认比较基准、当前分支、提交范围和工作区状态。
- 区分已提交、已暂存、未暂存和未跟踪的变更。
- 根据 diff 客观描述新增或调整的功能、实现方式、数据流、接口、Schema、配置、测试和文档。
- 执行项目要求的验证命令，并如实记录结果。
- 使用仓库 PR 模板生成标题、正文和变更文件清单。
- 在用户确认后执行已经批准的暂存、提交、推送或创建 PR 操作。

如果用户同时要求代码审查，应将其作为独立任务处理，不要把审查结论混入本 skill 生成的 PR 正文或变更摘要。

## 工作流程

1. 阅读 `AGENTS.md` 等仓库说明，检查 Git 状态、当前分支、上游分支、远程仓库和默认分支。保留与当前任务无关的用户变更。
2. 网络可用时，通过非破坏性的 `git fetch` 刷新远程引用。刷新失败时，明确说明使用的是本地缓存引用。
3. 按以下顺序选择比较基准：
   - 用户指定的基准分支。
   - 远程默认分支。
   - `origin/main`，其次是 `origin/master`。
   - 仍无法确定时再询问用户。
4. 收集完整变更范围：
   - 使用 `git log <base>..HEAD` 列出当前分支包含的提交。
   - 使用 `git diff <base>...HEAD` 检查已提交的分支差异。
   - 使用 `git status`、`git diff --cached` 和 `git diff` 检查本地变更。
   - 明确指出哪些内容已经进入提交，哪些仅存在于本地且不会随当前分支直接推送。
5. 按功能主题整理 diff，并客观描述：
   - 对外行为和用户可见变化。
   - 关键实现路径、模块协作和数据流。
   - API、数据库 Schema、配置或类型定义变化。
   - 测试覆盖和文档同步情况。
   - 每个文件在本次变更中的实际用途。
6. 只描述可以从代码、提交和文档直接证实的内容。必须推断时使用“根据当前实现推断”等表述，不要把推断写成事实。不要评价实现优劣，也不要主动寻找问题。
7. 按 `AGENTS.md` 运行类型检查、格式检查、测试、构建和适用的文档构建：
   - 记录实际执行的命令、退出状态和测试数量。
   - 验证失败时，客观记录失败命令和错误摘要。
   - 除非用户明确要求修复，否则不要诊断、修改或重新设计代码。
8. 按以下顺序查找 PR 模板：
   - `.github/pull_request_template.md`
   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `.github/PULL_REQUEST_TEMPLATE/`
   - `assets/pull-request-template.md`

   保留仓库模板的必填标题和检查项，移除指导性注释。根据最终比较范围填写功能、实现、验证结果和变更文件章节。逐项列出文件的 Git 状态与用途；生成文件过多时可以按目录或用途分组。

9. 输出一份 PR 准备结果，包含：
   - 比较基准、当前分支、上游分支，以及远程引用刷新状态。
   - 包含的提交和仅存在于本地的变更。
   - 客观的功能与实现摘要。
   - 验证命令及结果。
   - 建议的 PR 标题和完整 PR 正文。
   - 建议的下一步 Git 操作，包括暂存范围、提交信息、推送目标和是否创建 PR。
10. 输出草稿后停止，等待用户明确确认。不得把用户此前笼统的“提交 PR”视为对具体 Git 操作的最终批准。
11. 用户确认后，只执行已经批准的操作：

- 仅暂存草稿覆盖的文件。
- 提交前展示暂存摘要，并遵循仓库要求取得确认。
- 仅使用用户批准的提交信息。
- 使用明确的 refspec 推送，例如 `git push -u origin HEAD:<branch>`。
- 仅在 base 和 head 明确且用户授权时创建 PR。

12. 操作完成后，报告分支、提交、推送结果和 PR URL。远程分支在准备后发生变化时，重新收集差异并更新摘要，不得强制推送。

## 客观描述规则

- 使用“新增”“调整”“移除”“调用”“写入”“返回”“验证”等中性动词。
- 用具体文件、符号、路由、表名和命令支撑描述。
- 不使用“正确”“安全”“稳健”“有风险”“存在问题”“应该改进”等评价性表达。
- 不把提交信息直接当作实现事实；以实际 diff 为准。
- 不声称未执行的验证已经通过。
- PR 正文只包含与变更内容和验证事实有关的信息。

## 安全约束

- 不得暴露 diff、环境文件、凭证或命令输出中的秘密信息。发现疑似秘密时停止发布，并只说明存在需要用户处理的敏感内容。
- 不得因为文件处于未跟踪状态就自动将其纳入 PR。
- 不得绕过 Git hooks、重写历史、删除分支或强制推送。
- 当前分支与基准分支相同时，在创建新分支前取得用户确认。
