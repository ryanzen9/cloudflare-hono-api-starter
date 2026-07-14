---
name: prepare-pr
description: Inspect the current Git branch against its remote base, review all committed and uncommitted changes, assess requirement completion and risks for the developer, run project validation, and draft a pull request body with a changed-files section from the repository PR template or bundled fallback. Use when the user asks to prepare, submit, publish, or push a pull request. Never commit or push until the user explicitly confirms the reviewed draft and proposed Git actions.
---

# Prepare Pull Request

Prepare a reviewable PR draft first. Treat committing, pushing, and opening a PR as separate state-changing actions that require explicit authorization.

## 工作流程

1. 阅读仓库说明文件，例如 `AGENTS.md`，并检查 Git 状态、当前分支、上游分支、远程仓库以及默认分支。保留与当前任务无关的用户变更。
2. 在网络可用时，通过非破坏性的 fetch 刷新远程引用。如果 fetch 失败，需要明确说明本次审查使用的是本地缓存的远程引用。
3. 按以下顺序选择比较基准分支：
   - 用户指定的基准分支。
   - 远程仓库的默认分支。
   - `origin/main`，其次是 `origin/master`。
   - 仅当基准分支仍然无法明确判断时，才询问用户。
4. 检查完整的变更集合：
   - 当前分支中已经提交的变更：`git diff <base>...HEAD` 和 `git log <base>..HEAD`。
   - 通过 `git status`、`git diff` 和 `git diff --cached` 检查已暂存、未暂存以及未跟踪的工作内容。
   - 明确区分已经包含在提交中的变更与仅存在于本地、推送时不会包含的变更。
5. 在起草 PR 前先审查 diff。检查正确性、安全性、回归风险、API 和 Schema 兼容性、测试、文档以及仓库约定。按照严重程度报告发现的问题，并提供文件和行号引用。除非用户明确要求，否则不得静默修复这些问题。
6. 只能根据现有的 Issue、任务描述、文档、提交记录和代码推断预期结果。将每项需求映射到对应证据，并标记为已完成、部分完成、缺失或无法验证。应明确说明假设，不得虚构需求。
7. 运行仓库要求的验证命令。对于当前项目，应遵循 `AGENTS.md`，包括类型检查、格式检查、测试、构建以及适用情况下的文档构建。当用户的请求仅限于审查和准备 PR 时，未经授权不得执行格式化或其他修复操作。
8. 在以下位置查找 PR 模板：
   - `.github/pull_request_template.md`
   - `.github/PULL_REQUEST_TEMPLATE.md`
   - `.github/PULL_REQUEST_TEMPLATE/`

   如果仓库中存在匹配的模板，则使用该模板；否则加载 `assets/pull-request-template.md`。保留模板中的必填标题和检查项，但从最终草稿中移除模板指导性注释。
   - 将需求完成情况分析、风险和代码审查发现保留在面向开发者的审查报告中。除非仓库模板明确要求，否则不要将这些内容加入 PR 正文。
   - 根据最终比较范围填充 PR 正文中的变更文件章节。列出每个变更文件的 Git 状态和简要说明；如果生成文件数量过多，逐文件列出会造成内容冗长，则可以按组归纳。

9. 输出一份完整的审查报告，其中包含：
   - 比较基准分支、当前分支、上游分支，以及当前使用的是最新远程引用还是缓存引用。
   - 本次包含的提交和仅存在于本地的变更。
   - 代码审查发现和需求完成情况评估。
   - 执行的验证命令及其结果。
   - 建议的 PR 标题，以及放在 Markdown 代码块中的完整 PR 正文。
   - 确认 PR 正文包含已审查的变更文件列表，并且除非仓库模板明确要求，否则不包含内部需求分析和风险分析。
   - 精确列出建议执行的下一步操作：需要暂存的文件、需要提交时使用的提交信息、推送目标，以及是否包含创建 PR。
10. 停止执行并请求用户明确确认。不得将用户之前笼统提出的“提交 PR”视为对生成草稿或 Git 状态变更操作的确认。
11. 用户确认后，只执行已经批准的操作：

- 仅暂存已经审查过的文件。
- 提交前，展示已暂存 diff 的摘要，并根据仓库说明获取所需的额外确认。
- 仅使用用户批准的提交信息进行提交。
- 使用明确的 refspec 推送，例如：

  `git push -u origin HEAD:<branch>`

  除非用户单独提出并明确确认，否则不得强制推送。

- 只有在用户明确授权创建 PR，并且目标基准分支和源分支均不存在歧义时，才可以创建 PR。

12. 操作完成后，报告最终分支、提交、推送结果以及创建出的 PR URL。如果远程仓库在审查后发生变化，应停止操作并重新审查，不得通过强制推送覆盖远程变更。

## 安全约束

- 不得暴露 diff、环境文件、凭证或命令输出中的秘密信息。发现疑似秘密信息时，应进行标记，并在发布前停止操作。
- 不得仅因为文件处于未跟踪状态或存在于工作区中，就将其包含进 PR。与任务无关的文件不得纳入。
- 在没有证据的情况下，不得声称某项需求已经完成，或某项验证已经通过。
- 在此工作流程中，不得绕过 Git hooks、重写历史、删除分支或执行强制推送。
- 如果当前分支就是基准分支或默认分支，应建议创建功能分支，并在执行创建分支操作前等待用户确认。
