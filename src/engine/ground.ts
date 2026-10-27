// Grounding: a highlight ships only if its quote is a real substring of the extracted text.
export interface Span {
  start: number;
  end: number;
  quote: string;
}

export function groundQuotes(text: string, quotes: readonly (string | null)[]): Span[] {
  const spans: Span[] = [];
  for (const q of quotes) {
    if (!q) continue;
    const start = text.indexOf(q);
    if (start < 0) continue; // ungrounded highlight is dropped, never approximated
    spans.push({ start, end: start + q.length, quote: q });
  }
  return spans.sort((a, b) => a.start - b.start);
}
