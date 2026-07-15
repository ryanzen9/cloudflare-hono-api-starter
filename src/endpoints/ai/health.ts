import { AppContext } from "../../types";

export const AIHealth = async (c: AppContext) => {
  const ai = c.env.AI;

  //   const result = await ai.run("@cf/meta/llama-3.2-1b-instruct", {
  //     messages: [
  //       {
  //         role: "user",
  //         content: "Only respond with AI_OK"
  //       }
  //     ],
  //     max_tokens: 20
  //   });
  const result = await ai.run("@cf/meta/llama-3.2-1b-instruct", {
    prompt: "Only respond with AI_OK",
    max_tokens: 20
  });

  return c.json(result);
};
