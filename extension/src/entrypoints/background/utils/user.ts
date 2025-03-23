import { storage } from "wxt/storage";

interface Auth {
    uuid: string,
    key: string
}

interface Stats {
    focusHours: number
}

interface Profile {
    username: string,
    icon: [string, string]
}

interface Shop {
    unlocked: string[]
}

export interface User {
    auth: Auth
    stats: Stats,
    profile: Profile,
    room: string,
    shop: Shop,
}

const userItem = storage.defineItem<User>("local:user");

export async function save(user: User) {
    await userItem.setValue(user);
}

export async function load(): Promise<[User, boolean]> {
    const user = await userItem.getValue();
    if (!user) return [null as unknown as User, false];
    return [user, true];
}

// TODO: what if server isn't online/available?
// TODO: remember to change urls from localhost
export async function register(): Promise<[User, boolean]> {
    const response = await fetch("http://localhost:3002/api/register", {
        method: "POST"
    });

    if (!response.ok) return [null as unknown as User, false];

    const json = await response.json();
    console.log(json);
    const user = {
        auth: { uuid: json.user._id, key: json.unhashedKey },
        stats: json.user.stats,
        profile: json.user.profile,
        room: json.user.room,
        shop: json.user.shop
    };
    await userItem.setValue(user);
    console.log("user initialised");
    return [user, true];
}
