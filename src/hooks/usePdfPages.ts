import { useEffect, useState, type RefObject } from "react";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist/legacy/build/pdf.mjs";

export interface UsePdfPagesOptions {
  src: string;
  containerRef: RefObject<HTMLDivElement | null>;
  getDocument: (src: string) => PDFDocumentLoadingTask;
  renderPage: (
    page: PDFPageProxy,
    canvas: HTMLCanvasElement,
    containerWidth?: number,
  ) => Promise<void>;
}

const PAGE_WRAPPER_CLASS = "py-4";
const CANVAS_CLASS = "w-full h-auto shadow-lg mx-auto";

function createPageElement() {
  const wrapper = document.createElement("div");
  wrapper.className = PAGE_WRAPPER_CLASS;
  const canvas = document.createElement("canvas");
  canvas.className = CANVAS_CLASS;
  wrapper.appendChild(canvas);
  return { wrapper, canvas };
}

export async function loadPdfPages(
  task: PDFDocumentLoadingTask,
  container: HTMLDivElement,
  renderPage: UsePdfPagesOptions["renderPage"],
) {
  const pdf: PDFDocumentProxy = await task.promise;

  container.innerHTML = "";

  // Use container's CSS width so canvas buffer matches displayed size × DPR.
  // Falls back to 0 (PDF_SCALE path) when container not yet laid out.
  const containerWidth = container.clientWidth;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const { wrapper, canvas } = createPageElement();
    container.appendChild(wrapper);
    await renderPage(page, canvas, containerWidth);
    page.cleanup();
  }
}

export function usePdfPages({ src, containerRef, getDocument, renderPage }: UsePdfPagesOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    let destroyed = false;
    setLoading(true);
    setError(null);

    const task = getDocument(src);

    loadPdfPages(task, containerRef.current ?? document.createElement("div"), renderPage)
      .then(() => {
        if (!destroyed) setLoading(false);
      })
      .catch(() => {
        if (!destroyed) {
          setError("Failed to load PDF preview.");
          setLoading(false);
        }
      });

    return () => {
      destroyed = true;
      task.destroy();
    };
  }, [src, containerRef, getDocument, renderPage]);

  return { loading, error };
}
