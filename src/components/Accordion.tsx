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
};

export const Accordion = ({ items, defaultOpenId }: Props) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
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
      })}
    </div>
  );
};
