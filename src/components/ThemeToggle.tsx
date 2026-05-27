import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@phosphor-icons/react";
import { getInitialTheme } from "src/utils/getInitialTheme";

export { getInitialTheme };

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
