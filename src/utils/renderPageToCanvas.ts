import type { PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  containerWidth?: number,
) {
  const dpr = window.devicePixelRatio || 1;
  const base = page.getViewport({ scale: 1 });
  const scale = containerWidth && containerWidth > 0
    ? containerWidth / base.width
    : 1.5;
  const viewport = page.getViewport({ scale });

  canvas.width = viewport.width * dpr;
  canvas.height = viewport.height * dpr;
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  await page.render({ canvasContext: ctx, viewport }).promise;
}
