import { useState, useEffect, useRef } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import { ThemeToggle } from "src/components/ThemeToggle";

const links = [
  { label: "Home", route: "home" },
  { label: "About", route: "about" },
  { label: "Skills", route: "skills" },
  { label: "Experience", route: "experience" },
  { label: "Portfolio", route: "portfolio" },
  { label: "Contact", route: "contact" },
];

export const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const scroller = (id: string) => {
    document.getElementById(`${id}-nav`)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? "bg-alvaro-base/80 backdrop-blur-xl border-b border-alvaro-primary/10 shadow-[0_1px_0_0_rgba(91,155,213,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            type="button"
            onClick={() => {
              scroller("home");
              if (isOpen) setIsOpen(false);
            }}
            className="text-lg font-bold tracking-[-0.03em] text-alvaro-white hover:text-alvaro-primary transition-colors duration-300 cursor-pointer"
          >
            AM
          </button>

          {/* Desktop — refined pill nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ label, route }) => (
              <button
                key={route}
                type="button"
                onClick={() => scroller(route)}
                className="group relative px-3.5 py-2 text-[13px] font-medium text-alvaro-muted rounded-lg cursor-pointer hover:text-alvaro-white transition-all duration-300 active:scale-[0.97]"
                aria-label={`${label}-desktop`}
              >
                {label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-alvaro-primary scale-0 group-hover:scale-100 transition-transform duration-300" />
              </button>
            ))}
          </div>

          <ThemeToggle />

          {/* Mobile */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-lg text-alvaro-white hover:text-alvaro-primary transition-colors duration-200"
              aria-label="menu-mobile"
              aria-expanded={isOpen}
            >
              {isOpen ? <XIcon size={24} weight="bold" /> : <ListIcon size={24} weight="bold" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-alvaro-primary/10 bg-alvaro-base/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-0.5">
            {links.map(({ label, route }, i) => (
              <button
                key={route}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  scroller(route);
                }}
                className="block w-full px-4 py-2.5 text-sm font-medium text-alvaro-muted rounded-lg hover:text-alvaro-white hover:bg-alvaro-primary/5 transition-all duration-200 text-left active:scale-[0.98]"
                style={{ transitionDelay: `${i * 30}ms` }}
                aria-label={`${label}-mobile`}
              >
                <span className="text-alvaro-primary/40 mr-2">0{i + 1}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
