import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";

export const goToTop = () => {
  document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
};

export const Scrollup = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={goToTop}
      aria-label="Scroll to top"
      className="flex justify-center items-center fixed bottom-12 right-12 w-12 h-12 bg-alvaro-primary text-alvaro-dark rounded-full cursor-pointer hover:opacity-90 transition-all duration-300 active:scale-95 animate-[scaleIn_0.3s_ease-out] z-60"
    >
      <ArrowUp size={24} weight="bold" />
    </button>
  );
};
