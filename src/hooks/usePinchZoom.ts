import { useRef, useCallback } from "react";
import { ZOOM_MIN, ZOOM_MAX } from "src/utils/pdfConstants";

interface PinchState {
  startDist: number;
  startZoom: number;
  centerX: number;
  centerY: number;
  scrollLeft: number;
  scrollTop: number;
}

export function usePinchZoom(
  zoom: number,
  onZoomChange: ((zoom: number) => void) | undefined,
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const pinchRef = useRef<PinchState | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2 || !onZoomChange || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      pinchRef.current = {
        startDist: Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        ),
        startZoom: zoom,
        centerX: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
        centerY: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
    },
    [zoom, onZoomChange, containerRef],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current || !onZoomChange || !containerRef.current) {
        return;
      }

      e.preventDefault();

      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );

      const ratio = dist / pinchRef.current.startDist;
      const newZoom = Math.min(Math.max(pinchRef.current.startZoom * ratio, ZOOM_MIN), ZOOM_MAX);

      const container = containerRef.current;
      const zoomRatio = newZoom / pinchRef.current.startZoom;
      container.scrollLeft =
        (pinchRef.current.scrollLeft + pinchRef.current.centerX) * zoomRatio -
        pinchRef.current.centerX;
      container.scrollTop =
        (pinchRef.current.scrollTop + pinchRef.current.centerY) * zoomRatio -
        pinchRef.current.centerY;

      onZoomChange(newZoom);
    },
    [onZoomChange, containerRef],
  );

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}
