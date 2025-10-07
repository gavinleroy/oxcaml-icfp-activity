import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: "./",
  build: {
    target: "ES2022",
    lib: {
      name: "Telemetry",
      entry: resolve(__dirname, "src/lib.ts"),
      formats: ["iife"]
    }
  },
  define: {
    TELEMETRY_URL: JSON.stringify("http://oxcaml-tutorial.gavinleroy.com/log"),
    "process.env.NODE_ENV": JSON.stringify(mode)
  }
}));
