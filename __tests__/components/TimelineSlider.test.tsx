import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TimelineSlider } from "src/components/TimelineSlider";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<TimelineSlider />", () => {
  afterEach(cleanup);

  it("renders with labels", () => {
    render(
      <TimelineSlider value={50} onChange={() => {}} min={0} max={100} positions={[0, 50, 100]} />,
    );
    expect(screen.getByText("Short")).toBeDefined();
    expect(screen.getByText("Long")).toBeDefined();
  });

  it("renders a range input", () => {
    render(
      <TimelineSlider value={50} onChange={() => {}} min={0} max={100} positions={[0, 50, 100]} />,
    );
    expect(screen.getByRole("slider")).toBeDefined();
  });

  it("calls onChange when value changes", () => {
    const onChange = vi.fn();
    render(
      <TimelineSlider value={50} onChange={onChange} min={0} max={100} positions={[0, 50, 100]} />,
    );
    fireEvent.change(screen.getByRole("slider"), {
      target: { value: "75" },
    });
    expect(onChange).toHaveBeenCalledWith(75);
  });
});
