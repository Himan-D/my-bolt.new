import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { formatStreamPart } from 'ai';
import { streamChatCompletion } from '~/lib/openai-client';
import { getSystemPrompt } from '~/lib/.server/llm/prompts';

interface AppContext {
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
}

interface ChatRequestBody {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  provider?: string;
  model?: string;
  apiKey?: string;
}

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  const context = (args as any).context as AppContext | undefined;
  const { messages, provider, model, apiKey } = await request.json<ChatRequestBody>();

  let resolvedApiKey = apiKey;

  if (!resolvedApiKey) {
    if (provider === 'OpenAI' || !provider) {
      resolvedApiKey = context?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    } else if (provider === 'Anthropic') {
      resolvedApiKey = process.env.ANTHROPIC_API_KEY;
    } else if (provider === 'Google') {
      resolvedApiKey = context?.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    } else if (provider === 'OpenRouter') {
      resolvedApiKey = process.env.OPENROUTER_API_KEY;
    }
  }

  if (!resolvedApiKey) {
    resolvedApiKey =
      context?.OPENAI_API_KEY ||
      context?.GOOGLE_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';
  }

  if (!resolvedApiKey) {
    return new Response(
      JSON.stringify({
        error: 'No API key found. Please set OPENAI_API_KEY in .env file or pass apiKey in request.',
        name: 'MissingAPIKey',
        status: 401,
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const useModel = model || 'gpt-4o';

  const systemPrompt = getSystemPrompt();
  const messagesWithSystem =
    messages[0]?.role !== 'system' ? [{ role: 'system' as const, content: systemPrompt }, ...messages] : messages;

  try {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await streamChatCompletion({
            messages: messagesWithSystem,
            apiKey: resolvedApiKey,
            model: useModel,
            maxTokens: 16384,
            onChunk: (chunk) => {
              controller.enqueue(encoder.encode(formatStreamPart('text', chunk)));
            },
          });
          controller.close();
        } catch (error: any) {
          controller.enqueue(encoder.encode(formatStreamPart('error', error.message || 'Unknown error')));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat Action Error:', error);

    let status = 500;
    let message = error.message || 'Internal Server Error';

    if (error.status === 401 || message.includes('authentication')) {
      status = 401;
      message = 'Invalid API key. Please check your OPENAI_API_KEY.';
    } else if (error.status === 402 || message.includes('billing') || message.includes('credits')) {
      status = 402;
      message = 'Insufficient credits. Please add credits to your OpenAI account.';
    } else if (error.status === 429 || message.includes('rate limit')) {
      status = 429;
      message = 'Rate limit exceeded. Please try again later.';
    }

    return new Response(JSON.stringify({ error: message, name: error.name || 'Error', status }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
