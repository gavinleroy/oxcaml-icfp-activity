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
    COMMIT_HASH: JSON.stringify("8d2c8953f2124211d85f17f2219e5a104a9e2a7d"),
    "process.env.NODE_ENV": JSON.stringify(mode)
  },
  test: {
    environment: "jsdom",
    deps: {
      inline: [/^(?!.*vitest).*$/]
    }
  }
}));
