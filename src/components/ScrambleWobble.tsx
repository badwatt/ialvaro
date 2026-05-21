import { useEffect, useState } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

type Props = {
  text: string;
  className?: string;
  scrambleSpeed?: number;
};

export const ScrambleWobble = ({ text, className = "", scrambleSpeed = 40 }: Props) => {
  const [display, setDisplay] = useState(text.split(""));
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplay(
        text.split("").map((char, i) => {
          if (char === " ") return " ";
          if (i < iteration) return text[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }),
      );

      iteration += 1 / 3;

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplay(text.split(""));
        setSettled(true);
      }
    }, scrambleSpeed);

    return () => clearInterval(interval);
  }, [text, scrambleSpeed]);

  return (
    <span className={className} aria-label={text}>
      {display.map((char, i) => (
        <span
          key={`${text}-${i}`}
          className={`inline-block cursor-default transition-colors duration-200 hover:text-alvaro-primary ${
            settled ? "rubber-band" : ""
          }`}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};
