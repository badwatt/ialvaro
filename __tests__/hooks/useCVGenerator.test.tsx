import { renderHook, act, waitFor } from "@testing-library/react";
import { pdf } from "@react-pdf/renderer";
import { useCVGenerator } from "src/hooks/useCVGenerator";
import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    pdf: vi.fn().mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
    }),
  };
});

describe("useCVGenerator", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { hostname: "test.dev" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts idle", () => {
    const { result } = renderHook(() => useCVGenerator());
    expect(result.current.state.status).toBe("idle");
  });

  it("transitions to generating then ready", async () => {
    const { result } = renderHook(() => useCVGenerator());

    act(() => {
      result.current.generate();
    });
    expect(result.current.state.status).toBe("generating");

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    if (result.current.state.status === "ready") {
      expect(result.current.state.url).toContain("blob:");
    }
  });

  it("handles generation failure", async () => {
    const originalMock = vi.fn().mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
    });
    vi.mocked(pdf).mockImplementation(originalMock);

    vi.mocked(pdf).mockReturnValue({
      toBlob: vi.fn().mockRejectedValue(new Error("fail")),
    } as unknown as ReturnType<typeof pdf>);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useCVGenerator());

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();

    // Restore original mock for other tests
    vi.mocked(pdf).mockImplementation(originalMock);
  });

  it("download does nothing when not ready", () => {
    const { result } = renderHook(() => useCVGenerator());
    act(() => {
      result.current.download();
    });
    expect(result.current.state.status).toBe("idle");
  });

  it("resets from ready state", async () => {
    const { result } = renderHook(() => useCVGenerator());

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready");
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe("idle");
  });

  it("resets from idle does nothing", () => {
    const { result } = renderHook(() => useCVGenerator());
    act(() => {
      result.current.reset();
    });
    expect(result.current.state.status).toBe("idle");
  });
});