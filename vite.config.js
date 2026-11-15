import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  base: "/GreenSpore-FARMS/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        home: resolve(root, "home.html"),
        about: resolve(root, "about.html"),
        mushrooms: resolve(root, "mushrooms.html"),
        "business-plan": resolve(root, "business-plan.html"),
        infrastructure: resolve(root, "infrastructure.html"),
      },
    },
  },
});
