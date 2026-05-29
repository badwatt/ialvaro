import { X, Download } from "@phosphor-icons/react";
import { Modal } from "./Modal";
import { PdfCanvas } from "./PdfCanvas";

export interface PdfViewerProps {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
}

export function PdfViewer({ src, isOpen, onClose, fileName = "cv.pdf" }: PdfViewerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="CV preview">
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center justify-between border-b border-alvaro-border px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-alvaro-white">
            CV Preview
          </h3>
          <div className="flex items-center gap-3">
            <a
              href={src}
              download={fileName}
              className="rounded-full border border-alvaro-border bg-alvaro-surface p-2 text-alvaro-muted transition-all duration-300 hover:border-alvaro-primary/40 hover:text-alvaro-primary"
              aria-label="Download CV"
            >
              <Download size={20} weight="bold" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-alvaro-border bg-alvaro-surface p-2 text-alvaro-muted transition-all duration-300 hover:border-alvaro-primary/40 hover:text-alvaro-primary"
              aria-label="Close preview"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </header>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <PdfCanvas src={src} />
        </div>
      </div>
    </Modal>
  );
}
