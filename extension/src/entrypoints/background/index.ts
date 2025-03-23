import * as u from "./utils/user";

export default defineBackground({
    persistent: true,
    main() {
        // first install
        // TODO: what if server isn't online/available?
        // TODO: remember to change urls from localhost
        browser.runtime.onInstalled.addListener(async ({ reason }: any) => {
            if (reason === "install") {
                console.log("extension installed");
                const ok = await u.register();
            }
        });

        console.log("hello from background.ts!", { id: browser.runtime.id });
    },
});