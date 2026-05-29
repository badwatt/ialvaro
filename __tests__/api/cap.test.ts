import { describe, expect, it, vi } from "vitest";
import { POST } from "src/pages/api/cap/verify";

function createMockRequest(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as Request;
}

describe("POST /api/cap/verify", () => {
  beforeEach(() => {
    vi.stubEnv("PUBLIC_CAP_URL", "https://cap.example.com");
    vi.stubEnv("PUBLIC_CAP_SITE_KEY", "site123");
    vi.stubEnv("CAP_SECRET", "secret123");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 when verification succeeds", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    const res = await POST({
      request: createMockRequest({ token: "tok" }),
    } as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("returns 400 when verification fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });
    const res = await POST({
      request: createMockRequest({ token: "tok" }),
    } as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false });
  });
});
