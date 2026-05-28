import { useCallback } from "react";
import { FileTextIcon } from "@phosphor-icons/react";
import { useCVGenerator } from "src/hooks/useCVGenerator";
import { CVPreview } from "src/components/CVPreview";

export const CV = () => {
  const { state, generate, download, reset } = useCVGenerator();

  const handleOpen = useCallback(() => {
    generate();
  }, [generate]);

  const handleClose = useCallback(() => {
    reset();
  }, [reset]);

  const isOpen = state.status === "generating" || state.status === "ready";

  return (
    <>
      <section id="cv" className="section-curve mt-32 md:mt-48 px-4 md:px-0">
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Preview CV"
          className="w-full grid place-items-center p-12 md:p-20 rounded-3xl bg-alvaro-surface border border-alvaro-border hover:border-alvaro-primary/40 transition-all duration-500 group cursor-pointer active:scale-[0.99] relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-linear-to-br from-alvaro-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-alvaro-primary/20 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-alvaro-primary/20 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />

          <h2 className="relative z-10 text-4xl md:text-5xl tracking-[-0.03em] font-bold text-alvaro-white group-hover:text-alvaro-primary transition-colors duration-300">
            Preview my CV
          </h2>
          <div className="relative z-10 mt-6 p-3 rounded-full bg-alvaro-primary/10 group-hover:bg-alvaro-primary/20 transition-all duration-300">
            <FileTextIcon
              size={32}
              weight="bold"
              className="text-alvaro-muted group-hover:text-alvaro-primary transition-colors duration-300"
            />
          </div>
        </button>
      </section>

      {isOpen && (
        <CVPreview
          url={state.status === "ready" ? state.url : null}
          isGenerating={state.status === "generating"}
          onClose={handleClose}
          onDownload={download}
        />
      )}
    </>
  );
};
