import rateLimit from "express-rate-limit";

const message = "Demasiados intentos. Esperá unos minutos y volvé a intentar.";

export const registerPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
});

export const ordersPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
});
