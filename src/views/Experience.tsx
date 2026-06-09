import { Header } from "src/components/Header";
import { Accordion } from "src/components/Accordion";
import { Markdown } from "src/components/Markdown";
import { parseExperienceSubgroups } from "src/utils/markdown";
import type { ExperienceEntry } from "src/utils/content";

interface ExperienceProps {
  experienceData: ExperienceEntry[];
}

export const Experience = ({ experienceData }: ExperienceProps) => {
  const items = experienceData.map((entry, i) => {
    const subgroups = parseExperienceSubgroups(entry.description);
    const hasSubgroups = subgroups.length > 1;
    return {
      id: String(i),
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
          {hasSubgroups ? (
            <Accordion
              items={subgroups.map((sub, j) => ({
                id: `${i}-${j}`,
                title: `Period ${j + 1}`,
                content: <Markdown source={sub} />,
              }))}
            />
          ) : (
            <Markdown source={entry.description} />
          )}
        </div>
      ),
    };
  });

  return (
    <section id="experience" className="section-curve relative">
      <div id="experience-nav" className="absolute top-0 left-0" aria-hidden="true" />
      <Header title="Experience" />
      <Accordion items={items} defaultOpenId="0" timeline />
    </section>
  );
};
