import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";
import path from "node:path";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "happy-dom",
      setupFiles: ["__tests__/setup.ts"],
      projects: [
        {
          extends: true,
          test: {
            environment: "happy-dom",
          },
        },
      ],
      alias: {
        src: path.resolve(__dirname, "./src"),
      },
      fakeTimers: {
        toFake: [
          "setTimeout",
          "clearTimeout",
          "setInterval",
          "clearInterval",
          "setImmediate",
          "clearImmediate",
          "Date",
        ],
      },
      coverage: {
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/data/**", "src/env.d.ts", "src/utils/content.ts", ".astro/**"],
      },
    },
  }),
);
