import { SpotlightCard } from "src/components/SpotlightCard";
import { useScrollReveal } from "src/hooks/useScrollReveal";

const testimonials = [
  {
    quote:
      "Alvaro brings exceptional technical depth to every project. His ability to translate complex requirements into clean, maintainable code is remarkable.",
    name: "María Fernández",
    role: "CTO at NovaByte",
    avatar: "https://picsum.photos/seed/maria-fernandez/100/100",
  },
  {
    quote:
      "One of the most reliable developers I have worked with. Consistently delivers on time with outstanding quality.",
    name: "Carlos Ruíz",
    role: "Lead Engineer at DataPulse",
    avatar: "https://picsum.photos/seed/carlos-ruiz/100/100",
  },
  {
    quote:
      "Clean code, great communication, always delivers. Alvaro is the kind of developer every team needs.",
    name: "Elena Torres",
    role: "Product Manager at SynthWave",
    avatar: "https://picsum.photos/seed/elena-torres/100/100",
  },
];

export const Testimonials = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="testimonials" className="section-curve py-32 md:py-48 px-4 md:px-0">
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl tracking-tight font-bold text-alvaro-white">
          What people say
        </h2>
        <div className="mt-3 mx-auto w-16 h-[2px] bg-alvaro-primary" />
      </div>
      <div ref={ref} className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <SpotlightCard
            key={t.name}
            className={`p-8 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <blockquote className="text-alvaro-muted leading-relaxed mb-6">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full object-cover border border-alvaro-border"
              />
              <div>
                <p className="text-sm font-semibold text-alvaro-white">{t.name}</p>
                <p className="text-xs text-alvaro-muted">{t.role}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};
