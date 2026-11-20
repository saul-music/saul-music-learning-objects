import { defineConfig } from "vite";

// Rutas relativas: el mismo build sirve en local y en GitHub Pages (/<repo>/).
export default defineConfig({ base: "./" });
