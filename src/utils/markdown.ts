import { marked, type Token, type Tokens } from "marked";

export type { Token };

export function tokenize(text: string): Token[] {
  return marked.lexer(text);
}

export function tokenizeInline(text: string): Tokens.Generic[] {
  // Extract inline tokens from the block-level lex output. For typical
  // text input, the result is a single paragraph whose `.tokens` hold the
  // inline children. Fall back to a single text token otherwise.
  const tokens = marked.lexer(text);
  for (const t of tokens) {
    if (t.type === "paragraph" && t.tokens) {
      return t.tokens as Tokens.Generic[];
    }
  }
  return [{ type: "text", raw: text, text } as Tokens.Generic];
}
