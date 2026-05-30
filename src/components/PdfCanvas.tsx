import { useRef, useCallback, useEffect } from "react";
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{
    startDist: number;
    startZoom: number;
    centerX: number;
    centerY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const { loading, error } = usePdfPages({
    src,
    containerRef: canvasRef,
    getDocument: pdfjsLib.getDocument,
    renderPage: renderPageToCanvas,
  });

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    const canvases = container.querySelectorAll("canvas");
    canvases.forEach((canvas) => {
      (canvas as HTMLCanvasElement).style.width = `${zoom * 100}%`;
    });
  }, [zoom, loading]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && onZoomChange && wrapperRef.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const wrapper = wrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        pinchRef.current = {
          startDist: dist,
          startZoom: zoom,
          centerX: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
          centerY: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
          scrollLeft: wrapper.scrollLeft,
          scrollTop: wrapper.scrollTop,
        };
      }
    },
    [zoom, onZoomChange],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current && onZoomChange && wrapperRef.current) {
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

        const wrapper = wrapperRef.current;
        const zoomRatio = newZoom / pinchRef.current.startZoom;
        wrapper.scrollLeft =
          (pinchRef.current.scrollLeft + pinchRef.current.centerX) * zoomRatio -
          pinchRef.current.centerX;
        wrapper.scrollTop =
          (pinchRef.current.scrollTop + pinchRef.current.centerY) * zoomRatio -
          pinchRef.current.centerY;

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
