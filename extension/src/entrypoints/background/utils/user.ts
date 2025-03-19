export async function register(): Promise<boolean> {
    const response = await fetch("http://localhost:3002/api/register", {
        method: "POST"
    });

    if (!response.ok) return false;

    const json = await response.json();
    console.log(json);
    await browser.storage.local.set({
        uuid: json.user._id,
        key: json.unhashedKey,
        stats: json.user.stats,
        profile: json.user.profile,
        room: json.user.room,
        shop: json.user.shop
    });
    console.log("user initialised");
    return true;
}

// TODO: make a typescript type for the user object?
// wrapper function that every response containing the user's own data is passed through
export async function verifyShop(json: any): Promise<void> {
    await browser.storage.local.set({
        shop: json.shop
    });
}