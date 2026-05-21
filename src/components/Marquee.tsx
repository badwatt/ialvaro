type Props = {
  items: string[];
  speed?: number;
};

export const Marquee = ({ items, speed = 30 }: Props) => {
  const content = items.join("  \u2726  ");

  return (
    <div className="py-8 space-y-3 border-y border-alvaro-border overflow-hidden">
      {/* Row 1: left scroll */}
      <div className="marquee-container">
        <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
          <span className="text-2xl md:text-4xl font-bold tracking-tight text-alvaro-muted/20 px-4">
            {content} {"\u2726"} {content} {"\u2726"}
          </span>
          <span className="text-2xl md:text-4xl font-bold tracking-tight text-alvaro-muted/20 px-4">
            {content} {"\u2726"} {content} {"\u2726"}
          </span>
        </div>
      </div>
      {/* Row 2: right scroll */}
      <div className="marquee-container">
        <div className="marquee-track-reverse" style={{ animationDuration: `${speed * 0.8}s` }}>
          <span className="text-2xl md:text-4xl font-bold tracking-tight text-alvaro-primary/15 px-4">
            {content} {"\u2726"} {content} {"\u2726"}
          </span>
          <span className="text-2xl md:text-4xl font-bold tracking-tight text-alvaro-primary/15 px-4">
            {content} {"\u2726"} {content} {"\u2726"}
          </span>
        </div>
      </div>
    </div>
  );
};
