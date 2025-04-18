import { onMessage } from "webext-bridge/background";
import { io } from "socket.io-client";
import * as u from "./utils/user";

export default defineBackground({
    persistent: true,
    main() {
        // extension starts
        let user: u.User;
        u.load().then((value) => {
            user = value[0];
            console.log(user);  // TODO: what happens when user is null?
        });


        // first install
        browser.runtime.onInstalled.addListener(async ({ reason }: any) => {
            if (reason === "install") {
                console.log("extension installed");
                let ok;
                [user, ok] = await u.register();
            }
        });


        // messages
        onMessage("set-profile", ({ profile }: any) => {  // FIX
            user.profile = profile;
            u.save(user);
        });


        // ws
        

        console.log("hello from background.ts!", { id: browser.runtime.id });
    },
});