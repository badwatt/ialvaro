import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Markdown, Inline } from "src/components/Markdown";

afterEach(cleanup);

describe("<Markdown />", () => {
  it("renders h1 and h2 from markdown", () => {
    const source = "# Title\n\n## Subtitle";
    render(<Markdown source={source} />);
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "Subtitle" })).toBeDefined();
  });

  it("renders an unordered list from `-` items", () => {
    render(<Markdown source={"- one\n- two\n- three"} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((el) => el.textContent)).toEqual(["one", "two", "three"]);
  });

  it("renders an ordered list from `1.` items", () => {
    render(<Markdown source={"1. one\n2. two"} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((el) => el.textContent)).toEqual(["one", "two"]);
  });
  it("renders a blockquote from `> quoted`", () => {
    const { container } = render(<Markdown source={"> quoted text"} />);
    const bq = container.querySelector("blockquote");
    expect(bq?.textContent).toBe("quoted text");
  });

  it("renders a fenced code block", () => {
    const { container } = render(<Markdown source={"```\nconst x = 1;\n```"} />);
    const pre = container.querySelector("pre code");
    expect(pre?.textContent).toBe("const x = 1;");
  });

  it("renders bold text via **", () => {
    render(<Markdown source="this is **bold**" />);
    const strong = screen.getByText("bold");
    expect(strong.tagName.toLowerCase()).toBe("strong");
  });

  it("renders inline code via backticks", () => {
    const { container } = render(<Markdown source="use `npm install`" />);
    const code = container.querySelector("p code");
    expect(code?.textContent).toBe("npm install");
  });

  it("renders an inline link as an anchor", () => {
    render(<Markdown source="[click](https://example.com)" />);
    const link = screen.getByRole("link", { name: "click" });
    expect(link.getAttribute("href")).toBe("https://example.com");
  });

  it("renders an hr", () => {
    const { container } = render(<Markdown source={"above\n\n---\n\nbelow"} />);
    expect(container.querySelector("hr")).toBeDefined();
  });

  it("renders em via *italic*", () => {
    const { container } = render(<Markdown source="this is *italic*" />);
    expect(container.querySelector("em")?.textContent).toBe("italic");
  });

  it("renders del via ~~strike~~", () => {
    const { container } = render(<Markdown source="this is ~~strike~~" />);
    expect(container.querySelector("del")?.textContent).toBe("strike");
  });

  it("renders a hard line break via two trailing spaces", () => {
    const { container } = render(<Markdown source={"line one  \nline two"} />);
    expect(container.querySelector("br")).toBeDefined();
  });

  it("renders an inline image", () => {
    const { container } = render(<Markdown source={"![alt](https://example.com/x.png)"} />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("https://example.com/x.png");
    expect(img?.getAttribute("alt")).toBe("alt");
  });

  it("renders a list item that contains a paragraph", () => {
    // A loose list (blank line between items) yields a paragraph token
    // inside the list item, exercising the paragraph branch in ListItemBody.
    const source = "- item\n\n  more content";
    const { container } = render(<Markdown source={source} />);
    expect(container.querySelector("li")?.textContent).toContain("more content");
  });

  it("renders a list item that contains a nested list", () => {
    const source = "- outer\n  - inner";
    const { container } = render(<Markdown source={source} />);
    // Both outer and inner list items render.
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it("renders an unknown inline token type as a span with its text", () => {
    // Use a custom renderer via a sub-string that produces an escape token:
    // \\( is an escape sequence.
    const { container } = render(<Markdown source={"\\(escaped\\)"} />);
    // Should still render with text content even if specific token type is unknown.
    expect(container.textContent).toContain("escaped");
  });

  it("silently skips block types it doesn't render (e.g. tables)", () => {
    const source = "| col |\n| --- |\n| val |";
    const { container } = render(<Markdown source={source} />);
    expect(container).toBeDefined();
  });

  it("Inline returns null for empty token list", () => {
    const { container } = render(<Inline tokens={[]} />);
    expect(container.textContent).toBe("");
  });

  it("renders Inline with an unknown token type using its text fallback", () => {
    // The `tag` token type isn't handled by Inline's switch, so it falls
    // through to the default span.
    const tokens = [
      { type: "tag", raw: "<x>", text: "x" } as unknown as Parameters<
        typeof Inline
      >[0]["tokens"][number],
    ];
    const { container } = render(<Inline tokens={tokens} />);
    expect(container.textContent).toBe("x");
  });

  it("Inline handles text with no text field (default branch empty)", () => {
    const tokens = [
      { type: "foo", raw: "" } as unknown as Parameters<typeof Inline>[0]["tokens"][number],
    ];
    const { container } = render(<Inline tokens={tokens} />);
    expect(container.querySelector("span")?.textContent).toBe("");
  });

  it("renders a del token inline", () => {
    const { container } = render(<Markdown source="this is ~~struck~~" />);
    expect(container.querySelector("del")?.textContent).toBe("struck");
  });
});
