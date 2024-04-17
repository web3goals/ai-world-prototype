"use server";

import { OpenAiMessage } from "@/types/open-ai-message";
import axios from "axios";

export async function sendMessagesToOpenAI(
  messages: OpenAiMessage[],
  model: "gpt-3.5-turbo",
  temperature: 0.7
): Promise<string> {
  console.log("sendMessagesToOpenAI");
  const { data } = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: model,
      messages: messages,
      temperature: temperature,
    },
    { headers: { Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}` } }
  );
  return JSON.parse(JSON.stringify(data?.choices?.[0]?.message?.content));
}
