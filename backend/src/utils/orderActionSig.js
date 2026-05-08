import crypto from "crypto";

/**
 * HMAC para enlaces "Aceptar / Rechazar" del mail.
 * Si ORDER_ACTION_SECRET no está definido, verifyOrderAction devuelve true (compat. despliegues viejos).
 */
export function signOrderAction(orderId, action) {
    const secret = process.env.ORDER_ACTION_SECRET;
    if (!secret) return "";
    return crypto
        .createHmac("sha256", secret)
        .update(`${orderId}:${action}`)
        .digest("hex");
}

export function verifyOrderAction(orderId, action, sig) {
    const secret = process.env.ORDER_ACTION_SECRET;
    if (!secret) {
        console.warn("[orderActionSig] ORDER_ACTION_SECRET no configurado: enlaces de mail sin firma");
        return true;
    }
    if (!sig || typeof sig !== "string") return false;
    const expected = signOrderAction(orderId, action);
    try {
        const aBuf = Buffer.from(expected, "hex");
        const bBuf = Buffer.from(sig, "hex");
        if (aBuf.length !== bBuf.length) return false;
        return crypto.timingSafeEqual(aBuf, bBuf);
    } catch {
        return false;
    }
}
