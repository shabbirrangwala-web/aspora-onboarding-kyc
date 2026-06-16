import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: false,
    target: "es2017",
    lib: {
      entry: resolve(__dirname, "src/main/code.ts"),
      formats: ["iife"],
      name: "code",
      fileName: () => "code.js",
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
        extend: true,
      },
    },
    sourcemap: false,
    minify: "esbuild",
  },
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@foundations": resolve(__dirname, "../../foundations"),
    },
  },
});
