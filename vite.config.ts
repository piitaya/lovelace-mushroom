import browserslistToEsbuild from "browserslist-to-esbuild";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: browserslistToEsbuild(),
    minify: "terser",
    lib: {
      entry: "src/mushroom.ts",
      formats: ["es"],
      fileName: () => "mushroom.js",
    },
    rollupOptions: {
      output: {
        codeSplitting: false,
      },
      onwarn(warning, warn) {
        if (
          warning.code === "CIRCULAR_DEPENDENCY" &&
          warning.ids?.some((id) => id.includes("node_modules/culori"))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  preview: {
    port: 4000,
    host: "0.0.0.0",
    cors: true,
  },
});
