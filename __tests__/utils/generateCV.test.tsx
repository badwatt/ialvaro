import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getBioText,
  loadImage,
  toCircular,
  generateAndOpenCV,
  parseDescription,
} from "src/utils/generateCV";
import { testExperienceData, testAboutData, testSkillsData } from "../fixtures";

// Mock registry — defined before vi.mock
const mockRegistry = {
  addImage: vi.fn(),
  output: vi.fn().mockReturnValue(new Blob(["pdf"], { type: "application/pdf" })),
  behavior: { addImageThrow: 0 },
};

vi.mock("jspdf", () => {
  const addImageImpl = vi.fn().mockImplementation(() => {
    const callNum = (addImageImpl.mock.calls?.length ?? 0) + 1;
    if (mockRegistry.behavior.addImageThrow === 1 && callNum === 1) throw new Error("sidebar");
    if (mockRegistry.behavior.addImageThrow === 2 && callNum === 2) throw new Error("footer");
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
      addImage: addImageImpl,
      splitTextToSize: vi.fn().mockReturnValue(["line1", "line2"]),
      getTextWidth: vi.fn().mockReturnValue(50),
      output: mockRegistry.output,
    };
  }

  return { jsPDF };
});

// ── Helpers ──
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
    vi.stubGlobal("Image", class {
      onload: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onload?.(), 0);
      }
    });
  } else {
    vi.stubGlobal("Image", class {
      onerror: (() => void) | null = null;
      constructor() {
        setTimeout(() => this.onerror?.(), 0);
      }
    });
  }
}

function stubImageToLoad() {
  vi.stubGlobal("Image", class {
    onload: (() => void) | null = null;
    constructor() {
      setTimeout(() => this.onload?.(), 0);
    }
  });
}

// ── Tests ──
describe("getBioText", () => {
  it("uses id 3 bio when present", () => {
    expect(getBioText([{ id: "3", bio: "test" }])).toBe("test");
  });

  it("falls back to first bio when id 3 missing", () => {
    expect(getBioText([{ id: "1", bio: "fb" }])).toBe("fb");
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
    mockRegistry.behavior.addImageThrow = 0;
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
    expect(mockRegistry.addImage).toHaveBeenCalledTimes(1);
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
    expect(mockRegistry.addImage).toHaveBeenCalledTimes(1);
    openSpy.mockRestore();
  });

  it("handles sidebar addImage error", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");
    mockRegistry.behavior.addImageThrow = 1;

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("handles footer addImage error", async () => {
    setupFetchMock();
    setupFileReaderMock();
    setupDOMMocks("load");
    mockRegistry.behavior.addImageThrow = 2;

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    await generateAndOpenCV(testExperienceData, testAboutData, testSkillsData);

    expect(mockRegistry.output).toHaveBeenCalledWith("blob");
    expect(openSpy).toHaveBeenCalled();
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
