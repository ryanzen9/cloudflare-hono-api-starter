# @ryanzeng/cfo-cli

快速创建 Cloudflare Workers 运行时的 Hono API 脚手架.

[模板仓库地址](https://github.com/ryanzen9/cloudflare-hono-api-starter)

## 使用

创建新目录并初始化项目：

```bash
bunx @ryanzeng/cfo-cli init my-api
```

在当前空目录中初始化：

```bash
bunx @ryanzeng/cfo-cli init
```

只生成文件，不安装依赖：

```bash
bunx @ryanzeng/cfo-cli init my-api --no-install
```

目标目录必须为空，但允许其中已经存在 `.git` 目录。

## 开发

```bash
bun run build:template
bun run check
bun run test
bun publish --dry-run
npm publish --access public
```

模板由仓库根目录中已被 Git 跟踪的文件生成。生成器只复制白名单内的文件，
并使用 `template-overrides/wrangler.jsonc` 替代本机 Wrangler 配置。
