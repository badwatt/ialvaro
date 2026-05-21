import { useScrollReveal } from "src/hooks/useScrollReveal";

type Props = {
  children: React.ReactNode;
  once?: boolean;
};

export const LazyView = ({ children, once = true }: Props) => {
  const { ref, isVisible } = useScrollReveal({ once });

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
    >
      {children}
    </div>
  );
};
