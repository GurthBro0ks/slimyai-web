import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
});

export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  const response = await openai.chat.completions.create({
    model: options?.model || 'gpt-4',
    messages: messages as any,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 1000,
    stream: false,
  });

  return response.choices[0].message;
}

export async function createStreamingChatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
) {
  const stream = await openai.chat.completions.create({
    model: options?.model || 'gpt-4',
    messages: messages as any,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 1000,
    stream: true,
  });

  return stream;
}

export { openai };
