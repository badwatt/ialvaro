import { useState, useCallback } from "react";
import { ZOOM_MIN, ZOOM_MAX, ZOOM_STEP, ZOOM_DEFAULT } from "src/utils/pdfConstants";

export function useZoom(initial = ZOOM_DEFAULT) {
  const [zoom, setZoom] = useState(initial);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(Number((z + ZOOM_STEP).toFixed(2)), ZOOM_MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => Math.max(Number((z - ZOOM_STEP).toFixed(2)), ZOOM_MIN));
  }, []);

  return { zoom, setZoom, zoomIn, zoomOut };
}
