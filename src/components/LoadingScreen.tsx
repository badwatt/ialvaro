import { useEffect, useState } from "react";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("ialvaro-visited");
    if (hasVisited) {
      setIsVisible(false);
      return;
    }

    const exitTimer = setTimeout(() => setIsExiting(true), 1800);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("ialvaro-visited", "true");
    }, 2400);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("ialvaro-visited", "true");
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      aria-label="loading-screen"
      onClick={handleSkip}
      onKeyDown={handleSkip}
      role="button"
      tabIndex={0}
      className={`fixed inset-0 z-[100] bg-alvaro-base flex items-center justify-center cursor-pointer transition-all duration-500 ${
        isExiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      <div className="relative">
        {/* Glow */}
        <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 bg-alvaro-primary/20 blur-[80px] rounded-full animate-[pulse-glow_2s_ease-in-out_infinite]" />
        <h1 className="relative text-7xl md:text-8xl font-bold tracking-[-0.06em] text-alvaro-white animate-[scaleIn_0.6s_ease-out]">
          AM
        </h1>
      </div>
      <p className="absolute bottom-12 text-xs text-alvaro-muted/50 tracking-widest uppercase">
        Click to skip
      </p>
    </div>
  );
};
