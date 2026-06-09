import { marked, type Token, type Tokens } from "marked";

export type { Token };

// Convert common Unicode list markers to markdown's `-` so marked can lex
// them as a list. We only replace at the start of a line so we don't
// touch bullets that happen to appear inside a word.
function normalizeMarkers(text: string): string {
  return text.replace(/^[ \t]*[\u2022\u2023\u2043\u204C\u204D\u2219\u25E6\u00B7][ \t]+/gm, "- ");
}

export function tokenize(text: string): Token[] {
  return marked.lexer(normalizeMarkers(text));
}

export function tokenizeInline(text: string): Tokens.Generic[] {
  // Extract inline tokens from the block-level lex output. For typical
  // text input, the result is a single paragraph whose `.tokens` hold the
  // inline children. Fall back to a single text token otherwise.
  const tokens = marked.lexer(normalizeMarkers(text));
  for (const t of tokens) {
    if (t.type === "paragraph" && t.tokens) {
      return t.tokens as Tokens.Generic[];
    }
  }
  return [{ type: "text", raw: text, text } as Tokens.Generic];
}
