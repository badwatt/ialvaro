import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Home } from "src/views/Home";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createObserverMock } from "../helpers/observerMock";

vi.mock("@react-pdf/renderer", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    pdf: vi.fn().mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(new Blob(["pdf"], { type: "application/pdf" })),
    }),
  };
});

vi.mock("src/components/CVPreview", () => ({
  CVPreview: ({ onClose, onDownload }: { onClose: () => void; onDownload: () => void }) => (
    <div data-testid="cv-preview">
      <button onClick={onClose}>Close</button>
      <button onClick={onDownload}>Download</button>
    </div>
  ),
}));

describe("<Home /> CV click interactions", () => {
  let observer: ReturnType<typeof createObserverMock>;

  beforeEach(() => {
    observer = createObserverMock();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("opens CV preview from home button", async () => {
    render(<Home />);
    const btn = screen.getByText("CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId("cv-preview")).toBeDefined();
    });
  });

  it("closes CV preview from home", async () => {
    render(<Home />);
    fireEvent.click(screen.getByText("CV"));

    await waitFor(() => {
      expect(screen.getByTestId("cv-preview")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Close"));
  });
});