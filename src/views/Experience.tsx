import { Header } from "src/components/Header";
import { Accordion } from "src/components/Accordion";
import { parseDescription } from "src/utils/generateCV";
import type { ExperienceEntry } from "src/utils/content";

interface ExperienceProps {
  experienceData: ExperienceEntry[];
}

export const Experience = ({ experienceData }: ExperienceProps) => {
  const items = experienceData.map((entry) => {
    const sections = parseDescription(entry.description);
    return {
      id: String(entry.id),
      title: entry.title,
      subtitle: `${entry.date_from} \u2014 ${entry.date_to}`,
      content: (
        <div className="grid md:grid-cols-[1fr_2fr] gap-8 pt-2">
          <div className="flex items-start">
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={entry.title}
              className="block"
            >
              <img
                src={entry.image}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                className="w-48 h-32 object-contain rounded-xl transition-transform duration-500 hover:scale-105"
              />
            </a>
          </div>
          <div className="space-y-4 text-alvaro-muted leading-relaxed">
            {sections.map((sec, i) => (
              <div key={i}>
                <h4 className="text-base font-medium text-alvaro-white mb-1">{sec.title}</h4>
                <p className="text-sm whitespace-pre-line">{sec.content}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    };
  });

  return (
    <section id="experience" className="section-curve relative">
      <div id="experience-nav" className="absolute top-0 left-0" aria-hidden="true" />
      <Header title="Experience" />
      <Accordion items={items} defaultOpenId={String(experienceData[0].id)} timeline />
    </section>
  );
};
