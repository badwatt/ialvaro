import { useRef } from "react";
import { rubberBandKeyframes, rubberBandTiming, triggerRubberBand } from "src/components/ScrambleWobble";

export { rubberBandKeyframes, rubberBandTiming };

type Props = {
  sentence: string;
};

export const Wobble = ({ sentence }: Props) => {
  const playingRefs = useRef<Map<number, boolean>>(new Map());
  const elementsRef = useRef<Map<number, HTMLElement>>(new Map());

  return (
    <>
      {sentence.split("").map((letter, i) => (
        <span
          key={`${sentence}-${i}`}
          ref={(el) => {
            if (el) elementsRef.current.set(i, el);
          }}
          onMouseEnter={() => triggerRubberBand(i, elementsRef.current, playingRefs.current)}
          className="inline-block cursor-default text-6xl md:text-8xl tracking-tighter leading-none font-bold text-alvaro-white transition-colors duration-200 hover:text-alvaro-primary"
          aria-label="wobble"
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
      <br />
    </>
  );
};