import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import eslintPlugin from "vite-plugin-eslint";


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue()
    // eslintPlugin({
    //   cache: false,
    //   include: ['src/**/*.ts', 'src/**/*.vue']
    // })
  ],
  server: {
    port: 80, // Définit le port 80 pour le serveur de développement
    host: true, // Permet d'écouter sur toutes les interfaces réseau (0.0.0.0)
  },
  resolve: {
    extensions: ['.vue', '.js', '.ts', '.jsx', '.tsx', '.json']
  }
});
