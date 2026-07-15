import { AIChatAgent } from "@cloudflare/ai-chat";
import { convertToModelMessages, streamText } from "ai";
import { createWorkersAI } from "workers-ai-provider";

export class ChatAgent extends AIChatAgent {
  healthCheck() {
    return new Response("OK");
  }

  async onChatMessage() {
    // Use any provider such as workers-ai-provider, openai, anthropic, google, etc.
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/qwen/qwq-32b"),
      messages: await convertToModelMessages(this.messages)
    });

    return result.toUIMessageStreamResponse();
  }
}
