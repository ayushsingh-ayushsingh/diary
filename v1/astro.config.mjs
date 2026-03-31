// @ts-check

import tailwindcss from "@tailwindcss/vite"
import { defineConfig, fontProviders } from "astro/config"
import remarkToc from "remark-toc"
import rehypePresetMinify from "rehype-preset-minify"
import react from "@astrojs/react"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import mdx from "@astrojs/mdx"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    rehypePlugins: [rehypeHeadingIds],
    syntaxHighlight: "prism",
    remarkPlugins: [remarkToc],
    gfm: true,
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
  integrations: [
    react(),
    mdx({
      syntaxHighlight: "shiki",
      shikiConfig: { theme: "dracula" },
      remarkPlugins: [remarkToc],
      rehypePlugins: [rehypePresetMinify],
      remarkRehype: { footnoteLabel: "Footnotes" },
      gfm: false,
    }),
  ],
  output: "server",
})
