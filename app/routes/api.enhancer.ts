import { type ActionFunctionArgs } from '@remix-run/cloudflare';
import { StreamingTextResponse, parseStreamPart } from 'ai';
import { streamText, type ModelConfig } from '~/lib/.server/llm/stream-text';
import { stripIndents } from '~/utils/stripIndent';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function action(args: ActionFunctionArgs) {
  return enhancerAction(args);
}

interface EnhancerRequestBody {
  message: string;
  provider?: string;
  model?: string;
  apiKey?: string;
}

async function enhancerAction({ context, request }: ActionFunctionArgs) {
  const { message, provider, model, apiKey } = await request.json<EnhancerRequestBody>();

  const modelConfig: ModelConfig | undefined =
    provider && model ? { provider: provider as ModelConfig['provider'], modelId: model, apiKey } : undefined;

  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content: stripIndents`
          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          Optimize the improved prompt for production-grade output quality. Prioritize:
          - clear acceptance criteria
          - architecture and maintainability expectations
          - type safety and validation
          - framework selection clarity (prefer LangGraph.js for multi-agent orchestration when relevant)
          - backend API contract quality (request/response schemas and error handling)
          - backend security and reliability (authz, rate limiting, idempotency when relevant)
          - data layer robustness (transactions, migration awareness, pagination for lists)
          - accessibility and performance requirements when UI is involved
          - testing expectations for non-trivial logic

          IMPORTANT: Only respond with the improved prompt and nothing else!

          <original_prompt>
            ${message}
          </original_prompt>
        `,
        },
      ],
      context.cloudflare.env,
      undefined,
      modelConfig,
    );

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const processedChunk = decoder
          .decode(chunk)
          .split('\n')
          .filter((line) => line !== '')
          .map(parseStreamPart)
          .map((part) => part.value)
          .join('');

        controller.enqueue(encoder.encode(processedChunk));
      },
    });

    const transformedStream = result.toAIStream().pipeThrough(transformStream);

    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.log(error);

    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}
