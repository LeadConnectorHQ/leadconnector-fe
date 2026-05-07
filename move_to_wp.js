import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function copyFile(src, dest, label) {
    fs.copyFile(
        path.resolve(__dirname, src),
        path.resolve(dest),
        (err) => {
            if (err) {
                console.error(`[move_to_wp] Failed to copy ${label}:`, err.message);
            } else {
                console.log(`[move_to_wp] Copied ${label}`);
            }
        }
    );
}

function copyFiles(basePath) {
    copyFile("./dist/app.js",  path.join(basePath, "admin/app.js"),  "app.js");
    copyFile("./dist/app.css", path.join(basePath, "admin/app.css"), "app.css");
}

export default copyFiles;
