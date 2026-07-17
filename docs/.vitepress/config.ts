import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Cloudflare Hono API Starter",
  description: "Cloudflare-hono-api-starter 文档",
  lang: "zh-CN",
  cleanUrls: true,
  srcExclude: ["**/openapi.json"],
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "指南", link: "/guide/getting-started" },
      { text: "API 参考", link: "/api/overview" },
      {
        text: "Swagger",
        link: "https://cloudflare-hono-api-starter.rubyceng0326.workers.dev/docs"
      }
    ],
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "项目结构", link: "/guide/project-structure" },
            { text: "本地开发", link: "/guide/development" },
            { text: "认证", link: "/guide/authentication" },
            { text: "事务", link: "/guide/transaction" },
            { text: "测试", link: "/guide/testing" },
            { text: "部署", link: "/guide/deployment" },
            { text: "环境变量", link: "/guide/environment-variable" },
            { text: "异常处理", link: "/guide/error-handling" },
            { text: "对象存储", link: "/guide/oss" },
            { text: "AI", link: "/guide/ai" },
            { text: "工作流", link: "/guide/workflow" },
            { text: "OAuth", link: "/guide/oauth" }
          ]
        }
      ],
      "/api/": [
        {
          text: "API",
          items: [{ text: "概览", link: "/api/overview" }]
        }
      ]
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/ryanzen9/cloudflare-hono-api-starter"
      }
    ],
    search: {
      provider: "local"
    },
    outline: {
      label: "本页目录"
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题"
  }
});
