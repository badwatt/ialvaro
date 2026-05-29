import { useEffect, useState, type RefObject } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";

export interface UsePdfPagesOptions {
  src: string;
  containerRef: RefObject<HTMLDivElement | null>;
  getDocument: (src: string) => PDFDocumentLoadingTask;
  renderPage: (page: PDFPageProxy, canvas: HTMLCanvasElement, containerWidth: number) => Promise<void>;
}

export async function loadPdfPages(
  task: PDFDocumentLoadingTask,
  container: HTMLDivElement,
  renderPage: UsePdfPagesOptions["renderPage"],
) {
  const pdf: PDFDocumentProxy = await task.promise;

  container.innerHTML = "";
  const total = pdf.numPages;
  const containerWidth = container.clientWidth;

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const wrapper = document.createElement("div");
    wrapper.className = "flex justify-center py-4";
    const canvas = document.createElement("canvas");
    canvas.className = "max-w-full shadow-lg";
    wrapper.appendChild(canvas);
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
        if (!destroyed) {
          setLoading(false);
        }
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
