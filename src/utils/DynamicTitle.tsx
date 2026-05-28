import { useEffect, useState } from "react";

const sections = ["Home", "About", "Skills", "Experience", "Portfolio", "CV", "Contact"];

const getSiteName = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  return parts.length >= 2 ? parts[parts.length - 2] : host;
};

const syncHash = (id: string) => {
  const target = id === "home" ? "#" : `#${id}`;
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
  const [title, setTitle] = useState<string>();

  useEffect(() => {
    const site = getSiteName();
    setTitle(`Home | ${site}`);

    const updateTitle = () => {
      const scrollY = window.scrollY;

      if (scrollY < 100) {
        setTitle(`Home | ${site}`);
        syncHash("home");
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const id = sections[i].toLowerCase();
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150) {
            setTitle(`${sections[i]} | ${site}`);
            syncHash(id);
            return;
          }
        }
      }

      setTitle(site);
      clearHash();
    };

    updateTitle();
    window.addEventListener("scroll", updateTitle, { passive: true });
    return () => window.removeEventListener("scroll", updateTitle);
  }, []);

  if (!title) return null;

  return <title>{title}</title>;
};
