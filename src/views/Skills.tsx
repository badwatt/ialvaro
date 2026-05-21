import { useState } from "react";
import { Header } from "src/components/Header";
import { useScrollReveal } from "src/hooks/useScrollReveal";
import data from "src/data/skills.json";

const featuredIndices = new Set([0, 2, 6, 7, 12]);
const INITIAL_COUNT = 12;

export const Skills = () => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05 });
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? data : data.slice(0, INITIAL_COUNT);
  const hasMore = data.length > INITIAL_COUNT;

  return (
    <section id="skills" className="section-curve">
      <Header title="Skills" />
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 grid-flow-dense gap-4 md:gap-6">
        {visible.map(({ id, title, image, url }, i) => {
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

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2.5 text-sm font-medium text-alvaro-muted border border-alvaro-border rounded-lg hover:text-alvaro-primary hover:border-alvaro-primary/40 transition-colors duration-200 cursor-pointer"
          >
            {showAll ? "Show less" : `Show more (${data.length - INITIAL_COUNT})`}
          </button>
        </div>
      )}
    </section>
  );
};
