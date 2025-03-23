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

const userItem = storage.defineItem<User>("local:user")

export async function saveUser(user: User) {
    await userItem.setValue(user)
}

export async function loadUser(): Promise<[boolean, User | null]> {
    const user = await userItem.getValue();
    if (!user) return [false, null];
    return [true, user];
}

export async function register(): Promise<boolean> {
    const response = await fetch("http://localhost:3002/api/register", {
        method: "POST"
    });

    if (!response.ok) return false;

    const json = await response.json();
    console.log(json);
    await userItem.setValue({
        auth: { uuid: json.user._id, key: json.unhashedKey },
        stats: json.user.stats,
        profile: json.user.profile,
        room: json.user.room,
        shop: json.user.shop
    });
    console.log("user initialised");
    return true;
}

// wrapper function that every response containing the user's own data is passed through
export async function verifyShop(json: any): Promise<void> {
    await browser.storage.local.set({
        shop: json.shop
    });
}