import { defineConfig } from "wxt";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
    manifest: {
        permissions: [
            "storage",
            "notifications",
            "tabs",
            "alarms"
        ]
    },
    srcDir: "src",
    extensionApi: "chrome",
    modules: ["@wxt-dev/module-react"],
    vite: () => ({
        plugins: [tailwindcss()],
    }),
    runner: {
        keepProfileChanges: true,
        chromiumProfile: resolve(".wxt/chrome-data")
    }
});
