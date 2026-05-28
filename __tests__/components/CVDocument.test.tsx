import { describe, expect, it } from "vitest";
import { CVDocument, getBioText } from "src/components/CVDocument";
import { pdf } from "@react-pdf/renderer";

describe("getBioText", () => {
  it("returns bio with id 3 when present", () => {
    const data = [{ id: "1", bio: "" }, { id: "3", bio: "Found" }] as { id: string; bio: string }[];
    expect(getBioText(data)).toBe("Found");
  });

  it("falls back to first item when id 3 missing", () => {
    const data = [{ id: "1", bio: "Fallback" }] as { id: string; bio: string }[];
    expect(getBioText(data)).toBe("Fallback");
  });

  it("returns empty string when no data", () => {
    expect(getBioText([])).toBe("");
  });
});

describe("CVDocument", () => {
  it("renders without throwing", () => {
    expect(() => <CVDocument />).not.toThrow();
  });

  it("generates PDF blob", async () => {
    const result = pdf(<CVDocument />);
    const blob = await result.toBlob();
    expect(blob).toBeDefined();
    expect(blob.type).toBe("application/pdf");
  });
});