const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

export const Footer = () => {
  return (
    <footer className="relative border-t border-alvaro-primary/10 mt-32 md:mt-48">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-alvaro-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] mb-3 text-alvaro-white">
              Alvaro Garcia Macias
            </h3>
            <p className="text-sm text-alvaro-muted leading-relaxed max-w-[30ch]">
              Full Stack Developer building interfaces that move.
            </p>
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-6">
              <div className="w-1 h-1 rounded-full bg-alvaro-primary/60" />
              <div className="w-1 h-1 rounded-full bg-alvaro-muted/30" />
              <div className="w-1 h-1 rounded-full bg-alvaro-muted/30" />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-alvaro-muted/50 mb-5">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {navItems.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-alvaro-muted hover:text-alvaro-primary transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs tracking-[0.15em] uppercase text-alvaro-muted/50 mb-5">
              Connect
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/alvaro17f"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-alvaro-muted hover:text-alvaro-primary transition-colors duration-200"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com/in/alvarogarciamacias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-alvaro-muted hover:text-alvaro-primary transition-colors duration-200"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-alvaro-primary/5 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-alvaro-muted/40">
            &copy; {new Date().getFullYear()} Alvaro Garcia Macias
          </p>
          <p className="text-xs text-alvaro-muted/30">Designed &amp; built with intention</p>
        </div>
      </div>
    </footer>
  );
};
