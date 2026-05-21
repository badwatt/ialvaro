import { vi } from "vitest";

export function createObserverMock() {
  let observerCallback: (entries: { isIntersecting: boolean }[]) => void;

  const mock = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
      observerCallback = cb;
    }
  };

  window.IntersectionObserver = mock as unknown as typeof window.IntersectionObserver;

  return {
    get callback() {
      return observerCallback;
    },
  };
}
