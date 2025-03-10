export async function initUser(): Promise<boolean> {
    const response = await fetch("http://localhost:3002/api/users/create", {
        method: "POST"
    });

    if (!response.ok) return false;

    const json = await response.json();
    console.log(json);
    await browser.storage.local.set({
        uuid: json.user.uuid,
        key: json.unhashedKey,
        stats: json.user.stats,
        profile: json.user.profile,
        shop: json.user.shop
    });
    console.log("user initialised");
    return true;
}

// TODO: is this a good idea? to reset it every time it's passed to a server?
// TODO: make a typescript type for the user object?
// wrapper function that every response containing the user's own data is passed through
export async function verifyShop(json: any): Promise<void> {
    await browser.storage.local.set({
        shop: json.shop
    });
}