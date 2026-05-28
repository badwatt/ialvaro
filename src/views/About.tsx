import { FloatingTags } from "src/components/FloatingTags";
import { useScrollReveal } from "src/hooks/useScrollReveal";
import data from "src/data/biography.json";

const profileTags = ["React", "TypeScript", "Node.js", "Full Stack", "UI/UX"];

const selectedBio = data[2];

export default function About() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

  const paragraphs: string[] = selectedBio.bio.split("\n").filter(Boolean);

  return (
    <section
      id="about"
      className="relative min-h-[100dvh] md:min-h-0 grid items-center md:items-start overflow-hidden py-24 md:py-16"
    >
      <div id="about-nav" className="absolute top-0 left-0 scroll-mt-[4rem]" aria-hidden="true" />
      {/* Atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -right-1/3 w-[700px] h-[700px] rounded-full bg-alvaro-primary/3 blur-[150px]" />
        <div className="absolute bottom-0 -left-1/3 w-[600px] h-[600px] rounded-full bg-alvaro-primary/2 blur-[130px]" />
      </div>

      <div
        ref={ref}
        className="relative z-10 grid md:grid-cols-[1fr_1.3fr] gap-12 md:gap-24 items-center max-w-7xl mx-auto px-5 sm:px-6 lg:px-8"
      >
        {/* Left: Profile with floating tags */}
        <div className="relative flex justify-center">
          <div className="relative">
            <div className="absolute -inset-8 rounded-3xl bg-alvaro-primary/6 blur-3xl" />
            <div className="absolute -inset-[2px] rounded-3xl gradient-border -z-10 opacity-60" />
            <img
              src="/images/profile/profile_alt.png"
              alt="Alvaro Garcia Macias"
              className={`relative w-64 h-64 md:w-80 md:h-80 object-cover rounded-3xl transition-all duration-700 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              }`}
              style={{ border: "1px solid rgba(91,155,213,0.12)" }}
            />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-alvaro-primary/40 rounded-tr-lg" />
          </div>
          <div className="md:block">
            <FloatingTags tags={profileTags} />
          </div>
        </div>

        {/* Right: Editorial monograph */}
        <div className="space-y-12">
          {/* Label */}
          <div
            className={`flex items-center gap-3 transition-all duration-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-10 h-px bg-alvaro-primary/50" />
            <span className="text-[11px] tracking-[0.25em] uppercase text-alvaro-primary/60 font-medium">
              About me
            </span>
          </div>

          {/* Headline */}
          <h2
            className={`text-4xl md:text-6xl lg:text-7xl tracking-[-0.03em] leading-[0.85] font-bold transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-alvaro-white">I build</span>
            <br />
            <span className="text-alvaro-muted">things for</span>
            <br />
            <span className="text-alvaro-primary">the web.</span>
          </h2>

          {/* Decorative rule */}
          <div
            className={`w-16 h-px bg-alvaro-primary/30 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 w-16" : "opacity-0 w-0"
            }`}
          />

          {/* Bio paragraphs */}
          <div
            className={`space-y-6 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {paragraphs.map((text) => (
              <p
                key={text.slice(0, 20)}
                className="text-alvaro-muted/80 leading-relaxed text-[15px] md:text-base max-w-[55ch]"
              >
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
