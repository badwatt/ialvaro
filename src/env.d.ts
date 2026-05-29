import "../.astro/types.d.ts";
/// <reference types="astro/client" />

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "cap-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
