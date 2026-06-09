import { describe, expect, it } from "vitest";
import {
  tokenize,
  tokenizeInline,
  parseExperienceSubgroups,
  extractPeriodTitle,
  extractRoleAndPeriod,
  stripExtractedTitleAndSubtitle,
} from "src/utils/markdown";

describe("tokenize", () => {
  it("returns an empty-ish array for empty input", () => {
    const result = tokenize("");
    expect(result.every((t) => t.type === "space")).toBe(true);
  });

  it("detects a single heading", () => {
    const result = tokenize("# Hello");
    expect(result.some((t) => t.type === "heading")).toBe(true);
  });

  it("detects an unordered list", () => {
    const result = tokenize("- a\n- b");
    const list = result.find((t) => t.type === "list");
    expect(list).toBeDefined();
  });
});

describe("tokenizeInline", () => {
  it("returns inline text tokens for plain text", () => {
    const tokens = tokenizeInline("hello world");
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].type).toBe("text");
  });

  it("identifies a strong inline token", () => {
    const tokens = tokenizeInline("**bold**");
    expect(tokens.some((t) => t.type === "strong")).toBe(true);
  });

  it("identifies an em inline token", () => {
    const tokens = tokenizeInline("*italic*");
    expect(tokens.some((t) => t.type === "em")).toBe(true);
  });

  it("identifies a codespan inline token", () => {
    const tokens = tokenizeInline("`code`");
    expect(tokens.some((t) => t.type === "codespan")).toBe(true);
  });

  it("falls back to a text token for non-paragraph input", () => {
    // Pure list input lexes to a list block, not a paragraph; tokenizeInline
    // should fall back to wrapping the raw text in a generic text token.
    const tokens = tokenizeInline("- one");
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens[0].type).toBe("text");
  });
});

describe("extractPeriodTitle", () => {
  it("uses the first `#` heading as the title", () => {
    const r = extractPeriodTitle("# Consulting Firm:\n\n- PLEXUS\n\n> 1 year 3 months", 0);
    expect(r.title).toBe("Consulting Firm:");
    expect(r.subtitle).toBe("1 year 3 months");
  });

  it("accepts a `##` (h2) heading as the title when no h1 is present", () => {
    // E.g. azama.md uses `## CEO & Founder` as the section heading.
    const r = extractPeriodTitle("## CEO & Founder\n\n- item", 0);
    expect(r.title).toBe("CEO & Founder");
  });

  it("treats a role+period pair (h1 followed by blockquote) as period=blockquote", () => {
    // E.g. rsi.md uses `# Full Stack Developer` as the role and
    // `> Devoteam` as the period name. The role is surfaced separately
    // by extractRoleAndPeriod; the period title here is the blockquote.
    const r = extractPeriodTitle(
      "# Full Stack Developer\n\n> Devoteam\n\n## Projects\n\n- Onboarding",
      0,
    );
    expect(r.title).toBe("Devoteam");
    expect(r.subtitle).toBeUndefined();
  });

  it("keeps the heading as the period when the blockquote is empty", () => {
    // Edge case: an h1 followed by an empty blockquote. The empty
    // blockquote should not overwrite the heading; the heading stays
    // as the period title.
    const r = extractPeriodTitle("# Plexus\n\n>\n\nbody", 0);
    expect(r.title).toBe("Plexus");
  });

  it("falls back to the first list item when no heading is present", () => {
    const r = extractPeriodTitle("- PLEXUS\n\n> 1 year 3 months", 0);
    expect(r.title).toBe("PLEXUS");
  });

  it("uses the period index as a last-resort title", () => {
    const r = extractPeriodTitle("just body", 4);
    expect(r.title).toBe("Period 5");
  });
});

describe("extractRoleAndPeriod", () => {
  it("extracts a role+period pair from an h1 + blockquote body", () => {
    const r = extractRoleAndPeriod("# Full Stack Developer\n\n> Devoteam\n\nbody");
    expect(r.role).toBe("Full Stack Developer");
    expect(r.period).toBe("Devoteam");
  });

  it("extracts a role+period pair from an h2 + blockquote body", () => {
    const r = extractRoleAndPeriod("## CEO\n\n> Period name\n\nbody");
    expect(r.role).toBe("CEO");
    expect(r.period).toBe("Period name");
  });

  it("treats the heading itself as the period when no blockquote follows", () => {
    // E.g. openbank.md uses `# Plexus` as the period with no role.
    const r = extractRoleAndPeriod("# Plexus\n\n> 1 year 3 months\n\nbody");
    expect(r.role).toBeUndefined();
    expect(r.period).toBe("Plexus");
  });

  it("returns nothing for a body with no headings or blockquotes", () => {
    const r = extractRoleAndPeriod("just body text");
    expect(r.role).toBeUndefined();
    expect(r.period).toBeUndefined();
  });
});

describe("stripExtractedTitleAndSubtitle", () => {
  it("removes the first h1 heading from the body", () => {
    const body = "# Title\n\nbody text";
    expect(stripExtractedTitleAndSubtitle(body)).toBe("body text");
  });

  it("removes the first blockquote (subtitle) from the body", () => {
    const body = "> 1 year 3 months\n\nbody text";
    expect(stripExtractedTitleAndSubtitle(body)).toBe("body text");
  });

  it("removes both the first h1 and the first blockquote", () => {
    const body = "# Title\n\n> duration\n\nbody text";
    expect(stripExtractedTitleAndSubtitle(body)).toBe("body text");
  });

  it("returns the body unchanged when no h1 or blockquote is present", () => {
    const body = "just plain text\n\nno headings or quotes";
    expect(stripExtractedTitleAndSubtitle(body)).toBe(body);
  });
});

describe("parseExperienceSubgroups", () => {
  it("returns the body as a single subgroup when there is no `---`", () => {
    const result = parseExperienceSubgroups("just one body");
    expect(result).toEqual(["just one body"]);
  });

  it("splits a body on `---` horizontal rules into multiple subgroups", () => {
    const result = parseExperienceSubgroups("first period\n\n---\n\nsecond period");
    expect(result).toEqual(["first period", "second period"]);
  });

  it("drops empty subgroups produced by leading or trailing `---`", () => {
    const result = parseExperienceSubgroups("---\n\nmiddle\n\n---\n");
    expect(result).toEqual(["middle"]);
  });
});
