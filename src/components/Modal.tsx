import { useRef, useEffect } from "react";
import type { ReactNode } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function lockBodyScroll() {
  const previous = String(document.body.style.overflow);
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = previous;
  };
}

export function Modal({ isOpen, onClose, children, className = "", ariaLabel }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unlock = lockBodyScroll();

    const focusTimer = setTimeout(() => {
      panelRef.current?.focus();
    }, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      unlock();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      data-testid="modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-alvaro-base/80 backdrop-blur-md transition-opacity duration-300"
    >
      <div
        ref={panelRef}
        data-testid="modal-panel"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={stopPropagation}
        className={[
          "relative z-[61] overflow-hidden bg-alvaro-surface outline-none",
          "h-full w-full rounded-none",
          "md:h-[85vh] md:w-[90vw] md:rounded-3xl md:border md:border-alvaro-border md:shadow-2xl md:shadow-alvaro-primary/10",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
