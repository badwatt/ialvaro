import node from "@astrojs/node";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwind()],
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
