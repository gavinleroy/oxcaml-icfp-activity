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
    COMMIT_HASH: JSON.stringify("dca112bebdbd121bb2545c47304ccefa74dd83d1"),
    "process.env.NODE_ENV": JSON.stringify(mode)
  },
  test: {
    environment: "jsdom",
    deps: {
      inline: [/^(?!.*vitest).*$/]
    }
  }
}));
