import { useAgentChat } from "@cloudflare/ai-chat/react";
import { useAgent } from "agents/react";

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

export default Chat;
