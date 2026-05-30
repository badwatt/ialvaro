import { useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { usePdfPages } from "src/hooks/usePdfPages";
import { renderPageToCanvas } from "src/utils/renderPageToCanvas";
import { Spinner } from "./Spinner";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfCanvasProps {
  src: string;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export function PdfCanvas({ src, zoom = 1, onZoomChange }: PdfCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);
  const { loading, error } = usePdfPages({
    src,
    containerRef,
    getDocument: pdfjsLib.getDocument,
    renderPage: renderPageToCanvas,
  });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && onZoomChange) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        pinchRef.current = { startDist: dist, startZoom: zoom };
      }
    },
    [zoom, onZoomChange],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current && onZoomChange) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const ratio = dist / pinchRef.current.startDist;
        const newZoom = Math.min(
          Math.max(pinchRef.current.startZoom * ratio, 0.5),
          3,
        );
        onZoomChange(newZoom);
      }
    },
    [onZoomChange],
  );

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

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
        ref={containerRef}
        className="min-h-full pb-8 inline-block"
        data-testid="pdf-canvas-container"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
        }}
      />
    </div>
  );
}
