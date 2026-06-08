import { useState, useCallback } from "react";
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_DESKTOP, ZOOM_MOBILE } from "src/utils/pdfConstants";

const DESKTOP_MIN_WIDTH = 768;

export function getResponsiveDefaultZoom(): number {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return ZOOM_MOBILE;
  }
  return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches
    ? ZOOM_DESKTOP
    : ZOOM_MOBILE;
}

export function useZoom(initial?: number) {
  const [zoom, setZoom] = useState(initial ?? getResponsiveDefaultZoom());

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(Number((z + ZOOM_STEP).toFixed(2)), ZOOM_MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(Number((z - ZOOM_STEP).toFixed(2)), ZOOM_MIN));
  }, []);

  return { zoom, setZoom, zoomIn, zoomOut };
}
