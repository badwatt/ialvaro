import { describe, expect, it, vi } from "vitest";

const mockOutput = vi.fn().mockReturnValue(new Blob(["pdf"], { type: "application/pdf" }));
const mockText = vi.fn();
const mockTextWithLink = vi.fn();

class MockJsPDF {
  internal = { pageSize: { getWidth: () => 595, getHeight: () => 842 } };
  setTextColor = vi.fn();
  setFillColor = vi.fn();
  setDrawColor = vi.fn();
  setFont = vi.fn();
  setFontSize = vi.fn();
  setLineWidth = vi.fn();
  text = mockText;
  textWithLink = mockTextWithLink;
  line = vi.fn();
  rect = vi.fn();
  roundedRect = vi.fn();
  splitTextToSize = vi.fn().mockReturnValue(["line1", "line2"]);
  getTextWidth = vi.fn().mockReturnValue(50);
  output = mockOutput;
}

vi.mock("jspdf", () => ({
  jsPDF: MockJsPDF,
}));

describe("generateAndOpenCV", () => {
  it("generates PDF and opens in new tab", async () => {
    const { generateAndOpenCV } = await import("src/utils/generateCV");
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV();
    expect(mockOutput).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});