export type OpenAiMessage = {
  role: "system" | "assistant" | "user";
  content: string;
};
