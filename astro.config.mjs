// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";
import siteEditor from "./editor/integration.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://zapiltar-e7.github.io",
  integrations: [tailwind(), react(), siteEditor()],
  vite: {
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },
  output: "static",
  build: {
    inlineStylesheets: "auto",
  },
  server: {
    host: true,
    port: 4321,
  },
});
