import { describe, expect, it } from "vitest";
import { tokenize, tokenizeInline, parseExperienceSubgroups } from "src/utils/markdown";

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
