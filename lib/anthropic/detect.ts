import Anthropic from '@anthropic-ai/sdk'
import { buildDetectPrompt } from './prompts'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface DetectionResult {
  score: number
  label: string
  passesDetection: boolean
  sentences?: Array<{
    text: string
    score: number
    label: string
  }>
}

export async function detectAI(text: string, deepScan = false): Promise<DetectionResult> {
  const prompt = buildDetectPrompt(text, deepScan)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude')
  }

  try {
    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const parsed = JSON.parse(jsonMatch[0])

    if (deepScan) {
      return {
        score: parsed.overall_score,
        label: parsed.overall_score > 70 ? 'AI Detected' : parsed.overall_score > 40 ? 'Borderline' : 'Human Written',
        passesDetection: parsed.overall_score < 30,
        sentences: parsed.sentences,
      }
    }

    return {
      score: parsed.overall_score,
      label: parsed.label,
      passesDetection: parsed.passes_detection,
    }
  } catch {
    // Fallback
    return {
      score: 50,
      label: 'Borderline',
      passesDetection: false,
    }
  }
}
