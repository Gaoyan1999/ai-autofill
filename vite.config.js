import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

// Custom plugin to watch copied files
function watchCopiedFiles() {
    return {
        name: 'watch-copied-files',
        buildStart() {
            const filesToWatch = [
                "manifest.json",
                "option.js",
                "background.js",
                "popup.html",
                "popup.js"
            ];

            filesToWatch.forEach(file => {
                this.addWatchFile(path.resolve(file));
            });
        }
    };
}

export default defineConfig({
    plugins: [
        react(),
        watchCopiedFiles(),
        viteStaticCopy({
            targets: [
                { src: "manifest.json", dest: "." },
                { src: "option.js", dest: "." },
                { src: "background.js", dest: "." },
                { src: "popup.html", dest: "." },
                { src: "popup.js", dest: "." },
                { src: "icons/*", dest: "icons" },
            ]
        })
    ],
    build: {
        outDir: "dist",
        rollupOptions: {
            input: {
                options: "options.html"
            }
        }
    }
});
