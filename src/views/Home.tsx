import { useEffect, useState } from "react";
import { ScrambleWobble } from "src/components/ScrambleWobble";
import { useScrollReveal } from "src/hooks/useScrollReveal";
import { generateCV } from "src/utils/generateCV";
import { PdfViewer } from "src/components/PdfViewer";
import { CapWidget } from "src/components/CapWidget";
import toast, { Toaster } from "react-hot-toast";
import type { ExperienceEntry, AboutEntry, SkillEntry } from "src/utils/content";

interface HomeProps {
  experienceData: ExperienceEntry[];
  aboutData: AboutEntry[];
  skillsData: SkillEntry[];
}

export const Home = ({ experienceData, aboutData, skillsData }: HomeProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const [parallax, setParallax] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setParallax(window.scrollY * 0.12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenCV = async (token: string) => {
    setLoading(true);
    try {
      const verifyRes = await fetch("/api/cap/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!verifyRes.ok) {
        toast.error("Captcha verification failed. Please try again.");
        setShowCaptcha(false);
        setLoading(false);
        return;
      }
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
    <section
      id="home"
      className="relative min-h-[100dvh] grid md:grid-cols-[1.4fr_1fr] items-center justify-items-center md:justify-items-start gap-8 md:gap-16 px-4 md:px-0 overflow-hidden"
    >
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
      <div id="home-nav" className="absolute top-0 left-0" aria-hidden="true" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="mesh-blob absolute top-0 -left-1/4 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-alvaro-primary/6 blur-[140px]" />
        <div className="mesh-blob-delayed absolute bottom-0 -right-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-alvaro-primary/4 blur-[120px]" />
        <div className="mesh-blob-slow absolute top-1/3 left-1/2 w-[350px] h-[350px] md:w-[550px] md:h-[550px] rounded-full bg-alvaro-primary/3 blur-[100px]" />
      </div>

      <div className="absolute left-8 md:left-16 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-alvaro-primary/20 to-transparent hidden md:block" />

      <div ref={ref} className="relative z-10 space-y-8 text-center md:text-left md:pl-24">
        <p className="text-xs tracking-[0.2em] uppercase text-alvaro-primary/70 font-medium">
          Full Stack Developer
        </p>

        <h1 className="text-[clamp(3.5rem,10vw,8rem)] md:text-[clamp(5rem,8vw,9rem)] tracking-[-0.04em] leading-[0.82] font-bold">
          <ScrambleWobble text="ALVARO" className="block text-alvaro-white" />
          <ScrambleWobble text="GARCIA" className="block text-alvaro-muted" scrambleSpeed={50} />
          <ScrambleWobble text="MACIAS" className="block text-alvaro-white" scrambleSpeed={60} />
        </h1>

        <div
          className={`w-16 h-px bg-alvaro-primary/60 mx-auto md:mx-0 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 w-16" : "opacity-0 w-0"
          }`}
        />

        <p
          className={`text-alvaro-muted text-lg md:text-xl leading-relaxed max-w-[35ch] mx-auto md:mx-0 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Building interfaces that move.
        </p>

        <div
          className={`flex gap-4 justify-center md:justify-start pt-2 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <a
            href="#portfolio"
            className="group relative px-8 py-3.5 bg-alvaro-primary text-alvaro-dark font-semibold rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.97] hover:shadow-[0_0_30px_-5px_rgba(91,155,213,0.3)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <span className="relative">View work</span>
          </a>
          {(() => {
            if (!showCaptcha) {
              return (
                <button
                  type="button"
                  onClick={() => setShowCaptcha(true)}
                  className="px-8 py-3.5 border border-alvaro-border text-alvaro-white font-semibold rounded-xl hover:border-alvaro-primary/50 hover:text-alvaro-primary transition-all duration-300 active:scale-[0.97] cursor-pointer"
                >
                  CV
                </button>
              );
            }
            if (loading) {
              return (
                <span className="px-8 py-3.5 border border-alvaro-border text-alvaro-white font-semibold rounded-xl">
                  Generating...
                </span>
              );
            }
            return (
              <CapWidget
                onVerified={(token) => {
                  handleOpenCV(token);
                }}
              />
            );
          })()}
        </div>
      </div>

      <div
        className={`hidden md:block relative z-10 transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
        }`}
      >
        <div className="relative group">
          <div className="absolute -inset-6 rounded-3xl bg-alvaro-primary/5 blur-2xl group-hover:bg-alvaro-primary/12 transition-all duration-700" />
          <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-alvaro-primary/40 via-transparent to-alvaro-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          <img
            src="/images/profile/profile.png"
            alt="Alvaro Garcia Macias"
            decoding="async"
            className="relative w-80 h-80 object-cover rounded-3xl transition-all duration-700 group-hover:scale-[1.02]"
            style={{
              transform: `translateY(${parallax}px)`,
              willChange: "transform",
              border: "1px solid rgba(91,155,213,0.15)",
            }}
          />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-alvaro-base/60 via-transparent to-transparent" />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.2em] uppercase text-alvaro-muted/40">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-alvaro-primary/40 to-transparent" />
      </div>
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
