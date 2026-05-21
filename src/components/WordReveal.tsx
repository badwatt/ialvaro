import { useScrollReveal } from "src/hooks/useScrollReveal";

type Props = {
  text: string;
  className?: string;
};

export const WordReveal = ({ text, className = "" }: Props) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={`inline-block transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
          style={{
            transitionDelay: `${Math.min(i * 25, 800)}ms`,
          }}
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
};
