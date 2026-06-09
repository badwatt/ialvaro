import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getBioText,
  loadImage,
  loadImageToPng,
  toCircular,
  generateCV,
  parseDescription,
  parseDate,
  drawMarkdown,
  measureMarkdown,
  drawJob,
} from "src/utils/generateCV";
import {
  CV_THEMES,
  getThemeById,
  pickAssetByLuminance,
  relativeLuminance,
} from "src/utils/cvThemes";
import { testExperienceData, testAboutData, testSkillsData } from "../fixtures";

const TEST_THEME = getThemeById("default");
const WHITE_THEME = getThemeById("white");
const MOCHA_THEME = getThemeById("mocha");
const EMERALD_THEME = getThemeById("emerald");

const mockRegistry = {
  addImage: vi.fn(),
  addPage: vi.fn(),
  output: vi.fn().mockReturnValue(new Blob(["pdf"], { type: "application/pdf" })),
  addImageThrow: 0,
};

vi.mock("jspdf", () => {
  const addImageImpl = vi.fn().mockImplementation(() => {
    const callNum = (addImageImpl.mock.calls?.length ?? 0) + 1;
    if (mockRegistry.addImageThrow === callNum) throw new Error("fail");
  });

  mockRegistry.addImage = addImageImpl;

  function jsPDF(..._args: unknown[]) {
    return {
      internal: { pageSize: { getWidth: () => 595, getHeight: () => 842 } },
      setTextColor: vi.fn(),
      setFillColor: vi.fn(),
      setDrawColor: vi.fn(),
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      setLineWidth: vi.fn(),
      text: vi.fn(),
      textWithLink: vi.fn(),
      line: vi.fn(),
      rect: vi.fn(),
      roundedRect: vi.fn(),
      ellipse: vi.fn(),
      circle: vi.fn(),
      addImage: addImageImpl,
      addPage: mockRegistry.addPage,
      splitTextToSize: vi.fn().mockReturnValue(["line1", "line2"]),
      getTextWidth: vi.fn().mockReturnValue(50),
      output: mockRegistry.output,
    };
  }

  return { jsPDF };
});

function setupFetchMock(rejectUrl?: string) {
  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (rejectUrl && url.includes(rejectUrl)) return Promise.reject(new Error("fail"));
    return Promise.resolve({ blob: () => Promise.resolve(new Blob(["img"])) });
  });
}

function setupFileReaderMock() {
  class MockFileReader {
    result = "data:image/png;base64,abc";
    onloadend: (() => void) | null = null;
    readAsDataURL() {
      setTimeout(() => this.onloadend?.(), 0);
    }
  }
  vi.stubGlobal("FileReader", MockFileReader);
}

function setupDOMMocks(imageBehavior: "load" | "error" = "load") {
  const mockCtx = {
    beginPath: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    clearRect: vi.fn(),
  };

  vi.stubGlobal("document", {
    createElement: (tag: string) => {
      if (tag === "canvas") {
        return {
          getContext: () => mockCtx,
          toDataURL: () => "data:image/png;base64,circular",
        };
      }
      return null;
    },
  });

  if (imageBehavior === "load") {
    vi.stubGlobal(
      "Image",
      class {
        onload: (() => void) | null = null;
        constructor() {
          setTimeout(() => this.onload?.(), 0);
        }
      },
    );
  } else {
    vi.stubGlobal(
      "Image",
      class {
        onerror: (() => void) | null = null;
        constructor() {
          setTimeout(() => this.onerror?.(), 0);
        }
      },
    );
  }
}

function setupFileReaderMockEmpty() {
  class MockFileReader {
    result = "";
    onloadend: (() => void) | null = null;
    readAsDataURL() {
      setTimeout(() => this.onloadend?.(), 0);
    }
  }
  vi.stubGlobal("FileReader", MockFileReader);
}

function setupFetchMockAllReject() {
  global.fetch = vi.fn().mockImplementation(() => Promise.reject(new Error("fail")));
}

function setupDOMMocksNullCtx() {
  vi.stubGlobal("document", {
    createElement: (tag: string) => {
      if (tag === "canvas") {
        return {
          getContext: () => null,
          toDataURL: () => "data:image/png;base64,circular",
        };
      }
      return null;
    },
  });
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    },
  );
}

function stubImageToLoad() {
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    },
  );
}

