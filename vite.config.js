import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  // ⚙️ Tambahkan define agar tidak error di Netlify (process undefined)
  define: {
    "process.env": {},
    global: {},
  },

  optimizeDeps: {
    include: [
      "proj4",
      "leaflet",
      "georaster",
      "georaster-layer-for-leaflet",
    ],
  },

  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("leaflet")) return "leaflet";
            if (id.includes("proj4")) return "proj4";
            if (id.includes("georaster")) return "georaster";
          }
        },
      },
    },
  },

  // 🧱 Pastikan base URL benar di Netlify
  base: "./",

  // 🚫 Cache busting
  server: {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    },
  },
});
