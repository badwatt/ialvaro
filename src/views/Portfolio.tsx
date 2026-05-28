import { Header } from "src/components/Header";
import { SpotlightCard } from "src/components/SpotlightCard";
import type { PortfolioEntry } from "src/utils/content";

interface PortfolioProps {
  portfolioData: PortfolioEntry[];
}

export const Portfolio = ({ portfolioData }: PortfolioProps) => {
  return (
    <section id="portfolio" className="section-curve relative">
      <div id="portfolio-nav" className="absolute top-0 left-0" aria-hidden="true" />
      <Header title="Portfolio" />
      <div className="space-y-6">
        {portfolioData.map(({ id, title, image, url, description }, i) => (
          <SpotlightCard
            key={id}
            className={`sticky grid md:grid-cols-[1fr_2fr] gap-8 p-6 md:p-10 group`}
          >
            <div
              className="grid cursor-pointer place-items-center rounded-2xl overflow-hidden bg-alvaro-base/50"
              style={{ zIndex: i + 1 }}
            >
              <a href={url} target="_blank" rel="noopener noreferrer" aria-label={title}>
                <img
                  src={image}
                  alt={title}
                  className="object-contain max-h-40 transition-transform duration-700 group-hover:scale-105"
                />
              </a>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="mb-4 text-3xl md:text-4xl tracking-tighter leading-none font-bold text-alvaro-white">
                {title}
              </h2>
              <p className="text-alvaro-muted leading-relaxed max-w-[60ch]">{description}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-alvaro-primary hover:underline underline-offset-4"
              >
                View project
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  &rarr;
                </span>
              </a>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};
