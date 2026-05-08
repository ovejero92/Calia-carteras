import { db } from "../firebase/admin.js";
import admin from "../firebase/admin.js";
import * as saleService from "./sale.service.js";

const COLL = "order_idempotency";

function sanitizeKey(raw) {
    const s = String(raw || "").trim().slice(0, 200);
    if (!s || s.length < 8) return null;
    return s.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
}

function isAlreadyExists(err) {
    return err?.code === 6 || err?.code === "already-exists" || String(err?.message || "").includes("ALREADY_EXISTS");
}

/**
 * Crea venta con deduplicación: header Idempotency-Key o body.idempotencyKey (mín. 8 caracteres).
 * Sin clave válida, delega en createSale normal.
 */
export async function createPublicOrderIdempotent(saleData, { idempotencyKey, source = "public_api" } = {}) {
    if (!db) {
        const order = await saleService.createSale(saleData, { source });
        return { order, idempotentReplay: false };
    }

    const key = sanitizeKey(idempotencyKey);
    if (!key) {
        const order = await saleService.createSale(saleData, { source });
        return { order, idempotentReplay: false };
    }

    const ref = db.collection(COLL).doc(key);
    const pre = await ref.get();
    if (pre.exists && pre.data()?.orderId) {
        const order = await saleService.getSaleById(pre.data().orderId);
        if (order) return { order, idempotentReplay: true };
    }

    try {
        await ref.create({
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
        });
    } catch (e) {
        if (isAlreadyExists(e)) {
            const snap = await ref.get();
            const oid = snap.data()?.orderId;
            if (oid) {
                const order = await saleService.getSaleById(oid);
                if (order) return { order, idempotentReplay: true };
            }
            throw new Error("Pedido en proceso. Reintentá en unos segundos.");
        }
        throw e;
    }

    try {
        const order = await saleService.createSale(saleData, { source });
        await ref.update({
            orderId: order.id,
            status: "completed",
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { order, idempotentReplay: false };
    } catch (err) {
        await ref.delete().catch(() => {});
        throw err;
    }
}