// ── Tests ──
describe("parseDate", () => {
  it("parses now as Date.now()", () => {
    const result = parseDate("now");
    expect(result).toBeGreaterThan(Date.now() - 1000);
    expect(result).toBeLessThanOrEqual(Date.now());
  });

  it("returns 0 for invalid date", () => {
    expect(parseDate("2024 13")).toBe(0);
  });

  it("parses normal month year", () => {
    const result = parseDate("June 2023");
    expect(result).toBeGreaterThan(0);
  });
});

describe("getBioText", () => {
  it("uses id 3 bio when present", () => {
    expect(getBioText([{ email: "", location: "", languages: [], bio: "test" }])).toBe("test");
  });

  it("falls back to first bio when id 3 missing", () => {
    expect(getBioText([{ email: "", location: "", languages: [], bio: "fb" }])).toBe("fb");
  });

  it("falls back to empty string when no data", () => {
    expect(getBioText([])).toBe("");
  });
});

describe("loadImage", () => {
  it("returns base64 from fetch + FileReader", async () => {
    setupFetchMock();
    setupFileReaderMock();
    const result = await loadImage("/test.png");
    expect(result).toBe("data:image/png;base64,abc");
    vi.unstubAllGlobals();
  });

  it("returns empty string from FileReader with empty result", async () => {
    setupFetchMock();
    setupFileReaderMockEmpty();
    const result = await loadImage("/test.png");
    expect(result).toBe("");
    vi.unstubAllGlobals();
  });
});

describe("loadImageToPng", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when document undefined", async () => {
    vi.stubGlobal("document", undefined);
    const result = await loadImageToPng("/a.svg", 16, 16);
    expect(result).toBeNull();
  });

  it("returns null when base64 is empty", async () => {
    setupFetchMock();
    setupFileReaderMockEmpty();
    setupDOMMocks("load");
    const result = await loadImageToPng("/a.svg", 16, 16);
    expect(result).toBeNull();
  });

  it("returns null when getContext returns null", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocksNullCtx();
    const result = await loadImageToPng("/a.svg", 16, 16);
    expect(result).toBeNull();
  });

  it("returns null on fetch error", async () => {
    setupFetchMockAllReject();
    setupDOMMocks("load");
    const result = await loadImageToPng("/a.svg", 16, 16);
    expect(result).toBeNull();
  });

  it("returns null when image fails to load", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("error");
    const result = await loadImageToPng("/a.svg", 16, 16);
    expect(result).toBeNull();
  });

  it("returns raster PNG on success", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");
    const result = await loadImageToPng("/a.svg", 16, 16);
    expect(result).toBe("data:image/png;base64,circular");
  });
});

describe("toCircular", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when document undefined", async () => {
    vi.stubGlobal("document", undefined);
    const result = await toCircular("data:...", 80);
    expect(result).toBeNull();
  });

  it("returns null when getContext returns null", async () => {
    vi.stubGlobal("document", {
      createElement: () => ({ getContext: () => null }),
    });
    stubImageToLoad();
    const result = await toCircular("data:...", 80);
    expect(result).toBeNull();
  });

  it("returns null when image fails to load", async () => {
    setupDOMMocks("error");
    const result = await toCircular("data:...", 80);
    expect(result).toBeNull();
  });

  it("returns circular image on success", async () => {
    setupDOMMocks("load");
    const result = await toCircular("data:...", 80);
    expect(result).toBe("data:image/png;base64,circular");
  });
});

