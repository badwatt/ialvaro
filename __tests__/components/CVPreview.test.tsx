import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CVPreview } from "src/components/CVPreview";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<CVPreview />", () => {
  afterEach(cleanup);

  it("returns null when no url and not generating", () => {
    const { container } = render(
      <CVPreview url={null} isGenerating={false} onClose={vi.fn()} onDownload={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders generating state", () => {
    render(<CVPreview url={null} isGenerating={true} onClose={vi.fn()} onDownload={vi.fn()} />);
    expect(screen.getByText("Generating CV...")).toBeDefined();
  });

  it("renders iframe when url ready", () => {
    render(<CVPreview url="blob:test" isGenerating={false} onClose={vi.fn()} onDownload={vi.fn()} />);
    expect(screen.getByTitle("CV Preview")).toBeDefined();
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    render(<CVPreview url="blob:test" isGenerating={false} onClose={onClose} onDownload={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Close preview"));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onDownload when download button clicked", () => {
    const onDownload = vi.fn();
    render(<CVPreview url="blob:test" isGenerating={false} onClose={vi.fn()} onDownload={onDownload} />);
    const btn = screen.getByText("Download");
    fireEvent.click(btn);
    expect(onDownload).toHaveBeenCalled();
  });

  it("disables download button when no url", () => {
    const onDownload = vi.fn();
    render(<CVPreview url={null} isGenerating={true} onClose={vi.fn()} onDownload={onDownload} />);
    const btn = screen.getByText("Download");
    expect(btn.hasAttribute("disabled")).toBe(true);
  });
});