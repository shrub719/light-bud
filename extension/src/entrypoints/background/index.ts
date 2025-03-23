import * as u from "./utils/user";

export default defineBackground({
    persistent: true,
    main() {
        let user: u.User | null;
        // first install
        browser.runtime.onInstalled.addListener(async ({ reason }: any) => {
            if (reason === "install") {
                console.log("extension installed");
                let ok;
                [user, ok] = await u.register();
            }
        });

        console.log("hello from background.ts!", { id: browser.runtime.id });
    },
});