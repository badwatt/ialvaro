import { useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { usePdfPages } from "src/hooks/usePdfPages";
import { renderPageToCanvas } from "src/utils/renderPageToCanvas";
import { Spinner } from "./Spinner";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfCanvasProps {
  src: string;
}

export function PdfCanvas({ src }: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { loading, error } = usePdfPages({
    src,
    containerRef,
    getDocument: pdfjsLib.getDocument,
    renderPage: renderPageToCanvas,
  });

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
