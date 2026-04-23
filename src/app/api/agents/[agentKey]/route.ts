import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AgentKey } from '@/types';
import { getSystemPrompt, getUserPrompt } from '@/lib/prompts';

const client = new Anthropic();

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<'/api/agents/[agentKey]'>,
) {
  const { agentKey } = await ctx.params;

  const systemPrompt = getSystemPrompt();
  const userPrompt = getUserPrompt(agentKey as AgentKey);

  const stream = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
    stream: true,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