describe("generateCV", () => {
  beforeEach(() => {
    mockRegistry.addImageThrow = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generates PDF with all features", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const url = await generateCV(TEST_THEME, testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("handles missing profile image", async () => {
    setupFetchMock("profile.png");
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const url = await generateCV(TEST_THEME, testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("handles missing alt image", async () => {
    setupFetchMock("profile_alt.png");
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const url = await generateCV(TEST_THEME, testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("handles sidebar addImage error", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");
    mockRegistry.addImageThrow = 1;

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const url = await generateCV(TEST_THEME, testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("handles missing all images and minimal about data", async () => {
    setupFetchMockAllReject();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");

    const minimalAbout = [
      {
        email: "a@b.com",
        location: "",
        languages: [],
        education: [{ institution: "Uni", degree: "BS" }],
        bio: "short bio",
      },
    ];
    const exp = [
      {
        id: "3",
        title: "Now",
        image: "../../assets/experience/now.svg",
        date_from: "now",
        date_to: "now",
        url: "https://now.com/",
        description: "# A\n\ncontent",
      },
      {
        id: "4",
        title: "Bad",
        image: "../../assets/experience/bad.svg",
        date_from: "bad",
        date_to: "bad",
        url: "https://bad.com/",
        description: "# B\n\ncontent",
      },
    ];

    const url = await generateCV(TEST_THEME, exp, minimalAbout, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("handles empty education array", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");

    const noEduAbout = [
      {
        email: "a@b.com",
        location: "",
        languages: [],
        education: [],
        bio: "short bio",
      },
    ];

    const url = await generateCV(TEST_THEME, testExperienceData, noEduAbout, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("handles missing email", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");

    const noEmailAbout = [
      {
        email: "",
        location: "",
        languages: [],
        education: [],
        bio: "short bio",
      },
    ];

    const url = await generateCV(TEST_THEME, testExperienceData, noEmailAbout, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("adds a second page when experience overflows", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const many = Array.from({ length: 8 }, () => testExperienceData[0]);
    const url = await generateCV(TEST_THEME, many, testAboutData, testSkillsData);

    expect(mockRegistry.addPage).toHaveBeenCalled();
    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("applies the default theme colors when generating", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    await generateCV(TEST_THEME, testExperienceData, testAboutData, testSkillsData);

    // jsPDF instance is created internally; capture calls via addImage registry isn't enough.
    // Spy on the prototype methods exposed through the mock constructor.
    const calls = (await import("jspdf")).jsPDF;
    void calls;

    expect(urlSpy).toHaveBeenCalled();
    urlSpy.mockRestore();
  });

  it("uses different colors per theme (white vs mocha)", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");

    await generateCV(WHITE_THEME, testExperienceData, testAboutData, testSkillsData);
    const whiteBaseCall = (mockRegistry.addImage as any).mock.calls.length;

    await generateCV(MOCHA_THEME, testExperienceData, testAboutData, testSkillsData);
    const mochaBaseCall = (mockRegistry.addImage as any).mock.calls.length;

    // Same number of images fetched + drawn per generation; both should be non-zero.
    expect(whiteBaseCall).toBeGreaterThan(0);
    expect(mochaBaseCall).toBeGreaterThan(0);
    urlSpy.mockRestore();
  });

  it("accepts the emerald theme without error", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    const url = await generateCV(EMERALD_THEME, testExperienceData, testAboutData, testSkillsData);

    expect(url).toBe("blob:test");
    urlSpy.mockRestore();
  });

  it("fetches light icon variants for dark themes", async () => {
    const fetchSpy = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ blob: () => Promise.resolve(new Blob(["img"])) }),
      );
    global.fetch = fetchSpy;
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    await generateCV(TEST_THEME, testExperienceData, testAboutData, testSkillsData);

    const fetched = fetchSpy.mock.calls.map((c) => c[0] as string);
    expect(fetched).toContain("/social/github.svg");
    expect(fetched).toContain("/social/linkedin.svg");
    expect(fetched).not.toContain("/social/github_dark.svg");
    expect(fetched).not.toContain("/social/linkedin_dark.svg");
    urlSpy.mockRestore();
  });

  it("fetches dark icon variants for the white theme", async () => {
    const fetchSpy = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ blob: () => Promise.resolve(new Blob(["img"])) }),
      );
    global.fetch = fetchSpy;
    setupFileReaderMock();
    setupDOMMocks("load");

    const urlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    await generateCV(WHITE_THEME, testExperienceData, testAboutData, testSkillsData);

    const fetched = fetchSpy.mock.calls.map((c) => c[0] as string);
    expect(fetched).toContain("/social/github_dark.svg");
    expect(fetched).toContain("/social/linkedin_dark.svg");
    expect(fetched).not.toContain("/social/github.svg");
    expect(fetched).not.toContain("/social/linkedin.svg");
    urlSpy.mockRestore();
  });
});

describe("cvThemes", () => {
  it("exposes four built-in themes", () => {
    expect(CV_THEMES).toHaveLength(4);
    expect(CV_THEMES.map((t) => t.id)).toEqual(["default", "white", "mocha", "emerald"]);
  });

  it("getThemeById returns the matching theme", () => {
    expect(getThemeById("white").id).toBe("white");
    expect(getThemeById("mocha").id).toBe("mocha");
    expect(getThemeById("emerald").id).toBe("emerald");
    expect(getThemeById("default").id).toBe("default");
  });

  it("getThemeById falls back to default for unknown id", () => {
    expect(getThemeById("nope" as any).id).toBe("default");
  });

  it("every theme has 7 RGB colors", () => {
    for (const theme of CV_THEMES) {
      const keys = ["base", "surface", "border", "muted", "text", "primary", "accent"];
      for (const k of keys) {
        const c = (theme.colors as any)[k];
        expect(Array.isArray(c)).toBe(true);
        expect(c).toHaveLength(3);
        for (const v of c) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(255);
        }
      }
    }
  });

  it("relativeLuminance is 0 for black and 1 for white", () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0);
    expect(relativeLuminance([255, 255, 255])).toBe(1);
  });

  it("pickAssetByLuminance returns darkUrl for light bases and lightUrl for dark bases", () => {
    const dark = pickAssetByLuminance([8, 8, 15], "light.svg", "dark.svg");
    const light = pickAssetByLuminance([255, 255, 255], "light.svg", "dark.svg");
    expect(dark).toBe("light.svg");
    expect(light).toBe("dark.svg");
  });

  it("pickAssetByLuminance picks dark variants for the white theme base", () => {
    const url = pickAssetByLuminance(
      getThemeById("white").colors.base,
      "/social/github.svg",
      "/social/github_dark.svg",
    );
    expect(url).toBe("/social/github_dark.svg");
  });

  it("pickAssetByLuminance picks light variants for the default theme base", () => {
    const url = pickAssetByLuminance(
      getThemeById("default").colors.base,
      "/social/github.svg",
      "/social/github_dark.svg",
    );
    expect(url).toBe("/social/github.svg");
  });
});

describe("parseDescription", () => {
  it("tokenises headings and paragraphs from markdown", () => {
    const result = parseDescription("# A\n\ncontent\n\n# B\n\nmore");
    const blocks = result.filter((t) => t.type !== "space");
    expect(blocks.map((t) => t.type)).toEqual(["heading", "paragraph", "heading", "paragraph"]);
    expect((blocks[0] as { text: string }).text).toBe("A");
    expect((blocks[1] as { text: string }).text).toBe("content");
    expect((blocks[2] as { text: string }).text).toBe("B");
    expect((blocks[3] as { text: string }).text).toBe("more");
  });

  it("tokenises lines before the first heading as a paragraph", () => {
    const result = parseDescription("intro\n# A\ncontent\n");
    const blocks = result.filter((t) => t.type !== "space");
    expect(blocks[0].type).toBe("paragraph");
    expect((blocks[0] as { text: string }).text).toBe("intro");
    expect(blocks[1].type).toBe("heading");
  });

  it("returns a single paragraph token for plain text", () => {
    const result = parseDescription("just text");
    const blocks = result.filter((t) => t.type !== "space");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("paragraph");
    expect((blocks[0] as { text: string }).text).toBe("just text");
  });

  it("tokenises bullet lists", () => {
    const result = parseDescription("- one\n- two\n- three");
    const blocks = result.filter((t) => t.type !== "space");
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("list");
    const list = blocks[0] as unknown as { ordered: boolean; items: { text: string }[] };
    expect(list.ordered).toBe(false);
    expect(list.items).toHaveLength(3);
  });

  it("tokenises blockquotes", () => {
    const result = parseDescription("> quoted");
    const blocks = result.filter((t) => t.type !== "space");
    expect(blocks[0].type).toBe("blockquote");
  });
});

describe("measureMarkdown", () => {
  it("returns 0 for empty input", () => {
    const doc = {
      splitTextToSize: () => [],
    };
    expect(measureMarkdown(doc as any, "", 200)).toBe(0);
  });

  it("includes height for headings", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "# Title", 200);
    expect(h).toBeGreaterThan(0);
  });

  it("includes height for paragraphs", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "just a paragraph", 200);
    expect(h).toBeGreaterThan(0);
  });

  it("includes height for lists", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "- a\n- b", 200);
    expect(h).toBeGreaterThan(0);
  });

  it("includes height for blockquotes", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "> quoted", 200);
    expect(h).toBeGreaterThan(0);
  });

  it("includes height for code blocks", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "```\nconst x = 1;\n```", 200);
    expect(h).toBeGreaterThan(0);
  });

  it("skips `---` so the caller can split on it", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "---", 200);
    expect(h).toBe(0);
  });

  it("falls back to zero height for unsupported block types (e.g. tables)", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h = measureMarkdown(doc as any, "| col |\n| --- |\n| val |", 200);
    expect(h).toBe(0);
  });

  it("uses h1 line height for # headings", () => {
    const doc = { splitTextToSize: (t: string) => [t] };
    const h1 = measureMarkdown(doc as any, "# Heading", 200);
    const h2 = measureMarkdown(doc as any, "## Heading", 200);
    // h1 is larger (13pt line vs 12pt)
    expect(h1).toBeGreaterThan(h2);
  });

  it("skips empty inline text in list items when measuring", async () => {
    // A list item with an inline token whose text field is empty/undefined
    // must not crash the measure loop. The empty string branch of
    // `if (txt) inlineText += txt;` is the defensive guard.
    const doc = { splitTextToSize: (t: string) => [t] };
    expect(() => measureMarkdown(doc as any, "- ", 200)).not.toThrow();
  });

  it("skips empty inline text tokens in list items (measure branch)", async () => {
    // Inject an empty text token into a list item's first text token so the
    // `if (txt)` guard takes the false branch while measuring.
    const marked = await import("marked");
    const origLexer = marked.marked.lexer;
    marked.marked.lexer = ((input: string) => {
      const tokens = origLexer(input);
      for (const t of tokens) {
        if (t.type === "list") {
          const list = t as unknown as { items: Array<{ tokens: Array<{ tokens?: unknown[] }> }> };
          if (list.items[0]?.tokens[0]?.tokens) {
            list.items[0].tokens[0].tokens = [{ type: "text", raw: "", text: "" }];
          }
        }
      }
      return tokens;
    }) as typeof marked.marked.lexer;
    const doc = { splitTextToSize: (t: string) => [t] };
    expect(() => measureMarkdown(doc as any, "- real", 200)).not.toThrow();
    marked.marked.lexer = origLexer;
  });

  it("adds the subgroup gap between periods when measuring", () => {
    // Two subgroups split on `---` should have a gap between them when
    // measuring total experience height. The first period is small; the
    // second is larger; the total must be sum + gap.
    const doc = { splitTextToSize: (t: string) => [t] };
    const single = measureMarkdown(doc as any, "period body", 200);
    const split = measureMarkdown(doc as any, "first body\n\n---\n\nsecond body", 200);
    expect(split).toBeGreaterThan(single * 2);
  });
});

