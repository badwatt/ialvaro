import { useEffect, useState } from "react";

const sections = ["Home", "About", "Skills", "Experience", "Portfolio", "CV", "Contact"];

const syncHash = (id: string) => {
  const target = `#${id}`;
  if (window.location.hash !== target) {
    history.replaceState(null, "", target);
  }
};

const clearHash = () => {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname);
  }
};

export const DynamicTitle = () => {
  const [title, setTitle] = useState("ialvaro");

  useEffect(() => {
    const updateTitle = () => {
      const scrollY = window.scrollY;

      if (scrollY < 100) {
        setTitle("Home | ialvaro");
        syncHash("home");
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i].toLowerCase();
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setTitle(`${sections[i]} | ialvaro`);
            syncHash(id);
            return;
          }
        }
      }

      clearHash();
    };

    updateTitle();
    window.addEventListener("scroll", updateTitle, { passive: true });
    return () => window.removeEventListener("scroll", updateTitle);
  }, []);

  return <title>{title}</title>;
};