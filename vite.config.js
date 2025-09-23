import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
    plugins: [react(), viteStaticCopy({
        targets: [
            { src: "manifest.json", dest: "." },
            { src: "option.js", dest: "." },            
            { src: "background.js", dest: "." },
            { src: "popup.html", dest: "." },
            { src: "popup.js", dest: "." },
        ]
    })],
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                options: "options.html"
            }
        }
    }
});
