// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"
import react from "@astrojs/react"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "Quicksand",
        cssVariable: "--font-content",
      },
      {
        provider: fontProviders.fontsource(),
        name: "Playfair Display",
        cssVariable: "--font-heading",
      },
    ],
  },
  integrations: [react()],
})
