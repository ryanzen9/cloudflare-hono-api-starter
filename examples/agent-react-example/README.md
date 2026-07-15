# agent-react-example

## Description

Cloudflare Agents React template for Bun.

## Start

```bash
bun install
```

```bash
cp .env.example .env
```

To start a development server:

```bash
bun dev
```

## Example

> 默认请求同域名下的 api，若前后端分离需要单独设置链接地址

使用 `useAgent` 创建 agent 对象进行连接，监听状态变化并且实时同步。

```ts
const agent = useAgent<CounterAgent, CounterState>({
  host: "http://localhost:8787",
  agent: "counter-agent",
  name: "counter",
  onStateUpdate: (state) => setCount(state.count)
});
```
