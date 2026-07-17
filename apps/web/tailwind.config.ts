/**
 * Tailwind CSS v4 is configured primarily via CSS (`@import "tailwindcss"`).
 * HeroUI styles ship in `@heroui/styles`. This file is kept for tooling
 * that still looks for a config path; content is auto-scanned by TW4.
 */
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/styles/dist/**/*.{js,ts,jsx,tsx,css}",
  ],
} satisfies Config;
