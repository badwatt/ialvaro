import { useEffect, useRef } from "react";

export function setupGlow(glow: HTMLDivElement | null): (() => void) | undefined {
  if (!glow) return;

  let rafId: number;
  const handleMouseMove = (e: MouseEvent) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      glow.style.transform = `translate(${e.clientX - 250}px, ${e.clientY - 250}px)`;
    });
  };

  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    cancelAnimationFrame(rafId);
  };
}

export const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = setupGlow(glowRef.current);
    return cleanup;
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      aria-label="cursor-glow"
      className="hidden md:block fixed w-[500px] h-[500px] rounded-full pointer-events-none z-20 blur-[120px] bg-alvaro-primary/10"
      style={{ top: 0, left: 0, willChange: "transform" }}
    />
  );
};