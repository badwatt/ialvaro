import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  integrations: [react()],

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Outfit",
      cssVariable: "--font-outfit",
      weights: ["100 900"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains",
      weights: ["100 800"],
    },
  ],

  vite: {
    plugins: [tailwind()],
    optimizeDeps: {
      include: ["jspdf"],
    },
  },

  server: {
    port: 4321,
    host: true,
    allowedHosts: ["zenon.lan"],
  },

  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
