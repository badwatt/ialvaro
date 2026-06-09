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
//
// When the first h1/h2 is followed by a blockquote (a "role + period
// + body" structure, e.g. rsi.md), the heading is treated as the role
// and the blockquote as the period name. In that case the title here
// is the period name and the subtitle is left empty (the role is
// surfaced separately by extractRoleAndPeriod).
export function extractPeriodTitle(
  body: string,
  index: number,
): { title: string; subtitle?: string } {
  const tokens = marked.lexer(normalizeMarkers(body));
  let title: string | undefined;
  let subtitle: string | undefined;
  // Find the first h1/h2 heading.
  let headingIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "heading" && (tokens[i] as Tokens.Heading).depth <= 2) {
      headingIdx = i;
      title = (tokens[i] as Tokens.Heading).text.split("\n")[0]?.trim();
      break;
    }
  }
  // Detect whether the heading is a role (followed by a blockquote) or
  // a period (no blockquote follows). For a role, the title we return
  // is the blockquote text and the subtitle stays empty.
  if (headingIdx >= 0) {
    const nextNonSpace = tokens.slice(headingIdx + 1).find((t) => t.type !== "space");
    if (nextNonSpace?.type === "blockquote") {
      const bqText = (nextNonSpace as Tokens.Blockquote).text.split("\n")[0]?.trim();
      if (bqText) {
        title = bqText;
        // No duration subtitle in the role+period layout.
        return { title, subtitle: undefined };
      }
    }
  }
  // Otherwise (heading is the period) look for a duration blockquote
  // later in the body.
  if (!title) {
    for (const t of tokens) {
      if (t.type === "list") {
        const firstItem = (t as Tokens.List).items[0];
        title = firstItem?.text.split("\n")[0]?.trim();
        break;
      }
    }
  }
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

// Extract the role (job title) and the first period marker from a
// sub-period body. The role is the first h1/h2 when it is immediately
// followed by a blockquote that does NOT look like a duration
// (e.g. "> Devoteam"). In that case the blockquote is the period name
// and the h1/h2 is the role. When the first heading is followed by a
// duration blockquote (e.g. "> 1 year 3 months") the heading itself is
// the period name and the role is left undefined.
//
// Examples:
//   "# Full Stack Developer\n> Devoteam"      → role="Full Stack Developer", period="Devoteam"
//   "# Plexus\n> 1 year 3 months"              → period="Plexus" (no role)
//   "## CEO & Founder\n- item"                 → period="CEO & Founder" (no role)
export function extractRoleAndPeriod(body: string): { role?: string; period?: string } {
  const tokens = marked.lexer(normalizeMarkers(body));
  let headingIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === "heading" && (tokens[i] as Tokens.Heading).depth <= 2) {
      headingIdx = i;
      break;
    }
  }
  if (headingIdx < 0) return { role: undefined, period: undefined };
  const headingText = (tokens[headingIdx] as Tokens.Heading).text.split("\n")[0]?.trim();
  // Look at the next non-space token after the heading.
  const nextNonSpace = tokens.slice(headingIdx + 1).find((t) => t.type !== "space");
  if (nextNonSpace?.type === "blockquote") {
    const bqText = (nextNonSpace as Tokens.Blockquote).text.split("\n")[0]?.trim();
    if (bqText && !isDurationText(bqText)) {
      return { role: headingText, period: bqText };
    }
  }
  return { role: undefined, period: headingText };
}

// Heuristic: a blockquote text is a duration when it contains a digit
// or a duration keyword. Used by extractRoleAndPeriod to distinguish
// a period-name blockquote (e.g. "Devoteam") from a duration blockquote
// (e.g. "1 year 3 months" or "2y 3m").
function isDurationText(text: string): boolean {
  return /\d|\byears?\b|\bmonths?\b/i.test(text);
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