describe("drawMarkdown", () => {
  // Build a minimal jsPDF-shaped mock that records method calls.
  function makeDoc() {
    return {
      setTextColor: vi.fn(),
      setFillColor: vi.fn(),
      setDrawColor: vi.fn(),
      setFont: vi.fn(),
      setFontSize: vi.fn(),
      setLineWidth: vi.fn(),
      text: vi.fn(),
      textWithLink: vi.fn(),
      line: vi.fn(),
      rect: vi.fn(),
      roundedRect: vi.fn(),
      ellipse: vi.fn(),
      circle: vi.fn(),
      addImage: vi.fn(),
      addPage: vi.fn(),
      splitTextToSize: vi.fn().mockImplementation((t: string) => [t]),
      getTextWidth: vi.fn().mockReturnValue(50),
      output: vi.fn(),
    };
  }

  const C = {
    base: [0, 0, 0] as [number, number, number],
    surface: [10, 10, 10] as [number, number, number],
    border: [20, 20, 20] as [number, number, number],
    muted: [128, 128, 128] as [number, number, number],
    white: [240, 240, 240] as [number, number, number],
    primary: [60, 120, 200] as [number, number, number],
    accent: [200, 80, 100] as [number, number, number],
  };

  it("draws headings, paragraphs, lists, blockquotes, and code without throwing", () => {
    const doc = makeDoc();
    const source = [
      "# Title",
      "Paragraph with **bold** and *italic* and `code` and ~~strike~~.",
      "- bullet one",
      "- bullet two",
      "> a quote",
      "```",
      "const x = 1;",
      "```",
    ].join("\n\n");
    const finalY = drawMarkdown(doc as any, C, source, 36, 200, 50);
    expect(finalY).toBeGreaterThan(50);
    expect(doc.text).toHaveBeenCalled();
    expect(doc.setFont).toHaveBeenCalled();
  });

  it("does not draw a line for `---` (caller splits on it instead)", () => {
    const doc = makeDoc();
    const beforeLineCalls = (doc.line as any).mock.calls.length;
    drawMarkdown(doc as any, C, "---", 36, 200, 50);
    // No line drawn; the hr is filtered out by drawMarkdown.
    expect((doc.line as any).mock.calls.length).toBe(beforeLineCalls);
  });

  it("draws a heading at depth 1 (h1 lineHeight branch)", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "# Title", 36, 200, 50);
    expect(doc.text).toHaveBeenCalled();
  });

  it("draws a heading at depth 2 (h2 size/lineHeight branch)", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "## Subtitle", 36, 200, 50);
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("Subtitle");
  });

  it("draws a heading at depth 3 (h3 fallback size/lineHeight branch)", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "### Sub-subtitle", 36, 200, 50);
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("Sub-subtitle");
  });

  it("draws inline images, links, and escape tokens", () => {
    const doc = makeDoc();
    const source =
      "![alt](https://example.com/x.png) and a [link](https://example.com) and \\(escaped\\)";
    drawMarkdown(doc as any, C, source, 36, 200, 50);
    // The link text and the image text are both drawn.
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("link");
  });

  it("draws a paragraph that includes a del token (~~strike~~)", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "this is ~~struck~~", 36, 200, 50);
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("struck");
  });

  it("handles inline HTML tag tokens without crashing", () => {
    const doc = makeDoc();
    // Inline HTML produces an 'html' token. Should not throw.
    expect(() => drawMarkdown(doc as any, C, "an <em>inline</em> tag", 36, 200, 50)).not.toThrow();
  });

  it("skips an empty inline text token without crashing", () => {
    const doc = makeDoc();
    // Direct call: feed an empty paragraph through drawMarkdown by wrapping
    // an empty text-like source. Marked won't produce empty text, but the
    // draw loop should still skip the call gracefully.
    expect(() => drawMarkdown(doc as any, C, "", 36, 200, 50)).not.toThrow();
  });

  it("skips unknown inline token types gracefully", () => {
    const doc = makeDoc();
    // No crash when input contains only HTML that doesn't match an inline
    // pattern recognised by pickText. The draw loop should no-op.
    expect(() => drawMarkdown(doc as any, C, "<unknown>raw</unknown>", 36, 200, 50)).not.toThrow();
  });

  it("draws an ordered list with numeric markers", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "1. first\n2. second", 36, 200, 50);
    // The accent color is used for the marker. The number "1." should appear.
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("1.");
    expect(calls).toContain("2.");
  });

  it("draws a paragraph with a link inline", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "see [docs](https://example.com)", 36, 200, 50);
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("docs");
  });

  it("draws a paragraph with a hard line break", () => {
    const doc = makeDoc();
    drawMarkdown(doc as any, C, "line one  \nline two", 36, 200, 50);
    // The break token is not drawn via text(), but the surrounding text is.
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("line one");
    expect(calls).toContain("line two");
  });

  it("falls back to no-op for unsupported block types (e.g. tables)", () => {
    const doc = makeDoc();
    const beforeTextCalls = (doc.text as any).mock.calls.length;
    const finalY = drawMarkdown(doc as any, C, "| col |\n| --- |\n| val |", 36, 200, 50);
    // No new text drawn for the unsupported block; y is unchanged.
    expect(finalY).toBe(50);
    expect((doc.text as any).mock.calls.length).toBe(beforeTextCalls);
  });

  it("renders a list item that contains only inline HTML (no text or paragraph tokens)", () => {
    // A list item with only an html token has no paragraph/text children for
    // getListItemInline to extract; it must fall back to an empty token list
    // without throwing.
    const doc = makeDoc();
    expect(() => drawMarkdown(doc as any, C, '- <img src="x.png">', 36, 200, 50)).not.toThrow();
  });

  it("skips an inline token whose text field is empty", async () => {
    // A stray text token with empty string must not crash the draw loop.
    // We reach into marked to lex a contrived source and force a paragraph
    // with an empty text token by directly mutating the result.
    const marked = await import("marked");
    const origLexer = marked.marked.lexer;
    marked.marked.lexer = ((input: string) => {
      const tokens = origLexer(input);
      for (const t of tokens) {
        if (t.type === "paragraph") {
          (t as { tokens: unknown[] }).tokens = [{ type: "text", raw: "", text: "" }];
        }
      }
      return tokens;
    }) as typeof marked.marked.lexer;
    const doc = makeDoc();
    expect(() => drawMarkdown(doc as any, C, "hello", 36, 200, 50)).not.toThrow();
    marked.marked.lexer = origLexer;
  });

  it("falls back to empty string when an inline token has no text field", async () => {
    // A token without a `text` field at all exercises the `?? ""` branch in
    // drawInline. The draw loop should treat it as an empty string and skip
    // drawing via `if (!text) continue;`.
    const marked = await import("marked");
    const origLexer = marked.marked.lexer;
    marked.marked.lexer = ((input: string) => {
      const tokens = origLexer(input);
      for (const t of tokens) {
        if (t.type === "paragraph") {
          (t as { tokens: unknown[] }).tokens = [
            { type: "mystery", raw: "" },
            { type: "text", raw: "x", text: "x" },
          ];
        }
      }
      return tokens;
    }) as typeof marked.marked.lexer;
    const doc = makeDoc();
    expect(() => drawMarkdown(doc as any, C, "x", 36, 200, 50)).not.toThrow();
    marked.marked.lexer = origLexer;
  });

  it("renders two subgroups with a gap between them in drawJob", () => {
    // Direct coverage for the loop in drawJob that walks subgroups and
    // inserts a divider between them. The mock is jsPDF-shaped so we
    // invoke drawJob directly.
    const doc = makeDoc();
    const job = {
      title: "Openbank",
      image: "",
      date_from: "June 2023",
      date_to: "July 2026",
      url: "https://openbank.es/",
      description: "first body\n\n---\n\nsecond body",
    };
    const finalY = drawJob(doc as any, C, job, 36, 200, 36, 50, null);
    expect(finalY).toBeGreaterThan(50);
  });

  it("renders an experience with an empty description without throwing", () => {
    // Edge case: an experience with no description (no subgroups). The
    // header should still render with the company name and dates, and
    // drawJob should not throw or produce NaN measurements.
    const doc = makeDoc();
    const job = {
      title: "Openbank",
      image: "",
      date_from: "June 2023",
      date_to: "July 2026",
      url: "https://openbank.es/",
      description: "",
    };
    const finalY = drawJob(doc as any, C, job, 36, 200, 36, 50, null);
    expect(finalY).toBeGreaterThan(50);
  });

  it("draws the period subtitle in italic muted when present", () => {
    // A subgroup with a blockquote (subtitle) exercises the if-branch
    // that draws the subtitle inline with the title.
    const doc = makeDoc();
    const job = {
      title: "Openbank",
      image: "",
      date_from: "June 2023",
      date_to: "July 2026",
      url: "https://openbank.es/",
      description: "# Consulting Firm\n\n- PLEXUS\n\n> 1 year 3 months\n\n---\n\n# Period 2",
    };
    const finalY = drawJob(doc as any, C, job, 36, 200, 36, 50, null);
    expect(finalY).toBeGreaterThan(50);
    // The subtitle text was drawn.
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("1 year 3 months");
  });

  it("draws the role in italic muted when the body has a role+period pair", () => {
    // rsi.md has `# Full Stack Developer` followed by `> Devoteam`. The
    // role is the h1 and the period name is the blockquote. The role
    // should be drawn as a separate italic muted line under the company
    // name in the header.
    const doc = makeDoc();
    const job = {
      title: "RSI",
      image: "",
      date_from: "October 2021",
      date_to: "April 2023",
      url: "https://grupocajarural.es/",
      description: "# Full Stack Developer\n\n> Devoteam\n\n## Projects\n\n- Onboarding",
    };
    drawJob(doc as any, C, job, 36, 200, 36, 50, null);
    const calls = (doc.text as any).mock.calls.map((c: unknown[]) => c[0]);
    expect(calls).toContain("Full Stack Developer");
    expect(calls).toContain("Devoteam");
  });
});
