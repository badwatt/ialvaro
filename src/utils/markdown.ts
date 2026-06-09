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

// Split a markdown body on horizontal rules (`---` lines at block level).
// Used by the experience view to split a job into multiple sub-periods.
// Returns an array of subgroup bodies. Lines between two `---` become one
// subgroup; an empty subgroup is dropped.
export function parseExperienceSubgroups(text: string): string[] {
  const tokens = marked.lexer(normalizeMarkers(text));
  const groups: string[][] = [[]];
  for (const t of tokens) {
    if (t.type === "hr") {
      groups.push([]);
      continue;
    }
    groups[groups.length - 1].push((t as { raw: string }).raw);
  }
  return groups.map((g) => g.join("\n").trim()).filter((g) => g.length > 0);
}

// Extract a human-friendly title and optional subtitle for a sub-period
// body. The title is the first `#` (h1) or `##` (h2) heading in the
// body, the subtitle is the first blockquote's text. Falls back to the
// first list item when no h1/h2 is present, then to `Period N`.
export function extractPeriodTitle(
  body: string,
  index: number,
): { title: string; subtitle?: string } {
  const tokens = marked.lexer(normalizeMarkers(body));
  let title: string | undefined;
  let subtitle: string | undefined;
  // First pass: the first h1 (`#`) or h2 (`##`) heading is the canonical
  // period title.
  for (const t of tokens) {
    if (t.type === "heading" && (t as Tokens.Heading).depth <= 2) {
      title = (t as Tokens.Heading).text.split("\n")[0]?.trim();
      break;
    }
  }
  // Second pass: fall back to the first list item if no heading was
  // found.
  if (!title) {
    for (const t of tokens) {
      if (t.type === "list") {
        const firstItem = (t as Tokens.List).items[0];
        title = firstItem?.text.split("\n")[0]?.trim();
        break;
      }
    }
  }
  // Subtitle: the first blockquote's text (typically a duration like
  // "1 year 3 months").
  for (const t of tokens) {
    if (t.type === "blockquote") {
      subtitle = (t as Tokens.Blockquote).text.split("\n")[0]?.trim();
      break;
    }
  }
  return {
    title: title ?? `Period ${index + 1}`,
    subtitle: subtitle || undefined,
  };
}

// Strip the markdown lines that were extracted as the period title
// (first h1) and subtitle (first blockquote) so the body of a
// sub-accordion item does not duplicate the title already shown in
// its header. Falls back to the original body when nothing was
// extracted (so list-item fallbacks still render the original text).
export function stripExtractedTitleAndSubtitle(body: string): string {
  const tokens = marked.lexer(normalizeMarkers(body));
  const skipTypes = new Set<string>();
  let sawH1 = false;
  let sawFirstBlockquote = false;
  for (const t of tokens) {
    if (t.type === "heading" && (t as Tokens.Heading).depth === 1 && !sawH1) {
      skipTypes.add(t.raw);
      sawH1 = true;
    } else if (t.type === "blockquote" && !sawFirstBlockquote) {
      skipTypes.add(t.raw);
      sawFirstBlockquote = true;
    }
  }
  if (skipTypes.size === 0) return body;
  const lines = body.split("\n");
  const kept: string[] = [];
  let skipping = false;
  for (const line of lines) {
    if (skipTypes.has(line)) {
      skipping = true;
      continue;
    }
    if (skipping && line.trim() === "") continue;
    skipping = false;
    kept.push(line);
  }
  return kept.join("\n").trim();
}
