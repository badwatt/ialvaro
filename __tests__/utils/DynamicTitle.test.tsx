import { cleanup, render } from "@testing-library/react";
import { DynamicTitle } from "src/utils/DynamicTitle";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("<DynamicTitle />", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  function setupSections(visibleIds: string[] = []) {
    document.body.innerHTML = `
			<section id="home"></section>
			<section id="about"></section>
			<section id="skills"></section>
			<section id="experience"></section>
			<section id="portfolio"></section>
			<section id="cv"></section>
			<section id="contact"></section>
		`;
    const visibleSet = new Set(visibleIds);
    for (const id of ["home", "about", "skills", "experience", "portfolio", "cv", "contact"]) {
      const el = document.getElementById(id)!;
      const top = visibleSet.has(id) ? 100 : 999;
      vi.spyOn(el, "getBoundingClientRect").mockReturnValue({ top } as DOMRect);
    }
  }

  function setScrollY(value: number) {
    vi.spyOn(window, "scrollY", "get").mockReturnValue(value);
  }

  it("sets initial title to Home | ialvaro", () => {
    setupSections();
    render(<DynamicTitle />);
    expect(document.title).toBe("Home | ialvaro");
  });

  it("updates title for visible about", () => {
    setupSections(["about"]);
    setScrollY(500);
    render(<DynamicTitle />);
    expect(document.title).toBe("About | ialvaro");
  });

  it("updates title for visible skills", () => {
    setupSections(["skills"]);
    setScrollY(500);
    render(<DynamicTitle />);
    expect(document.title).toBe("Skills | ialvaro");
  });

  it("keeps home when scrollY < 100", () => {
    setupSections(["skills"]);
    setScrollY(50);
    render(<DynamicTitle />);
    expect(document.title).toBe("Home | ialvaro");
  });

  it("falls back to default when no section visible", () => {
    setupSections([]);
    setScrollY(5000);
    render(<DynamicTitle />);
    expect(document.title).toBe("ialvaro");
  });
});
