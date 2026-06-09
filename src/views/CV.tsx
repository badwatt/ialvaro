import { useState } from "react";
import { ArrowLeftIcon, FileTextIcon, SpinnerIcon } from "@phosphor-icons/react";
import { CapWidget } from "src/components/CapWidget";
import { CVThemePicker } from "src/components/CVThemePicker";
import { PdfViewer } from "src/components/PdfViewer";
import { generateCV } from "src/utils/generateCV";
import { getThemeById, type CVTheme } from "src/utils/cvThemes";
import toast, { Toaster } from "react-hot-toast";
import type { ExperienceEntry, AboutEntry, SkillEntry } from "src/utils/content";

interface CVProps {
  experienceData: ExperienceEntry[];
  aboutData: AboutEntry[];
  skillsData: SkillEntry[];
}

type CVStep = "idle" | "themes" | "captcha" | "loading";

const DEFAULT_THEME: CVTheme = getThemeById("default");

export const CV = ({ experienceData, aboutData, skillsData }: CVProps) => {
  const [step, setStep] = useState<CVStep>("idle");
  const [theme, setTheme] = useState<CVTheme>(DEFAULT_THEME);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  const handleOpen = async (token: string) => {
    setStep("loading");
    try {
      const verifyRes = await fetch("/api/cap/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!verifyRes.ok) {
        toast.error("Captcha verification failed. Please try again.");
        setStep("captcha");
        return;
      }
      const url = await generateCV(theme, experienceData, aboutData, skillsData);
      setPdfUrl(url);
      setShowViewer(true);
      setStep("idle");
    } catch (err) {
      console.error("CV generation failed:", err);
      toast.error("CV generation failed. Please try again.");
      setStep("captcha");
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
      {renderStep(step, {
        onOpen: () => setStep("themes"),
        onPickTheme: (next) => {
          setTheme(next);
          setStep("captcha");
        },
        onBackToThemes: () => setStep("themes"),
        onVerified: handleOpen,
        selectedTheme: theme,
      })}
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

interface StepHandlers {
  onOpen: () => void;
  onPickTheme: (theme: CVTheme) => void;
  onBackToThemes: () => void;
  onVerified: (token: string) => void;
  selectedTheme: CVTheme;
}

function renderStep(step: CVStep, h: StepHandlers) {
  switch (step) {
    case "idle":
      return <IdleStep onOpen={h.onOpen} />;
    case "themes":
      return <CVThemePicker selectedId={h.selectedTheme.id} onSelect={h.onPickTheme} />;
    case "captcha":
      return (
        <CaptchaStep theme={h.selectedTheme} onBack={h.onBackToThemes} onVerified={h.onVerified} />
      );
    case "loading":
      return <LoadingStep theme={h.selectedTheme} />;
  }
}

function IdleStep({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-label="Open CV"
      onClick={onOpen}
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

function CaptchaStep({
  theme,
  onBack,
  onVerified,
}: {
  theme: CVTheme;
  onBack: () => void;
  onVerified: (token: string) => void;
}) {
  return (
    <div className="w-full p-8 md:p-12 rounded-3xl bg-alvaro-surface border border-alvaro-border">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl tracking-[-0.03em] font-bold text-alvaro-white">
            Verify to generate
          </h2>
          <p className="mt-2 text-sm text-alvaro-muted">One quick check, then your PDF is ready.</p>
        </div>
        <SelectedThemeBadge theme={theme} />
      </div>
      <div className="grid place-items-center">
        <CapWidget onVerified={onVerified} />
      </div>
      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs text-alvaro-muted hover:text-alvaro-primary transition-colors duration-300 cursor-pointer"
        >
          <ArrowLeftIcon size={14} weight="bold" />
          Back to themes
        </button>
      </div>
    </div>
  );
}

function SelectedThemeBadge({ theme }: { theme: CVTheme }) {
  const base = `rgb(${theme.colors.base.join(", ")})`;
  const accent = `rgb(${theme.colors.accent.join(", ")})`;
  return (
    <div
      className="inline-flex items-center gap-3 rounded-full border border-alvaro-border bg-alvaro-base/60 px-3 py-1.5"
      aria-label={`Selected theme: ${theme.name}`}
    >
      <span
        className="inline-block h-3 w-3 rounded-full border border-alvaro-border"
        style={{ backgroundColor: base }}
        aria-hidden="true"
      />
      <span
        className="inline-block h-3 w-3 rounded-full border border-alvaro-border"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
      <span className="text-[11px] font-mono uppercase tracking-widest text-alvaro-muted">
        {theme.name}
      </span>
    </div>
  );
}

function LoadingStep({ theme }: { theme: CVTheme }) {
  return (
    <div className="w-full grid place-items-center p-12 md:p-20 rounded-3xl bg-alvaro-surface border border-alvaro-border">
      <h2 className="relative z-10 text-4xl md:text-5xl tracking-[-0.03em] font-bold text-alvaro-white">
        Generating CV...
      </h2>
      <div className="relative z-10 mt-6 p-3 rounded-full bg-alvaro-primary/10">
        <SpinnerIcon size={32} weight="bold" className="text-alvaro-primary animate-spin" />
      </div>
      <p className="relative z-10 mt-4 text-xs font-mono uppercase tracking-widest text-alvaro-muted">
        {theme.name}
      </p>
    </div>
  );
}
