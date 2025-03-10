import { initUser } from "./utils/user.ts";

export default defineBackground({
    persistent: true,
    main() {
        // TODO: nothing stopping users from editing localStorage shop.unlocked
        //       NEVERMIND: remember to double-check shop data from every user edit

        // first install
        // TODO: what if server isn't online/available?
        browser.runtime.onInstalled.addListener(async ({ reason }) => {
            if (reason === "install") {
                console.log("extension installed");
                const ok = await initUser();
            }
        });

        console.log("hello from background.ts!", { id: browser.runtime.id });
        // TODO: dynamically load customisation options from server? so new hats don't need an extension update.
        // TODO: remember to sanitise data just in case
    },
});