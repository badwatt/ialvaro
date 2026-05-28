import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CVPreview } from "src/components/CVPreview";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<CVPreview />", () => {
  afterEach(cleanup);

  it("returns null when no url and not generating", () => {
    const { container } = render(
      <CVPreview url={null} isGenerating={false} onClose={vi.fn()} onDownload={vi.fn()} domain="test.dev" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders generating state", () => {
    render(<CVPreview url={null} isGenerating={true} onClose={vi.fn()} onDownload={vi.fn()} domain="test.dev" />);
    expect(screen.getByText("Generating CV...")).toBeDefined();
  });

  it("renders HTML preview when url ready", () => {
    render(<CVPreview url="blob:test" isGenerating={false} onClose={vi.fn()} onDownload={vi.fn()} domain="test.dev" />);
    expect(screen.getByText("Alvaro Garcia Macias")).toBeDefined();
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    render(<CVPreview url="blob:test" isGenerating={false} onClose={onClose} onDownload={vi.fn()} domain="test.dev" />);
    fireEvent.click(screen.getByLabelText("Close preview"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onDownload when download button clicked", () => {
    const onDownload = vi.fn();
    render(<CVPreview url="blob:test" isGenerating={false} onClose={vi.fn()} onDownload={onDownload} domain="test.dev" />);
    const btn = screen.getByText("Download");
    fireEvent.click(btn);
    expect(onDownload).toHaveBeenCalled();
  });

  it("disables download button when no url", () => {
    const onDownload = vi.fn();
    render(<CVPreview url={null} isGenerating={true} onClose={vi.fn()} onDownload={onDownload} domain="test.dev" />);
    const btn = screen.getByText("Download");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("locks body scroll on mount and restores on unmount", () => {
    const original = document.body.style.overflow;
    const { unmount } = render(
      <CVPreview url="blob:test" isGenerating={false} onClose={vi.fn()} onDownload={vi.fn()} domain="test.dev" />
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe(original);
  });

  it("has fullscreen classes for mobile", () => {
    const { container } = render(
      <CVPreview url="http://test/cv.pdf" isGenerating={false} onClose={vi.fn()} onDownload={vi.fn()} domain="test.dev" />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("p-0");
    expect(wrapper.className).toContain("md:p-8");
    const modal = wrapper.querySelector(".bg-alvaro-surface") as HTMLElement;
    expect(modal.className).toContain("rounded-none");
    expect(modal.className).toContain("md:rounded-2xl");
  });
});