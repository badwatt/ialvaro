import { Header } from "src/components/Header";
import { Accordion } from "src/components/Accordion";
import data from "src/data/experience.json";

export const Experience = () => {
  const items = data.map((entry) => ({
    id: String(entry.id),
    title: entry.title,
    subtitle: `${entry.date_from} — ${entry.date_to}`,
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
              className="w-48 h-32 object-contain rounded-xl transition-transform duration-500 hover:scale-105"
            />
          </a>
        </div>
        <div className="space-y-4 text-alvaro-muted leading-relaxed">
          {entry.description?.title?.one && (
            <div>
              <h4 className="text-base font-medium text-alvaro-white mb-1">
                {entry.description.title.one}
              </h4>
              <p className="text-sm">{entry.description.content?.one}</p>
            </div>
          )}
          {entry.description?.title?.two && (
            <div>
              <h4 className="text-base font-medium text-alvaro-white mb-1">
                {entry.description.title.two}
              </h4>
              <p className="text-sm">{entry.description.content?.two}</p>
            </div>
          )}
          {entry.description?.title?.three && (
            <div>
              <h4 className="text-base font-medium text-alvaro-white mb-1">
                {entry.description.title.three}
              </h4>
              <p className="text-sm">{entry.description.content?.three}</p>
            </div>
          )}
          {entry.description?.title?.four && (
            <div>
              <h4 className="text-base font-medium text-alvaro-white mb-1">
                {entry.description.title.four}
              </h4>
              <p className="text-sm">{entry.description.content?.four}</p>
            </div>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <section id="experience" className="section-curve relative">
      <div id="experience-nav" className="absolute top-0 left-0" aria-hidden="true" />
      <Header title="Experience" />
      <Accordion items={items} defaultOpenId={String(data[0].id)} />
    </section>
  );
};
