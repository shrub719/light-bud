import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});


const validIconTypes = [  // TODO: update
    "cat-happy",
    "cat-sad",
    "cat-angry"
];
const validIconColours = [
    "red",
    "green",
    "blue",
];


export function roomCode(code: string) {
    // only hexadecimal characters
    const regex = /^[0-9a-f]{32}$/;
    return regex.test(code);
}

export function sessionId(id: string) {
    const regex = /^[0-9a-f]{16}$/
    return regex.test(id);
}

export function usrname(username: string) {
    // allow only alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_ ]+$/;
    return regex.test(username);
}

export function edits(edits: any): string {
    if (!edits) return "edit-noedits";
    if (edits.stats) {
        if (!edits.stats.focusHours) return "stats-badstats";
    }
    if (edits.profile) {
        const username = edits.profile.username;
        const icon = edits.profile.icon
        if (!username) return "profile-nousername";
        if (matcher.hasMatch(username)) return "profile-badlanguage";
        if (!(1 <= username.length && username.length <= 20)) return "profile-usernamelength";
        if (!usrname(username)) return "profile-specialcharacters";
        if (!icon) return "profile-noicon";
        if (icon.length !== 2) return "profile-badicon";
        const [type, colour] = icon;
        if (!validIconTypes.includes(type)) return "profile-badtype";
        if (!validIconColours.includes(colour)) return "profile-badcolour";
    }
    return "";
}