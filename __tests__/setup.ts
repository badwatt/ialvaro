import { vi } from "vitest";

// Content collections loaded via getCollection() at build time.
// No runtime mocks needed — components receive data as props.

vi.mock("astro:content", () => ({
  getCollection: vi.fn().mockResolvedValue([]),
}));
