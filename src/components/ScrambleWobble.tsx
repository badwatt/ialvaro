import { useEffect, useRef, useState } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const rubberBandKeyframes: Keyframe[] = [
  { transform: "scale3d(1, 1, 1)" },
  { transform: "scale3d(1.4, 0.55, 1)" },
  { transform: "scale3d(0.75, 1.25, 1)" },
  { transform: "scale3d(1.25, 0.85, 1)" },
  { transform: "scale3d(0.9, 1.05, 1)" },
  { transform: "scale3d(1, 1, 1)" },
];

export const rubberBandTiming: KeyframeAnimationOptions = {
  duration: 800,
  easing: "ease",
  fill: "none",
};

export function triggerRubberBand(
  i: number,
  elements: Map<number, HTMLElement>,
  playing: Map<number, boolean>,
) {
  if (playing.get(i)) return;
  const el = elements.get(i);
  if (!el) return;

  playing.set(i, true);
  const anim = el.animate(rubberBandKeyframes, rubberBandTiming);
  anim.onfinish = () => playing.set(i, false);
}

type Props = {
  text: string;
  className?: string;
  scrambleSpeed?: number;
};

export const ScrambleWobble = ({ text, className = "", scrambleSpeed = 40 }: Props) => {
  const [display, setDisplay] = useState(text.split(""));
  const [settled, setSettled] = useState(false);
  const playingRefs = useRef<Map<number, boolean>>(new Map());
  const elementsRef = useRef<Map<number, HTMLElement>>(new Map());

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
          ref={(el) => {
            if (el) elementsRef.current.set(i, el);
          }}
          onMouseEnter={
            settled
              ? () => triggerRubberBand(i, elementsRef.current, playingRefs.current)
              : undefined
          }
          className="inline-block cursor-default transition-colors duration-200 hover:text-alvaro-primary"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};
