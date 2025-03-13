import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

export const limit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 5
});

// TODO: test delay values
export const slow = slowDown({
    windowMs: 10 * 60 * 1000,
    delayAfter: 10,
    delayMs: () => 200
});
