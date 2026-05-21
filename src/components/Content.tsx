import { useScrollReveal } from "src/hooks/useScrollReveal";

type Props = {
  children: React.ReactNode;
};

export const Content = ({ children }: Props) => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`p-6 md:p-8 transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      {children}
    </section>
  );
};
