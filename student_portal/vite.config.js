import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "https://hire-stream-backend.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
