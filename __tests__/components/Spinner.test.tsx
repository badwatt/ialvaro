import { render, screen } from "@testing-library/react";
import { Spinner } from "src/components/Spinner";
import { describe, expect, it } from "vitest";

describe("Spinner", () => {
  it("renders the spinner", () => {
    render(<Spinner />);
    expect(screen.getByTitle("Loading")).toBeDefined();
  });

  it("renders the loading text", () => {
    render(<Spinner />);
    expect(screen.getAllByText("Loading")).toHaveLength(2);
  });
});
