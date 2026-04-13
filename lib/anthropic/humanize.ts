import Anthropic from '@anthropic-ai/sdk'
import { buildHumanizePrompt } from './prompts'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function humanizeText(
  text: string,
  intensity: number,
  mode: string
): Promise<ReadableStream> {
  const prompt = buildHumanizePrompt(text, intensity, mode)

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const data = `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
            controller.enqueue(new TextEncoder().encode(data))
          }
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
