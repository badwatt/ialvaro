import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Accordion } from "src/components/Accordion";
import { afterEach, describe, expect, it } from "vitest";

const items = [
  { id: "1", title: "First", content: <p>Content 1</p> },
  { id: "2", title: "Second", content: <p>Content 2</p> },
  { id: "3", title: "Third", content: <p>Content 3</p> },
];

describe("<Accordion />", () => {
  afterEach(cleanup);

  it("renders all item titles", () => {
    render(<Accordion items={items} />);
    expect(screen.getByText("First")).toBeDefined();
    expect(screen.getByText("Second")).toBeDefined();
    expect(screen.getByText("Third")).toBeDefined();
  });

  it("items start collapsed by default", () => {
    render(<Accordion items={items} />);
    const button = screen.getByText("First").closest("button");
    expect(button?.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens item specified by defaultOpenId", () => {
    render(<Accordion items={items} defaultOpenId="2" />);
    const first = screen.getByText("First").closest("button");
    const second = screen.getByText("Second").closest("button");
    expect(first?.getAttribute("aria-expanded")).toBe("false");
    expect(second?.getAttribute("aria-expanded")).toBe("true");
  });

  it("expands item on click", async () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText("First"));
    await waitFor(() => {
      const button = screen.getByText("First").closest("button");
      expect(button?.getAttribute("aria-expanded")).toBe("true");
    });
  });

  it("collapses item on second click", async () => {
    render(<Accordion items={items} />);
    const button = screen.getByText("First").closest("button");
    fireEvent.click(screen.getByText("First"));
    fireEvent.click(screen.getByText("First"));
    await waitFor(() => {
      expect(button?.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("only one item open at a time", async () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText("First"));
    fireEvent.click(screen.getByText("Second"));
    await waitFor(() => {
      expect(screen.getByText("First").closest("button")?.getAttribute("aria-expanded")).toBe(
        "false",
      );
      expect(screen.getByText("Second").closest("button")?.getAttribute("aria-expanded")).toBe(
        "true",
      );
    });
  });
});
