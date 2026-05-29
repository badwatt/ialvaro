import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getBioText,
  loadImage,
  loadImageToPng,
  toCircular,
  generateAndOpenCV,
  parseDescription,
  parseDate,
} from "src/utils/generateCV";
import { testExperienceData, testAboutData, testSkillsData } from "../fixtures";

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

describe("generateAndOpenCV", () => {
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

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles missing profile image", async () => {
    setupFetchMock("profile.png");
    setupFileReaderMock();
    setupDOMMocks("load");

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles missing alt image", async () => {
    setupFetchMock("profile_alt.png");
    setupFileReaderMock();
    setupDOMMocks("load");

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles sidebar addImage error", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");
    mockRegistry.addImageThrow = 1;

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles missing all images and minimal about data", async () => {
    setupFetchMockAllReject();
    setupFileReaderMock();
    setupDOMMocks("load");

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

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(exp, minimalAbout, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles empty education array", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const noEduAbout = [
      {
        email: "a@b.com",
        location: "",
        languages: [],
        education: [],
        bio: "short bio",
      },
    ];

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, noEduAbout, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles missing email", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const noEmailAbout = [
      {
        email: "",
        location: "",
        languages: [],
        education: [],
        bio: "short bio",
      },
    ];

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, noEmailAbout, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("adds a second page when experience overflows", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const many = Array.from({ length: 8 }, () => testExperienceData[0]);
    await generateAndOpenCV(many, testAboutData, testSkillsData);

    expect(mockRegistry.addPage).toHaveBeenCalled();
    openSpy.mockRestore();
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
