import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@phosphor-icons/react";

const getInitialTheme = (): "dark" | "light" => {
  const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  if (stored === "light" || stored === "dark") return stored;

  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"dark" | "light">(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="p-2 rounded-lg text-alvaro-muted hover:text-alvaro-primary transition-colors duration-200 cursor-pointer"
    >
      {theme === "dark" ? (
        <SunIcon size={20} weight="bold" />
      ) : (
        <MoonIcon size={20} weight="bold" />
      )}
    </button>
  );
};
