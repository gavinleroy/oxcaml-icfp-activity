import fs from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

let manifest = JSON.parse(fs.readFileSync("package.json", "utf-8"));
export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "Telemetry2",
      formats: ["iife"]
    },
    rollupOptions: {
      external: Object.keys(manifest.dependencies || {})
    }
  },
  define: {
    TELEMETRY_URL: JSON.stringify("https://oxcaml-tutorial.gavinleroy.com"),
    BRANCH: JSON.stringify("main"),
    COMMIT_HASH: JSON.stringify("d4c2bc57dad4a44d08e66a99a0b8a2ed7aa3137e"),
    "process.env.NODE_ENV": JSON.stringify(mode)
  },
  test: {
    environment: "jsdom",
    deps: {
      inline: [/^(?!.*vitest).*$/]
    }
  }
}));
