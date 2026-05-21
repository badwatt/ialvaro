import { describe, expect, it } from "vitest";
import { TABLET } from "src/constants/devices";

describe("devices constants", () => {
  it("TABLET equals 768", () => {
    expect(TABLET).toBe(768);
  });

  it("TABLET is a number", () => {
    expect(typeof TABLET).toBe("number");
  });

  it("TABLET is positive", () => {
    expect(TABLET).toBeGreaterThan(0);
  });
});
