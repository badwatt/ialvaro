import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PdfViewer } from "src/components/PdfViewer";

vi.mock("src/components/PdfCanvas", () => ({
  PdfCanvas: ({ src, zoom }: { src: string; zoom?: number }) => (
    <div data-testid="pdf-canvas" data-src={src} data-zoom={zoom}>
      PDF Canvas
    </div>
  ),
}));

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

describe("PdfViewer", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it("shows zoom controls", () => {
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByLabelText("Zoom in")).toBeDefined();
    expect(screen.getByLabelText("Zoom out")).toBeDefined();
  });

  it("defaults to 50% zoom on desktop", () => {
    mockMatchMedia(true);
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("50%")).toBeDefined();
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("0.5");
  });

  it("defaults to 100% zoom on mobile", () => {
    mockMatchMedia(false);
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText("100%")).toBeDefined();
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("1");
  });

  it("zooms in when button clicked", () => {
    mockMatchMedia(false);
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("1.2");
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("1.4");
  });

  it("zooms out when button clicked", () => {
    mockMatchMedia(false);
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("0.8");
    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("0.6");
  });

  it("caps zoom at 0.5 minimum", () => {
    mockMatchMedia(false);
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    for (let i = 0; i < 10; i++) {
      fireEvent.click(screen.getByLabelText("Zoom out"));
    }
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("0.5");
  });

  it("caps zoom at 3 maximum", () => {
    mockMatchMedia(false);
    render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    for (let i = 0; i < 20; i++) {
      fireEvent.click(screen.getByLabelText("Zoom in"));
    }
    expect(screen.getByTestId("pdf-canvas").getAttribute("data-zoom")).toBe("3");
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
    mockMatchMedia(true);
    const { container } = render(<PdfViewer src="blob:test" isOpen={true} onClose={vi.fn()} />);
    expect(container).toMatchSnapshot();
  });
});
