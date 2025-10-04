import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Must match repo name for GitHub Pages
  base: "/ALLUVO/"
});
