import { describe, it, expect } from 'vitest'
import { buildHumanizePrompt, buildDetectPrompt } from '@/lib/anthropic/prompts'

describe('buildHumanizePrompt', () => {
  it('includes the text to humanize', () => {
    const prompt = buildHumanizePrompt('Hello world', 5, 'Standard')
    expect(prompt).toContain('Hello world')
  })

  it('includes the intensity level', () => {
    const prompt = buildHumanizePrompt('Test', 7, 'Academic')
    expect(prompt).toContain('INTENSITY: 7/10')
    expect(prompt).toContain('INTENSITY GUIDANCE (7/10)')
  })

  it('includes the mode', () => {
    const prompt = buildHumanizePrompt('Test', 5, 'Business')
    expect(prompt).toContain('MODE: Business')
    expect(prompt).toContain('Write in Business style')
  })

  it('contains humanization rules', () => {
    const prompt = buildHumanizePrompt('Test', 5, 'Standard')
    expect(prompt).toContain('vary sentence lengths')
    expect(prompt).toContain('contractions')
    expect(prompt).toContain('Preserve ALL factual content')
  })
})

describe('buildDetectPrompt', () => {
  it('builds a simple detect prompt', () => {
    const prompt = buildDetectPrompt('Some text here', false)
    expect(prompt).toContain('Some text here')
    expect(prompt).toContain('overall_score')
    expect(prompt).toContain('passes_detection')
    expect(prompt).not.toContain('sentences')
  })

  it('builds a deep scan prompt with sentence analysis', () => {
    const prompt = buildDetectPrompt('Some text here', true)
    expect(prompt).toContain('Some text here')
    expect(prompt).toContain('sentences')
    expect(prompt).toContain('For each sentence')
  })

  it('requests JSON output format', () => {
    const prompt = buildDetectPrompt('Test', false)
    expect(prompt).toContain('Return ONLY valid JSON')
  })
})
