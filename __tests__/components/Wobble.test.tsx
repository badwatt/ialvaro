import { cleanup, render } from "@testing-library/react";
import { Wobble } from "src/components/Wobble";
import { afterEach, describe, expect, it } from "vitest";

describe("<Wobble />", () => {
  afterEach(cleanup);

  it("renders each letter as a span", () => {
    const { container } = render(<Wobble sentence="ALVARO" />);
    const spans = container.querySelectorAll("span[aria-label='wobble']");
    expect(spans.length).toBe(6);
  });

  it("renders non-breaking space for spaces", () => {
    const { container } = render(<Wobble sentence="AL VARO" />);
    expect(container.textContent).toContain("\u00A0");
  });

  it("renders all letters with correct aria-label", () => {
    const { container } = render(<Wobble sentence="GO" />);
    const spans = container.querySelectorAll("span[aria-label='wobble']");
    expect(spans.length).toBe(2);
  });

  it("applies rubber-band class", () => {
    const { container } = render(<Wobble sentence="A" />);
    const span = container.querySelector("span[aria-label='wobble']");
    expect(span?.className).toContain("rubber-band");
  });

  it("renders line break", () => {
    const { container } = render(<Wobble sentence="OK" />);
    expect(container.querySelector("br")).toBeDefined();
  });

  it("renders long sentence", () => {
    const { container } = render(<Wobble sentence="ALVARO GARCIA MACIAS" />);
    const spans = container.querySelectorAll("span[aria-label='wobble']");
    // 6 + 1 space + 6 + 1 space + 6 = 20 letters (spaces become spans with \u00A0)
    expect(spans.length).toBe(20);
  });

  it("has hover color transition", () => {
    const { container } = render(<Wobble sentence="A" />);
    const span = container.querySelector("span[aria-label='wobble']");
    expect(span?.className).toContain("hover:text-alvaro-primary");
  });

  it("matches snapshot", () => {
    const { container } = render(<Wobble sentence="ALVARO" />);
    expect(container).toMatchSnapshot();
  });
});
