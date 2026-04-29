import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(apiKey: string) {
  if (!openaiClient || openaiClient.apiKey !== apiKey) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
}

export async function chatCompletion({
  messages,
  apiKey,
  model = 'gpt-4o',
  maxTokens = 16384,
}: {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  apiKey: string;
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const client = getOpenAIClient(apiKey);

  const response = await client.chat.completions.create({
    model,
    messages: messages as any,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || '';
}

export async function streamChatCompletion({
  messages,
  apiKey,
  model = 'gpt-4o',
  maxTokens = 16384,
  onChunk,
}: {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  apiKey: string;
  model?: string;
  maxTokens?: number;
  onChunk: (chunk: string) => void;
}): Promise<string> {
  const client = getOpenAIClient(apiKey);

  const stream = await client.chat.completions.create({
    model,
    messages: messages as any,
    max_tokens: maxTokens,
    stream: true,
  });

  let fullContent = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullContent += content;
      onChunk(content);
    }
  }

  return fullContent;
}
