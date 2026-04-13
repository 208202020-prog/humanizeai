export function buildHumanizePrompt(text: string, intensity: number, mode: string): string {
  return `You are an expert text humanizer. Your job is to rewrite AI-generated text so it reads as naturally written by a human expert.

INTENSITY: ${intensity}/10
MODE: ${mode}

RULES:
1. Dramatically vary sentence lengths — mix very short sentences (under 8 words) with longer ones (over 25 words). This is critical.
2. Replace predictable AI vocabulary: remove "delve", "utilize", "furthermore", "moreover", "it is worth noting", "in conclusion", "in summary", "it is important to", "comprehensive", "multifaceted", "nuanced approach".
3. Use contractions naturally: don't, isn't, it's, they're, we've, hasn't.
4. Add specific, concrete details or examples to replace vague generalizations.
5. Use occasional rhetorical questions or em-dashes — like this — to create rhythm variation.
6. Preserve ALL factual content, citations, technical terms, and the original meaning exactly.
7. Do NOT add any new facts or change the argument being made.
8. Write in ${mode} style.
9. Output ONLY the rewritten text. No preamble, no explanation.

INTENSITY GUIDANCE (${intensity}/10):
- 1-3: Light touch. Keep 70% of original phrasing, fix obvious AI patterns only.
- 4-6: Medium. Restructure 50% of sentences, add variety, remove all AI clichés.
- 7-9: Heavy. Restructure 80%+ of text, high burstiness, conversational markers.
- 10: Maximum. Complete rewrite optimized to defeat Turnitin bypasser detection. Aggressive restructuring.

Text to humanize:
${text}`
}

export function buildDetectPrompt(text: string, deepScan: boolean): string {
  if (deepScan) {
    return `You are an AI text detector. Analyze the following text and determine if it was written by AI or a human.

For each sentence, provide a JSON analysis.

Return ONLY valid JSON in this exact format:
{
  "overall_score": <0-100, where 100 = definitely AI>,
  "sentences": [
    {
      "text": "<sentence text>",
      "score": <0-100, AI probability>,
      "label": "AI" | "Borderline" | "Human"
    }
  ]
}

Analyze these signals:
- Low perplexity (predictable word choices) = AI
- Low burstiness (uniform sentence structure/length) = AI
- Use of cliché phrases ("Furthermore", "Moreover", "It is worth noting") = AI
- Perfectly parallel structure = AI
- Lack of contractions = AI
- Very consistent sentence length = AI

Text to analyze:
${text}`
  }

  return `You are an AI text detector. Analyze if this text was written by AI or a human.

Return ONLY valid JSON:
{
  "overall_score": <0-100, where 100 = definitely AI>,
  "label": "AI Detected" | "Borderline" | "Human Written",
  "passes_detection": <true if score < 30>
}

Analyze: perplexity, burstiness, AI vocabulary, sentence structure.

Text:
${text}`
}
