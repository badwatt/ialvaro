import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { pdf } from "@react-pdf/renderer";
import { CV } from "src/views/CV";
import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("<CV /> click interactions", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("opens preview and downloads", async () => {
    render(<CV />);
    const btn = screen.getByLabelText("Preview CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId("cv-preview")).toBeDefined();
    });

    const downloadBtn = screen.getByText("Download");
    fireEvent.click(downloadBtn);
  });

  it("opens preview and closes", async () => {
    render(<CV />);
    const btn = screen.getByLabelText("Preview CV");
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId("cv-preview")).toBeDefined();
    });

    const closeBtn = screen.getByText("Close");
    fireEvent.click(closeBtn);
  });
});