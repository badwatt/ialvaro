import { AnimatedCounter } from "src/components/AnimatedCounter";
import experienceData from "src/data/experience.json";
import portfolioData from "src/data/portfolio.json";
import skillsData from "src/data/skills.json";

function getYearsExperience(): number {
  const dates = experienceData.map((e) => new Date(`${e.date_from} 01`));
  const earliest = new Date(Math.min(...dates.map((d) => d.getTime())));
  const now = new Date();
  const diffMs = now.getTime() - earliest.getTime();
  const years = Math.round(diffMs / (365.25 * 24 * 60 * 60 * 1000));
  return years;
}

const stats = [
  {
    value: getYearsExperience(),
    suffix: "+",
    label: "Years experience",
    bar: 60,
  },
  {
    value: portfolioData.length,
    suffix: "+",
    label: "Projects delivered",
    bar: 80,
  },
  {
    value: skillsData.length,
    suffix: "",
    label: "Technologies",
    bar: 50,
  },
  {
    value: 100,
    suffix: "%",
    label: "Commitment",
    bar: 100,
    accent: true,
  },
];

export const Stats = () => {
  return (
    <section className="py-32 md:py-48">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div
              className={`text-5xl md:text-7xl font-bold tracking-tighter ${
                stat.accent ? "text-alvaro-primary" : "text-alvaro-white"
              }`}
            >
              <AnimatedCounter end={stat.value} suffix={stat.suffix} />
            </div>
            {/* Progress bar */}
            <div className="mt-3 mx-auto w-16 h-1 bg-alvaro-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 delay-500 ${
                  stat.accent ? "bg-alvaro-primary" : "bg-alvaro-muted/50"
                }`}
                style={{ width: `${stat.bar}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-alvaro-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
