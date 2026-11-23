import { defineConfig } from "vite";

// Aprende vive en /aprende/ del sitio (Firebase Hosting, C20). Las muestras de guitarra son las del playground.
// `VITE_FIREBASE_API_KEY` es la llave pública del navegador (la define el pipeline, desde una variable de GitHub).
export default defineConfig({
  base: process.env.APRENDE_BASE ?? "/aprende/",
  publicDir: "../playground/public",
});
