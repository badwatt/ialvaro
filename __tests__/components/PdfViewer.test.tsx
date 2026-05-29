import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PdfViewer } from "src/components/PdfViewer";

vi.mock("src/components/PdfCanvas", () => ({
  PdfCanvas: ({ src }: { src: string }) => (
    <div data-testid="pdf-canvas" data-src={src}>
      PDF Canvas
    </div>
  ),
}));

describe("PdfViewer", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders nothing when closed", () => {
    render(<PdfViewer src="blob:test" isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("pdf-canvas")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders PdfCanvas when open", () => {
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("pdf-canvas")).toBeDefined();
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-src")).toBe("blob:test");
  });

  it("shows header title and close button", () => {
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("CV Preview")).toBeDefined();
    expect(screen.getByLabelText("Close preview")).toBeDefined();
    expect(screen.getByLabelText("Download CV")).toBeDefined();
  });

  it("calls onClose when close button clicked", () => {
    const onClose = vi.fn();
    render(<PdfViewer src="blob:test" isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Close preview"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("download link uses src and fileName", () => {
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} fileName="my-cv.pdf" />);
    const link = screen.getByLabelText("Download CV") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("blob:test");
    expect(link.getAttribute("download")).toBe("my-cv.pdf");
  });

  it("uses default fileName when none provided", () => {
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    const link = screen.getByLabelText("Download CV") as HTMLAnchorElement;
    expect(link.getAttribute("download")).toBe("cv.pdf");
  });

  it("clicking backdrop closes modal", () => {
    const onClose = vi.fn();
    render(<PdfViewer src="blob:test" isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("pressing Escape closes modal", () => {
    const onClose = vi.fn();
    render(<PdfViewer src="blob:test" isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("blocks body scroll when open", () => {
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("snapshot", () => {
    const { container } = render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
