import { useScrollReveal } from "src/hooks/useScrollReveal";

type Props = {
  tags: string[];
};

export const FloatingTags = ({ tags }: Props) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none">
      {tags.map((tag, i) => {
        const angle = (i / tags.length) * Math.PI * 2 - Math.PI / 2;
        const radiusX = 170;
        const radiusY = 160;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;

        return (
          <span
            key={tag}
            className={`absolute px-3 py-1.5 text-xs font-medium bg-alvaro-surface/80 backdrop-blur-sm border border-alvaro-border rounded-full text-alvaro-muted float transition-all duration-700 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: "translate(-50%, -50%)",
              transitionDelay: `${i * 100 + 300}ms`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + i * 0.4}s`,
            }}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
};
