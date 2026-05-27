import { Header } from "src/components/Header";
import { useScrollReveal } from "src/hooks/useScrollReveal";
import data from "src/data/skills.json";

const featuredIndices = new Set([0, 2]);

export const Skills = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 });

  return (
    <section id="skills" className="section-curve">
      <Header title="Skills" />
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense gap-4 md:gap-6">
        {data.map(({ id, title, image, url }, i) => {
          const isFeatured = featuredIndices.has(i);
          return (
            <a
              key={id}
              href={url}
              rel="noopener noreferrer"
              target="_blank"
              className={`
								spotlight-card grid gap-3 p-6 text-center cursor-pointer place-items-center group transition-all duration-500
								${isFeatured ? "md:col-span-2 md:row-span-2 md:p-10" : ""}
								${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
							`}
              style={{ transitionDelay: `${i * 60}ms` }}
              aria-label={`Skill: ${title}`}
            >
              <img
                src={image}
                alt={title}
                className={`object-contain transition-transform duration-500 group-hover:scale-110 ${
                  isFeatured ? "w-32 h-32 md:w-48 md:h-48" : "w-24 h-24 md:w-32 md:h-32"
                }`}
              />
              <h2
                className={`font-medium text-alvaro-muted group-hover:text-alvaro-white transition-colors duration-200 ${
                  isFeatured ? "text-base md:text-lg" : "text-sm"
                }`}
              >
                {title}
              </h2>
            </a>
          );
        })}
      </div>
    </section>
  );
};