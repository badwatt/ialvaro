import { useState } from "react";
import { FileTextIcon, SpinnerIcon } from "@phosphor-icons/react";
import { CapWidget } from "src/components/CapWidget";
import { PdfViewer } from "src/components/PdfViewer";
import { generateCV } from "src/utils/generateCV";
import toast, { Toaster } from "react-hot-toast";
import type { ExperienceEntry, AboutEntry, SkillEntry } from "src/utils/content";

interface CVProps {
  experienceData: ExperienceEntry[];
  aboutData: AboutEntry[];
  skillsData: SkillEntry[];
}

export const CV = ({ experienceData, aboutData, skillsData }: CVProps) => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleOpen = async (token: string) => {
    setLoading(true);
    let verified = false;
    try {
      const verifyRes = await fetch("/api/cap/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!verifyRes.ok) {
        toast.error("Captcha verification failed. Please try again.");
        return;
      }
      verified = true;
      const url = await generateCV(experienceData, aboutData, skillsData);
      setPdfUrl(url);
      setShowViewer(true);
    } catch (err) {
      console.error("CV generation failed:", err);
      toast.error("CV generation failed. Please try again.");
    } finally {
      setLoading(false);
      setShowCaptcha(false);
    }
  };

  return (
    <section id="cv" className="section-curve mt-32 md:mt-48 px-4 md:px-0">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--color-alvaro-surface)",
            color: "var(--color-alvaro-white)",
            border: "1px solid var(--color-alvaro-border)",
          },
        }}
      />
      {(() => {
        if (!showCaptcha) {
          return (
            <button
              type="button"
              aria-label="Open CV"
              onClick={() => setShowCaptcha(true)}
              className="w-full grid place-items-center p-12 md:p-20 rounded-3xl bg-alvaro-surface border border-alvaro-border hover:border-alvaro-primary/40 transition-all duration-500 group cursor-pointer active:scale-[0.99] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-alvaro-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-alvaro-primary/20 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-alvaro-primary/20 rounded-br-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
              <h2 className="relative z-10 text-4xl md:text-5xl tracking-[-0.03em] font-bold text-alvaro-white group-hover:text-alvaro-primary transition-colors duration-300">
                Check out my CV
              </h2>
              <div className="relative z-10 mt-6 p-3 rounded-full bg-alvaro-primary/10 group-hover:bg-alvaro-primary/20 transition-all duration-300">
                <FileTextIcon
                  size={32}
                  weight="bold"
                  className="text-alvaro-muted group-hover:text-alvaro-primary transition-colors duration-300"
                />
              </div>
            </button>
          );
        }
        if (loading) {
          return (
            <div className="w-full grid place-items-center p-12 md:p-20 rounded-3xl bg-alvaro-surface border border-alvaro-border">
              <h2 className="relative z-10 text-4xl md:text-5xl tracking-[-0.03em] font-bold text-alvaro-white">
                Generating CV...
              </h2>
              <div className="relative z-10 mt-6 p-3 rounded-full bg-alvaro-primary/10">
                <SpinnerIcon size={32} weight="bold" className="text-alvaro-primary animate-spin" />
              </div>
            </div>
          );
        }
        return (
          <div className="w-full grid place-items-center p-12 md:p-20 rounded-3xl bg-alvaro-surface border border-alvaro-border">
            <CapWidget
              onVerified={(token) => {
                handleOpen(token);
              }}
            />
          </div>
        );
      })()}
      <PdfViewer
        src={pdfUrl ?? ""}
        isOpen={showViewer}
        onClose={() => {
          if (pdfUrl) URL.revokeObjectURL(pdfUrl);
          setPdfUrl(null);
          setShowViewer(false);
        }}
      />
    </section>
  );
};
