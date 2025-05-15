import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 80, // Définit le port 80 pour le serveur de développement
    host: true, // Permet d'écouter sur toutes les interfaces réseau (0.0.0.0)
  },
});
