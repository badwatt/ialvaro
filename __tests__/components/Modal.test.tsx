import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Modal, lockBodyScroll } from "src/components/Modal";

describe("Modal", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  it("locks scroll and returns unlocker", () => {
    document.body.style.overflow = "auto";
    const unlock = lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");
    unlock();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("renders nothing when closed", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <span data-testid="content">content</span>
      </Modal>,
    );
    expect(screen.queryByTestId("content")).toBeNull();
    expect(screen.queryByTestId("modal-backdrop")).toBeNull();
  });

  it("renders children when open", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <span data-testid="content">content</span>
      </Modal>,
    );
    expect(screen.getByTestId("content")).toBeDefined();
  });

  it("blocks body scroll when open", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("restores body scroll on unmount", () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores previous overflow value on close", () => {
    document.body.style.overflow = "auto";
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        content
      </Modal>,
    );
    expect(document.body.style.overflow).toBe("auto");
  });

  it("calls onClose when Escape key pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not listen to Escape after closing", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal isOpen={true} onClose={onClose}>
        content
      </Modal>,
    );
    rerender(
      <Modal isOpen={false} onClose={onClose}>
        content
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(0);
  });

  it("calls onClose when backdrop clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div data-testid="panel-inner">inner</div>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-backdrop"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not call onClose when panel content clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <button type="button">btn</button>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("has dialog role with aria-modal", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} ariaLabel="test dialog">
        content
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-label")).toBe("test dialog");
  });

  it("panel is focusable via tabIndex", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    const panel = screen.getByRole("dialog");
    expect(panel.getAttribute("tabindex")).toBe("-1");
  });

  it("applies custom className to panel", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} className="my-class">
        content
      </Modal>,
    );
    const panel = screen.getByRole("dialog");
    expect(panel.className).toContain("my-class");
  });

  it("uses responsive classes for desktop", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    const panel = screen.getByRole("dialog");
    expect(panel.className).toContain("md:w-[90vw]");
    expect(panel.className).toContain("md:h-[85vh]");
    expect(panel.className).toContain("md:rounded-3xl");
  });

  it("uses full screen classes for mobile", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        content
      </Modal>,
    );
    const panel = screen.getByRole("dialog");
    expect(panel.className).toContain("w-full");
    expect(panel.className).toContain("h-full");
    expect(panel.className).toContain("rounded-none");
  });

  it("does not call onClose when panel itself clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}><div>content</div></Modal>,
    );
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
