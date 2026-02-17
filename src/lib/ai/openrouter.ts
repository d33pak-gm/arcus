import OpenAI from "openai";

const MODELS = [
  "nvidia/nemotron-nano-12b-v2-vl:free",
  "upstage/solar-pro-3:free",
  "arcee-ai/trinity-mini:free",
  "deepseek/deepseek-r1-0528:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
];

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://arcus.dev",
    "X-Title": "Arcus",
  },
});

interface ChatOptions {
  messages: OpenAI.ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
}

export async function chatCompletion(options: ChatOptions): Promise<string> {
  const { messages, temperature = 0.7, max_tokens } = options;

  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await openai.chat.completions.create({
        model,
        temperature,
        ...(max_tokens ? { max_tokens } : {}),
        messages,
      });
      const content = response.choices[0]?.message?.content?.trim() || "";
      const cleaned = cleanResponse(content);
      if (!cleaned) {
        throw new Error("Empty response after cleaning");
      }
      return cleaned;
    } catch (error) {
      console.warn(`Model ${model} failed, trying next...`, error);
      lastError = error;
    }
  }

  throw lastError || new Error("All AI models failed. Please try again later.");
}

function cleanResponse(text: string): string {
  // Strip <think>...</think> tags (DeepSeek R1 models)
  text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return text;
}
