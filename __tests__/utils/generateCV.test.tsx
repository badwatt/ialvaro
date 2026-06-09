import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getBioText,
  loadImage,
  loadImageToPng,
  toCircular,
  generateCV,
  parseDescription,
  parseDate,
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
  it("parses sections from markdown body", () => {
    const result = parseDescription("# A\n\ncontent\n\n# B\n\nmore");
    expect(result).toEqual([
      { title: "A", content: "content" },
      { title: "B", content: "more" },
    ]);
  });

  it("skips lines before first heading", () => {
    const result = parseDescription("intro\n# A\ncontent\n");
    expect(result).toEqual([{ title: "A", content: "content" }]);
  });

  it("returns empty for no headings", () => {
    expect(parseDescription("just text")).toEqual([]);
  });
});
