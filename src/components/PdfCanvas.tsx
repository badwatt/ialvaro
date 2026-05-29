import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Spinner } from "./Spinner";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfCanvasProps {
  src: string;
}

export function PdfCanvas({ src }: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderPage = useCallback(async (
    page: pdfjsLib.PDFPageProxy,
    canvas: HTMLCanvasElement,
  ) => {
    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    await page.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const task = pdfjsLib.getDocument(src);
    task.promise
      .then(async (pdf) => {
        if (cancelled) return;
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = "";
        const total = pdf.numPages;

        for (let i = 1; i <= total; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const wrapper = document.createElement("div");
          wrapper.className = "flex justify-center py-4";
          const canvas = document.createElement("canvas");
          canvas.className = "max-w-full shadow-lg";
          wrapper.appendChild(canvas);
          container.appendChild(wrapper);
          await renderPage(page, canvas);
          page.cleanup();
        }

        if (!cancelled) setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError("Failed to load PDF preview.");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      task.destroy();
    };
  }, [src, renderPage]);

  if (!src) return null;

  if (error) {
    return (
      <div className="grid h-full place-items-center text-alvaro-muted">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-alvaro-surface">
          <Spinner />
        </div>
      )}
      <div ref={containerRef} className="min-h-full pb-8" data-testid="pdf-canvas-container" />
    </div>
  );
}
