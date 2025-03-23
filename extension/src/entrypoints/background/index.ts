import { onMessage } from "webext-bridge/background";
import { io } from "socket.io-client";
import * as u from "./utils/user";

export default defineBackground({
    persistent: true,
    main() {
        let user: u.User;

        // first install
        browser.runtime.onInstalled.addListener(async ({ reason }: any) => {
            if (reason === "install") {
                console.log("extension installed");
                let ok;
                [user, ok] = await u.register() as [u.User, boolean];  // FIX
            }
        });

        // messages
        onMessage("set-profile", ({ profile }: any) => {  // FIX
            user.profile = profile;
            u.save(user);
        });

        console.log("hello from background.ts!", { id: browser.runtime.id });
    },
});