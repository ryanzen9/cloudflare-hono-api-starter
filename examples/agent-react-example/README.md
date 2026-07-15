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

### Agent Create

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

### Use Chat Agent

需要安装 `@cloudflare/ai-chat` 包，[用于构建聊天用户界面的 React Hook](https://developers.cloudflare.com/agents/communication-channels/chat/chat-agents/)。

```bash
bun add @cloudflare/ai-chat
```

使用 useAgentChat Hook 进行聊天功能的实现。

```tsx
function Chat() {
  const agent = useAgent({
    agent: "chat-agent",
    name: "chat",
    host: process.env.BUN_PUBLIC_API_ORIGIN
  });
  const { messages, sendMessage, status } = useAgentChat({ agent });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong>
          {msg.parts.map((part, i) =>
            part.type === "text" ? <span key={i}>{part.text}</span> : null
          )}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem(
            "input"
          ) as HTMLInputElement;
          sendMessage({ text: input.value });
          input.value = "";
        }}
      >
        <input
          name="input"
          placeholder="Type a message..."
          aria-label="Message input"
        />
        <button type="submit" disabled={status !== "ready"}>
          Send
        </button>
      </form>
    </div>
  );
}
```
