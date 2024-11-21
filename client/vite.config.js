// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import process from "process";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      process: resolve(__dirname, "node_modules/process/browser"),
    },
  },
});
