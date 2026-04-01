import { type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { MAX_RESPONSE_SEGMENTS, MAX_TOKENS } from '~/lib/.server/llm/constants';
import { CONTINUE_PROMPT } from '~/lib/.server/llm/prompts';
import { streamText, type Messages, type StreamingOptions, type ModelConfig } from '~/lib/.server/llm/stream-text';
import SwitchableStream from '~/lib/.server/llm/switchable-stream';

export async function loader(_args: LoaderFunctionArgs) {
  return new Response(null, {
    status: 405,
    statusText: 'Method Not Allowed',
  });
}

export async function action(args: ActionFunctionArgs) {
  return chatAction(args);
}

interface ChatRequestBody {
  messages: Messages;
  provider?: string;
  model?: string;
  apiKey?: string;
}

async function chatAction({ context, request }: ActionFunctionArgs) {
  const { messages, provider, model, apiKey } = await request.json<ChatRequestBody>();

  const stream = new SwitchableStream();

  const modelConfig: ModelConfig | undefined =
    provider && model ? { provider: provider as ModelConfig['provider'], modelId: model, apiKey } : undefined;

  try {
    const options: StreamingOptions = {
      toolChoice: 'none',
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }

        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }

        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;

        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);

        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });

        const result = await streamText(messages, context.cloudflare.env, options, modelConfig);

        return stream.switchSource(result.toAIStream());
      },
    };

    const result = await streamText(messages, context.cloudflare.env, options, modelConfig);

    stream.switchSource(result.toAIStream());

    return new Response(stream.readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error: any) {
    console.error('Chat Action Error:', error);

    // check for API key related errors
    let status = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    if (status === 402 || message.includes('Payment Required')) {
      status = 402;
      message =
        'OpenRouter account requires credits or billing setup. Add credits in OpenRouter dashboard, then retry generation.';
    }

    if (
      message.includes('API key') ||
      message.includes('ANTHROPIC_API_KEY') ||
      message.includes('OPENAI_API_KEY') ||
      message.includes('GOOGLE_API_KEY') ||
      message.includes('OPENROUTER_API_KEY') ||
      message.includes('authentication_error') ||
      message.includes('invalid x-api-key')
    ) {
      status = 401;

      if (!message.includes('API key')) {
        message = `Authentication failed: ${message}. Please check your API key configuration. See API_PROVIDERS.md for setup instructions.`;
      }
    }

    const errorResponse = {
      error: message,
      name: error.name,
      status,
      data: error.data || undefined,
    };

    return new Response(JSON.stringify(errorResponse), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
