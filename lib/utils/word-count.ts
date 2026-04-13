export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0
  return text.trim().split(/\s+/).length
}

export function countCharacters(text: string): number {
  return text.length
}

export function truncateText(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ')
}
