import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { usePdfPages, loadPdfPages } from "src/hooks/usePdfPages";

function TestComponent(props: Parameters<typeof usePdfPages>[0]) {
  const { loading, error } = usePdfPages(props);
  return (
    <div data-testid="state">
      {error ?? (loading ? "loading" : "done")}
    </div>
  );
}

function createMockPdf(numPages = 2) {
  return {
    numPages,
    getPage: vi.fn().mockResolvedValue({
      getViewport: () => ({ width: 100, height: 100 }),
      cleanup: vi.fn(),
    }),
  };
}

function createMockTask(pdf: ReturnType<typeof createMockPdf>) {
  return {
    promise: Promise.resolve(pdf),
    destroy: vi.fn(),
  };
}

describe("usePdfPages", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts loading and resolves", async () => {
    const pdf = createMockPdf(1);
    const getDocument = vi.fn().mockReturnValue(createMockTask(pdf));
    const renderPage = vi.fn().mockResolvedValue(undefined);
    const container = document.createElement("div");

    render(
      <TestComponent
        src="blob:test"
        containerRef={{ current: container }}
        getDocument={getDocument}
        renderPage={renderPage}
      />,
    );

    expect(screen.getByTestId("state").textContent).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("done");
    });

    expect(getDocument).toHaveBeenCalledWith("blob:test");
    expect(renderPage).toHaveBeenCalled();
    expect(renderPage).toHaveBeenCalledTimes(1);
    expect(pdf.getPage).toHaveBeenCalledWith(1);
    expect(container.querySelectorAll("canvas").length).toBe(1);
  });

  it("handles null containerRef", async () => {
    const pdf = createMockPdf(1);
    const getDocument = vi.fn().mockReturnValue(createMockTask(pdf));
    const renderPage = vi.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        src="blob:test"
        containerRef={{ current: null }}
        getDocument={getDocument}
        renderPage={renderPage}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe("done");
    });

    expect(renderPage).toHaveBeenCalled();
  });

  it("handles empty src", () => {
    render(
      <TestComponent
        src=""
        containerRef={{ current: document.createElement("div") }}
        getDocument={vi.fn()}
        renderPage={vi.fn()}
      />,
    );
    expect(screen.getByTestId("state").textContent).toBe("loading");
  });

  it("handles load error", async () => {
    const getDocument = vi.fn().mockReturnValue({
      promise: Promise.reject(new Error("fail")),
      destroy: vi.fn(),
    });
    const renderPage = vi.fn().mockResolvedValue(undefined);

    render(
      <TestComponent
        src="blob:test"
        containerRef={{ current: document.createElement("div") }}
        getDocument={getDocument}
        renderPage={renderPage}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toBe(
        "Failed to load PDF preview.");
    });

    expect(renderPage).not.toHaveBeenCalled();
  });

  it("ignores success after src change", async () => {
    const pdf = createMockPdf(1);
    const getDocument = vi.fn().mockReturnValue(createMockTask(pdf));
    const renderPage = vi.fn().mockImplementation(
      () => new Promise((r) => setTimeout(r, 200)),
    );
    const container = document.createElement("div");

    const { rerender } = render(
      <TestComponent
        src="blob:test"
        containerRef={{ current: container }}
        getDocument={getDocument}
        renderPage={renderPage}
      />,
    );

    await new Promise((r) => setTimeout(r, 50));

    rerender(
      <TestComponent
        src=""
        containerRef={{ current: container }}
        getDocument={getDocument}
        renderPage={renderPage}
      />,
    );

    await new Promise((r) => setTimeout(r, 300));
  });

  it("ignores error after unmount", async () => {
    let rejectPromise: ((reason: unknown) => void) | undefined;
    const task = {
      promise: new Promise((_resolve, r) => {
        rejectPromise = r;
      }),
      destroy: vi.fn(),
    };
    const getDocument = vi.fn().mockReturnValue(task);
    const renderPage = vi.fn().mockResolvedValue(undefined);

    const { unmount } = render(
      <TestComponent
        src="blob:test"
        containerRef={{ current: document.createElement("div") }}
        getDocument={getDocument}
        renderPage={renderPage}
      />,
    );

    unmount();
    await new Promise((r) => setTimeout(r, 0));
    rejectPromise?.(new Error("fail"));
    await new Promise((r) => setTimeout(r, 100));

    expect(task.destroy).toHaveBeenCalled();
  });

  it("destroys task on unmount", () => {
    const task = createMockTask(createMockPdf(1));
    const getDocument = vi.fn().mockReturnValue(task);

    const { unmount } = render(
      <TestComponent
        src="blob:test"
        containerRef={{ current: document.createElement("div") }}
        getDocument={getDocument}
        renderPage={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    unmount();
    expect(task.destroy).toHaveBeenCalled();
  });
});

describe("loadPdfPages", () => {
  it("renders zero pages", async () => {
    const pdf = { numPages: 0, getPage: vi.fn() };
    const task = createMockTask(pdf as any) as any;
    const renderPage = vi.fn().mockResolvedValue(undefined);
    const container = document.createElement("div");

    await loadPdfPages(task, container, renderPage);

    expect(container.querySelectorAll("canvas").length).toBe(0);
    expect(renderPage).not.toHaveBeenCalled();
  });

  it("renders all pages into container", async () => {
    const pdf = createMockPdf(3);
    const task = createMockTask(pdf) as any;
    const renderPage = vi.fn().mockResolvedValue(undefined);
    const container = document.createElement("div");

    await loadPdfPages(task, container, renderPage);

    expect(container.querySelectorAll("canvas").length).toBe(3);
    expect(renderPage).toHaveBeenCalledTimes(3);
    expect(pdf.getPage).toHaveBeenCalledWith(1);
    expect(pdf.getPage).toHaveBeenCalledWith(2);
    expect(pdf.getPage).toHaveBeenCalledWith(3);
  });

  it("clears previous container content", async () => {
    const pdf = createMockPdf(1);
    const task = createMockTask(pdf) as any;
    const container = document.createElement("div");
    container.appendChild(document.createElement("span"));

    await loadPdfPages(task, container, vi.fn().mockResolvedValue(undefined));

    expect(container.querySelector("span")).toBeNull();
    expect(container.querySelectorAll("canvas").length).toBe(1);
  });
});
