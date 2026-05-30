import { XIcon, DownloadIcon, MagnifyingGlassPlus, MagnifyingGlassMinus } from "@phosphor-icons/react";
import { Modal } from "./Modal";
import { PdfCanvas } from "./PdfCanvas";
import { useZoom } from "src/hooks/useZoom";

export interface PdfViewerProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function PdfViewer({ src, isOpen, onClose, fileName = "cv.pdf" }: PdfViewerProps) {
  const { zoom, setZoom, zoomIn, zoomOut } = useZoom();

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="CV preview">
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-alvaro-border px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-alvaro-white">
            CV Preview
          </h3>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={zoomOut}
                className="rounded-full border border-alvaro-border bg-alvaro-surface p-2 text-alvaro-muted transition-all duration-300 hover:border-alvaro-primary/40 hover:text-alvaro-primary cursor-pointer"
                aria-label="Zoom out"
              >
                <MagnifyingGlassMinus size={20} weight="bold" />
              </button>
              <span className="text-xs text-alvaro-muted w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="rounded-full border border-alvaro-border bg-alvaro-surface p-2 text-alvaro-muted transition-all duration-300 hover:border-alvaro-primary/40 hover:text-alvaro-primary cursor-pointer"
                aria-label="Zoom in"
              >
                <MagnifyingGlassPlus size={20} weight="bold" />
              </button>
            </div>
            <a
              href={src}
              download={fileName}
              className="rounded-full border border-alvaro-border bg-alvaro-surface p-2 text-alvaro-muted transition-all duration-300 hover:border-alvaro-primary/40 hover:text-alvaro-primary"
              aria-label="Download CV"
            >
              <DownloadIcon size={20} weight="bold" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-alvaro-border bg-alvaro-surface p-2 text-alvaro-muted transition-all duration-300 hover:border-alvaro-primary/40 hover:text-alvaro-primary"
              aria-label="Close preview"
            >
              <XIcon size={20} weight="bold" />
            </button>
          </div>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <PdfCanvas src={src} zoom={zoom} onZoomChange={setZoom} />
        </div>
      </div>
    </Modal>
  );
}
