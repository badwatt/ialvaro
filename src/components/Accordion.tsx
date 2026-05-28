import { useState } from "react";
import { CaretDownIcon } from "@phosphor-icons/react";

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
};

type Props = {
  items: Item[];
  defaultOpenId?: string;
  timeline?: boolean;
};

export const Accordion = ({ items, defaultOpenId, timeline }: Props) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className={timeline ? "relative pl-10" : "space-y-3"}>
      {timeline && (
        <div className="absolute left-4 top-6 bottom-6 w-px bg-alvaro-border" />
      )}
      {items.map((item) => {
        const isOpen = openId === item.id;
        const card = (
          <div
            className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${
              isOpen
                ? "border-alvaro-primary/30 bg-alvaro-surface"
                : "border-alvaro-border hover:border-alvaro-muted"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
            >
              <div>
                <span className="text-xl font-semibold text-alvaro-white">{item.title}</span>
                {item.subtitle && (
                  <p className="text-sm text-alvaro-muted mt-1 font-mono tabular-nums">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <CaretDownIcon
                size={20}
                weight="bold"
                className={`text-alvaro-muted transition-transform duration-300 shrink-0 ml-4 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              id={`accordion-content-${item.id}`}
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6">{item.content}</div>
            </div>
          </div>
        );
        return timeline ? (
          <div key={item.id} className="relative mb-6">
            <div className="absolute -left-[29px] top-[26px] w-2.5 h-2.5 rounded-full bg-alvaro-accent ring-[3px] ring-alvaro-base" />
            {card}
          </div>
        ) : (
          <div key={item.id}>{card}</div>
        );
      })}
    </div>
  );
};
