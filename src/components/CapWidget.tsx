import { useEffect, useRef } from "react";

interface CapWidgetProps {
  onVerified: (token: string) => void;
  name?: string;
}

export const CapWidget = ({ onVerified, name = "cap-token" }: CapWidgetProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = "cap-widget-script";
    let script: HTMLScriptElement | null = null;
    if (!document.getElementById(scriptId)) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/npm/cap-widget";
      script.async = true;
      document.body.appendChild(script);
    }

    let cancelled = false;
    const input = ref.current?.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;

    const attach = () => {
      if (cancelled) return;
      const el = ref.current?.querySelector("cap-widget");
      if (!el) return;
      const handler = (e: Event) => {
        const token = (e as CustomEvent).detail?.token;
        if (token) {
          if (input) input.value = token;
          onVerified(token);
        }
      };
      el.addEventListener("solve", handler);
    };

    if (window.customElements?.get("cap-widget")) {
      attach();
    } else {
      window.customElements?.whenDefined("cap-widget").then(attach);
    }

    return () => {
      cancelled = true;
    };
  }, [onVerified, name]);

  const endpoint = `${import.meta.env.PUBLIC_CAP_URL}/${import.meta.env.PUBLIC_CAP_SITE_KEY}/`;

  return (
    <div ref={ref}>
      <cap-widget data-cap-api-endpoint={endpoint} />
      <input type="hidden" name={name} />
    </div>
  );
};
