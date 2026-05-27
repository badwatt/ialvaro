import { act, cleanup, render } from "@testing-library/react";
import { useScrollReveal } from "src/hooks/useScrollReveal";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let observeMock: ReturnType<typeof vi.fn>;
let disconnectMock: ReturnType<typeof vi.fn>;
let observerCallback: (entries: { isIntersecting: boolean }[]) => void;

function HookTester({ once }: { once?: boolean }) {
  const { ref, isVisible } = useScrollReveal({ once });
  return (
    <div ref={ref} data-testid="el" data-visible={isVisible}>
      {isVisible ? "visible" : "hidden"}
    </div>
  );
}

function NullRefTester() {
  useScrollReveal();
  return <div>no ref</div>;
}

describe("useScrollReveal", () => {
  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();
    window.IntersectionObserver = class {
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
      constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
        observerCallback = cb;
      }
    } as unknown as typeof window.IntersectionObserver;
  });

  afterEach(cleanup);

  it("starts with isVisible=false", () => {
    const { getByTestId } = render(<HookTester />);
    expect(getByTestId("el").dataset.visible).toBe("false");
  });

  it("sets isVisible=true on intersect, disconnects when once=true", () => {
    const { getByTestId } = render(<HookTester />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(getByTestId("el").dataset.visible).toBe("true");
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("with once=false does not disconnect on intersect", () => {
    const { getByTestId } = render(<HookTester once={false} />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    expect(getByTestId("el").dataset.visible).toBe("true");
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  it("with once=false toggles back to false when not intersecting", () => {
    const { getByTestId } = render(<HookTester once={false} />);
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });
    expect(getByTestId("el").dataset.visible).toBe("false");
  });

  it("with once=true ignores non-intersecting entry", () => {
    const { getByTestId } = render(<HookTester once={true} />);
    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });
    expect(getByTestId("el").dataset.visible).toBe("false");
    expect(disconnectMock).not.toHaveBeenCalled();
  });

  it("disconnects on unmount", () => {
    const { unmount } = render(<HookTester />);
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("handles null ref gracefully", () => {
    render(<NullRefTester />);
    expect(observeMock).not.toHaveBeenCalled();
  });
});
