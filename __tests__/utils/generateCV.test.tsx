import { describe, expect, it, vi } from "vitest";

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    pdf: vi.fn().mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
    }),
  };
});

describe("generateAndOpenCV", () => {
  it("generates PDF blob and opens in new tab", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV();
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining("blob:"), "_blank");
    openSpy.mockRestore();
  });
});