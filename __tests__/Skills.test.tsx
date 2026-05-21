import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Skills } from "src/views/Skills";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createObserverMock } from "./helpers/observerMock";

describe("<Skills />", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });
  afterEach(cleanup);

  it("should render a heading", () => {
    render(<Skills />);
    expect(screen.getByRole("heading", { name: /skills/i })).toBeDefined();
  });

  it("should show first 12 skills by default", () => {
    render(<Skills />);
    expect(screen.getAllByLabelText(/skill/i).length).toBe(12);
  });

  it("should reveal all skills on Show more", () => {
    render(<Skills />);
    const btn = screen.getByText(/show more/i);
    expect(btn.classList.contains("cursor-pointer")).toBe(true);
    fireEvent.click(btn);
    expect(screen.getAllByLabelText(/skill/i).length).toBe(17);
    expect(screen.getByText(/show less/i)).toBeDefined();
  });

  it("should collapse back on Show less", () => {
    render(<Skills />);
    fireEvent.click(screen.getByText(/show more/i));
    fireEvent.click(screen.getByText(/show less/i));
    expect(screen.getAllByLabelText(/skill/i).length).toBe(12);
  });

  it("skills become visible when intersecting", () => {
    render(<Skills />);
    const skill = screen.getAllByLabelText(/skill:/i)[0];
    expect(skill.className).toContain("opacity-0");

    act(() => {
      observer.callback([{ isIntersecting: true }]);
    });
    expect(skill.className).toContain("opacity-100");
  });

  it("matches snapshot", () => {
    const { container } = render(<Skills />);
    expect(container).toMatchSnapshot();
  });
});
