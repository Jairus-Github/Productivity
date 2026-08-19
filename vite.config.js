import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the built asset paths work when served from a GitHub Pages
// project site (https://<user>.github.io/<repo>/) instead of the domain root.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
