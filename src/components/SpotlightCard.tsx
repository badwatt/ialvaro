import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";

export function setupSpotlight(card: HTMLDivElement | null): (() => void) | undefined {
  if (!card) return;

  const handleMouseMove = (e: MouseEvent) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  card.addEventListener("mousemove", handleMouseMove, { passive: true });
  return () => card.removeEventListener("mousemove", handleMouseMove);
}

export const SpotlightCard = ({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = setupSpotlight(cardRef.current);
    return cleanup;
  }, []);

  return (
    <div ref={cardRef} className={`spotlight-card ${className}`} style={style}>
      {children}
    </div>
  );
};
