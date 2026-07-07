import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any fetch to /api/... in the frontend gets forwarded to the backend
      "/api": "http://localhost:4000",
    },
  },
});
