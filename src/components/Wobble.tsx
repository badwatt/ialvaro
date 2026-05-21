type Props = {
  sentence: string;
};

export const Wobble = ({ sentence }: Props) => {
  return (
    <>
      {sentence.split("").map((letter, i) => (
        <span
          key={`${sentence}-${i}`}
          className="inline-block cursor-default text-6xl md:text-8xl tracking-tighter leading-none font-bold text-alvaro-white rubber-band transition-colors duration-200 hover:text-alvaro-primary"
          aria-label="wobble"
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
      <br />
    </>
  );
};
