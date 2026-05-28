import { useCallback, useState } from "react";
import { DownloadSimpleIcon, SpinnerIcon } from "@phosphor-icons/react";
import { pdf } from "@react-pdf/renderer";
import { CVDocument } from "src/components/CVDocument";

export const CV = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const blob = await pdf(<CVDocument domain={window.location.hostname} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Alvaro_Garcia_Macias_CV_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CV generation failed:", err);
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <section id="cv" className="section-curve mt-32 md:mt-48 px-4 md:px-0">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        aria-label="Download CV"
        className="w-full grid place-items-center p-12 md:p-20 rounded-3xl bg-alvaro-surface border border-alvaro-border hover:border-alvaro-primary/40 transition-all duration-500 group cursor-pointer active:scale-[0.99] relative overflow-hidden disabled:opacity-60"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-linear-to-br from-alvaro-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-alvaro-primary/20 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-alvaro-primary/20 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />

        <h2 className="relative z-10 text-4xl md:text-5xl tracking-[-0.03em] font-bold text-alvaro-white group-hover:text-alvaro-primary transition-colors duration-300">
          {downloading ? "Generating CV..." : "Download my CV"}
        </h2>
        <div className="relative z-10 mt-6 p-3 rounded-full bg-alvaro-primary/10 group-hover:bg-alvaro-primary/20 transition-all duration-300">
          {downloading ? (
            <SpinnerIcon size={32} weight="bold" className="text-alvaro-primary animate-spin" />
          ) : (
            <DownloadSimpleIcon
              size={32}
              weight="bold"
              className="text-alvaro-muted group-hover:text-alvaro-primary transition-colors duration-300"
            />
          )}
        </div>
      </button>
    </section>
  );
};
