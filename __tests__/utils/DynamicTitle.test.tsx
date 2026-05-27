import { cleanup, render } from "@testing-library/react";
import { DynamicTitle } from "src/utils/DynamicTitle";
import { afterEach, describe, expect, it, vi } from "vitest";

const getSiteName = (hostname: string) => {
  const parts = hostname.split(".");
  return parts.length >= 2 ? parts[parts.length - 2] : hostname;
};

describe("getSiteName", () => {
  it("extracts name from simple domain", () => {
    expect(getSiteName("ialvaro.com")).toBe("ialvaro");
  });

  it("extracts name from subdomain", () => {
    expect(getSiteName("www.ialvaro.com")).toBe("ialvaro");
  });

  it("returns full hostname when single part", () => {
    expect(getSiteName("localhost")).toBe("localhost");
  });
});

describe("<DynamicTitle />", () => {
  const originalLocation = window.location;

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    window.location.hash = "";
  });

  const site = getSiteName(window.location.hostname);

  function setupSections(visibleIds: string[] = [], missingIds: string[] = []) {
    const allIds = ["home", "about", "skills", "experience", "portfolio", "cv", "contact"];
    const html = allIds
      .filter(id => !missingIds.includes(id))
      .map(id => `<section id="${id}"></section>`)
      .join("");
    document.body.innerHTML = html;

    const visibleSet = new Set(visibleIds);
    for (const id of allIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = visibleSet.has(id) ? 100 : 999;
      vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ top } as DOMRect);
    }
  }

  function setScrollY(value: number) {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(value);
  }

  it("sets initial title to Home | {site}", () => {
    setupSections();
    render(<DynamicTitle />);
    expect(document.title).toBe(`Home | ${site}`);
  });

  it("uses domain name when hostname has multiple parts", () => {
    Object.defineProperty(window, "location", {
      value: { hostname: "ialvaro.com", hash: "", pathname: "/", replace: () => {} },
      writable: true,
      configurable: true,
    });
    setupSections();
    render(<DynamicTitle />);
    expect(document.title).toBe("Home | ialvaro");
  });

  it("updates title for visible about", () => {
    setupSections(["about"]);
    setScrollY(500);
    render(<DynamicTitle />);
    expect(document.title).toBe(`About | ${site}`);
  });

  it("updates title for visible skills", () => {
    setupSections(["skills"]);
    setScrollY(500);
    render(<DynamicTitle />);
    expect(document.title).toBe(`Skills | ${site}`);
  });

  it("keeps home when scrollY < 100", () => {
    setupSections(["skills"]);
    setScrollY(50);
    render(<DynamicTitle />);
    expect(document.title).toBe(`Home | ${site}`);
  });

  it("falls back to site name when no section visible", () => {
    setupSections([]);
    setScrollY(5000);
    render(<DynamicTitle />);
    expect(document.title).toBe(site);
  });

  it("skips section when DOM element missing", () => {
    setupSections(["experience"], ["experience"]);
    setScrollY(500);
    render(<DynamicTitle />);
    // experience is missing from DOM, so falls back
    expect(document.title).toBe(site);
  });

  it("syncs hash when section is visible", () => {
    const replaceStateSpy = vi.spyOn(history, "replaceState");
    setupSections(["portfolio"]);
    setScrollY(500);
    render(<DynamicTitle />);
    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "#portfolio");
    replaceStateSpy.mockRestore();
  });

  it("skips replaceState when hash already matches", () => {
    window.location.hash = "#about";
    const replaceStateSpy = vi.spyOn(history, "replaceState");
    setupSections(["about"]);
    setScrollY(500);
    render(<DynamicTitle />);
    const aboutCalls = replaceStateSpy.mock.calls.filter(c => c[2] === "#about");
    expect(aboutCalls.length).toBe(0);
    replaceStateSpy.mockRestore();
  });

  it("clears hash when no section visible", () => {
    window.location.hash = "#portfolio";
    const replaceStateSpy = vi.spyOn(history, "replaceState");
    setupSections([]);
    setScrollY(5000);
    render(<DynamicTitle />);
    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", window.location.pathname);
    replaceStateSpy.mockRestore();
  });

  it("skips clearHash when no hash present", () => {
    const replaceStateSpy = vi.spyOn(history, "replaceState");
    setupSections([]);
    setScrollY(5000);
    render(<DynamicTitle />);
    const pathCalls = replaceStateSpy.mock.calls.filter(c => c[2] === window.location.pathname);
    expect(pathCalls.length).toBe(0);
    replaceStateSpy.mockRestore();
  });
});