import { useEffect, useState } from "react";
import { useScrollReveal } from "src/hooks/useScrollReveal";

type Props = {
  end: number;
  suffix?: string;
  duration?: number;
};

export const AnimatedCounter = ({ end, suffix = "", duration = 2000 }: Props) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollReveal({ once: true });

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const steps = duration / 16;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
};
