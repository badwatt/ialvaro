import { useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { usePdfPages } from "src/hooks/usePdfPages";
import { usePinchZoom } from "src/hooks/usePinchZoom";
import { renderPageToCanvas } from "src/utils/renderPageToCanvas";
import { Spinner } from "./Spinner";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfCanvasProps {
  src: string;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export function PdfCanvas({ src, zoom = 1, onZoomChange }: PdfCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { loading, error } = usePdfPages({
    src,
    containerRef: canvasRef,
    getDocument: pdfjsLib.getDocument,
    renderPage: renderPageToCanvas,
  });

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = usePinchZoom(
    zoom,
    onZoomChange,
    wrapperRef,
  );

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    for (const canvas of container.querySelectorAll("canvas")) {
      (canvas as HTMLCanvasElement).style.width = `${zoom * 100}%`;
    }
  }, [zoom, loading]);

  if (!src) return null;

  if (error) {
    return (
      <div className="grid h-full place-items-center text-alvaro-muted">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="relative h-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {loading && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-alvaro-surface">
          <Spinner />
        </div>
      )}
      <div
        ref={canvasRef}
        className="min-h-full pb-8 w-full"
        data-testid="pdf-canvas-container"
      />
    </div>
  );
}
