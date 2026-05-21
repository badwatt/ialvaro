import { useScrollReveal } from "src/hooks/useScrollReveal";

type Props = {
  title: string;
};

export const Header = ({ title }: Props) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <>
      <div className="h-32 md:h-48" />
      <div ref={ref} className="mb-10 overflow-hidden">
        <h1
          className={`text-4xl md:text-5xl tracking-tight leading-none font-bold text-alvaro-white transition-all duration-700 ease-out origin-left ${
            isVisible ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
        >
          {title}
        </h1>
        <div
          className={`mt-3 h-[2px] bg-alvaro-primary transition-all duration-700 delay-200 ease-out origin-left ${
            isVisible ? "w-24 opacity-100" : "w-0 opacity-0"
          }`}
        />
      </div>
    </>
  );
};
