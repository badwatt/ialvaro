export const mockIntersectionObserver = () => {
  window.IntersectionObserver = class IntersectionObserver {
    observe() {
      return null;
    }
    unobserve() {
      return null;
    }
    disconnect() {
      return null;
    }
  } as unknown as typeof window.IntersectionObserver;
};
