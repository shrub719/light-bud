import { Server } from "socket.io";
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

export function sessionName(name: string, ioInstance: Server): string {
    if (!ioInstance.sockets.adapter.rooms.has(name)) return "session-doesNotExist"
    return "";
}

export function usrname(username: string) {
    // allow only alphanumeric characters and underscores
    const regex = /^[a-zA-Z0-9_ ]+$/;
    return regex.test(username);
}

export function edits(edits: any): string {
    if (!edits) return "edit-noEdits";
    if (edits.stats) {
        if (!edits.stats.focusHours) return "stats-badStats";
    }
    if (edits.profile) {
        const username = edits.profile.username;
        const icon = edits.profile.icon
        if (!username) return "profile-noUsername";
        if (matcher.hasMatch(username)) return "profile-badLanguage";
        if (!(1 <= username.length && username.length <= 20)) return "profile-usernameLength";
        if (!usrname(username)) return "profile-specialCharacters";
        if (!icon) return "profile-noIcon";
        if (icon.length !== 2) return "profile-badIcon";
        const [type, colour] = icon;
        if (!validIconTypes.includes(type)) return "profile-badIconType";
        if (!validIconColours.includes(colour)) return "profile-badIconColour";
    }
    return "";
}

export function sessionId(id: string): boolean {
    return /^[0-9a-f]{16}$/.test(id);
}

export function sessionData(session: any, hasId=true): string {
    if (!session) return "session-noSession";
    if (typeof session.start !== "number" || typeof session.end !== "number") return "session-badSession";
    if (hasId && !sessionId(session.id)) return "session-invalidId"
    return "";
}